// plugins/_autokick-te-elimino.js
import fs from 'fs';
import path from 'path';

const DB = path.resolve('./adminWarnings.json');
if (!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({}), 'utf-8');

const readDB = () => {
  try { return JSON.parse(fs.readFileSync(DB, 'utf-8')); }
  catch { return {}; }
};
const writeDB = (data) => fs.writeFileSync(DB, JSON.stringify(data, null, 2), 'utf-8');

let lastCommonIndex = -1;
let lastOwnerIndex = -1;

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return;

    // Solo actuamos si el mensaje coincide exactamente con "Te eliminó" (con o sin punto)
    const text = (m.text || '').trim();
    if (!/^te\s*eliminó\.?$/i.test(text)) return;

    const chatId = m.chat;
    const whoJid = m.sender;
    const who = whoJid.split('@')[0];

    const owners = ['59898719147','59896026646']; // owners (sin @)
    const ownersJids = owners.map(n => `${n}@s.whatsapp.net`);

    // Si es owner -> ignorado (no se actúa)
    if (owners.includes(who)) {
      // opcional: enviar un mensaje corto (comenta si no querés)
      // return conn.sendMessage(chatId, { text: `👌 @${who} podés usarlo si querés.`, mentions: [whoJid] });
      return; // dejamos completamente ignorado
    }

    // obtener metadata y verificar si es admin
    const groupMetadata = await conn.groupMetadata(chatId);
    const participant = (groupMetadata.participants || []).find(p => p.id === whoJid);
    const isAdmin = !!participant?.admin;

    // Frases
    const frasesComunes = [
      `@${who} — sos terrible ganso, afuera 😹`,
      `@${who} — payaso detectado, andá a dormir 😎`,
      `@${who} — fuera, no molestes 😏`,
      `@${who} — rajá de acá 😜`,
      `@${who} — te vas a comer un kick 😈`
    ];

    const frasesAdmins = [
      `@${who}, ⚠️ Una más y te quedás sin admin 😈`,
      `@${who}, ⚠️ Si lo repetís, te saco el admin. 😈`
    ];

    const frasesOwners = [
      `@${who}, tranquilo capo, vos mandás acá 😎`,
      `@${who}, dueño detectado, siga nomás 😏`
    ];

    // ADMIN: advertencia 1 -> aviso público; 2 -> le quita el admin
    if (isAdmin) {
      // DB por chat -> warnings[chatId][user]
      const db = readDB();
      if (!db[chatId]) db[chatId] = {};
      const userWarnings = db[chatId][who] || 0;

      if (userWarnings < 1) {
        // primera advertencia
        db[chatId][who] = 1;
        writeDB(db);

        const idx = Math.floor(Math.random() * frasesAdmins.length);
        return conn.sendMessage(chatId, {
          text: frasesAdmins[idx],
          mentions: [whoJid]
        });
      } else {
        // segunda vez -> quitar admin
        // resetear contador
        db[chatId][who] = 0;
        writeDB(db);

        try {
          await conn.groupParticipantsUpdate(chatId, [whoJid], 'demote');
        } catch (errDemote) {
          console.error('Error demoting admin:', errDemote);
          // si falla, avisamos
          await conn.sendMessage(chatId, { text: `❌ No pude quitarle el admin a @${who}.`, mentions: [whoJid] });
          return;
        }

        // mensaje público y reacción al mensaje original
        await conn.sendMessage(chatId, {
          text: `😈 Te advertí — @${who} perdió su rango de admin.`,
          mentions: [whoJid]
        });

        // intentar reaccionar al mensaje con emoji (si la API lo soporta)
        try {
          await conn.sendMessage(chatId, { react: { text: '😈', key: m.key } });
        } catch (e) {
          // alternativa (por si la reacción falla), enviar pequeña nota visual
          try { await conn.sendMessage(chatId, { text: '🔥', quoted: m }); } catch {}
        }

        return;
      }
    }

    // USUARIO COMÚN: kick inmediato
    if (!isAdmin) {
      // elegir frase no repetida seguida
      let idx;
      do idx = Math.floor(Math.random() * frasesComunes.length);
      while (idx === lastCommonIndex);
      lastCommonIndex = idx;

      try {
        await conn.groupParticipantsUpdate(chatId, [whoJid], 'remove');
      } catch (errKick) {
        console.error('Error al kickear usuario:', errKick);
        // si no pudo kickear, avisar
        await conn.sendMessage(chatId, { text: `❌ No pude expulsar a @${who}.`, mentions: [whoJid] });
        return;
      }

      // luego el mensaje gracioso
      await conn.sendMessage(chatId, { text: frasesComunes[idx], mentions: [whoJid] });
      return;
    }

  } catch (err) {
    console.error('Error en _autokick-te-elimino:', err);
  }
};

// Solo actúa si el texto es exactamente "Te eliminó" (con o sin punto), case-insensitive
handler.customPrefix = /^te\s*eliminó\.?$/i;
handler.command = new RegExp();
handler.group = true;

export default handler;

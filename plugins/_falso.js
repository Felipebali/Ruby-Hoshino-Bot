// 📂 plugins/falso.js — FelixCat_Bot 🐾
// Detector de números extranjeros y también números +598 (modo prueba)

let handler = async (m, { conn, command }) => {
  const chat = global.db.data.chats[m.chat] || {};

  if (command === 'falso') {
    chat.antiFalso = !chat.antiFalso;
    global.db.data.chats[m.chat] = chat;

    return conn.reply(
      m.chat,
      `🕵️ *Detector de Extranjeros / Desconocidos / Uruguayos*\n` +
      `➡️ Estado: *${chat.antiFalso ? 'ACTIVADO ✅' : 'DESACTIVADO ❌'}*`,
      m
    );
  }
};

handler.command = ['falso'];
handler.group = true;
export default handler;


// 🔥 SISTEMA DE DETECCIÓN AUTOMÁTICO Y EXPULSIÓN
export async function before(m, { conn, isAdmin, isOwner }) {
  try {
    if (!m.isGroup) return;

    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.antiFalso) return;

    const sender = m.sender;
    const numero = sender.replace('@s.whatsapp.net', '');
    const esUruguay = numero.startsWith('598'); // +598

    // 💎 DUEÑOS: NO EXPULSAR
    const owners = ["59898719147", "59896026646"];
    if (owners.includes(numero)) return;

    // 👑 ADMINS: NO EXPULSAR
    if (isAdmin || isOwner) return;

    // Obtener lista de participantes reales
    let group = await conn.groupMetadata(m.chat);
    let participantes = group.participants.map(p => p.id);

    // 💀 SI NO ESTÁ EN LA LISTA DEL GRUPO → EXPULSAR
    if (!participantes.includes(sender)) {
      await conn.sendMessage(m.chat, {
        text:
          `⚠️ *ALERTA: NÚMERO DESCONOCIDO DETECTADO*\n\n` +
          `📱 *${numero}*\n` +
          `Este número NO figura como integrante del grupo y está enviando mensajes.\n` +
          `🚨 Procediendo a expulsar.`
      });

      await conn.groupParticipantsUpdate(m.chat, [sender], "remove");
      return;
    }

    // 💀 EXPULSAR NÚMEROS URUGUAYOS +598 (modo prueba)
    if (esUruguay) {
      await conn.sendMessage(m.chat, {
        text:
          `🟥 *URUGUAYO DETECTADO (+598)*\n` +
          `📱 *${numero}*\n` +
          `Modo prueba: expulsando a usuarios +598.`
      });

      await conn.groupParticipantsUpdate(m.chat, [sender], "remove");
      return;
    }

    // 💀 EXPULSAR NÚMEROS EXTRANJEROS
    if (!esUruguay) {
      await conn.sendMessage(m.chat, {
        text:
          `🌎 *EXTRANJERO DETECTADO (NO +598)*\n` +
          `📱 *${numero}*\n` +
          `Expulsando automáticamente del grupo.`
      });

      await conn.groupParticipantsUpdate(m.chat, [sender], "remove");
      return;
    }

  } catch (e) {
    console.error('Error en plugin falso:', e);
  }
}

// plugins/_autokick-te-elimino.js
import fs from 'fs';
import path from 'path';

let lastCommonIndex = -1;
let lastOwnerIndex = -1;

let handler = async (m, { conn }) => {
    try {
        if (!m.isGroup) return;

        const texto = (m.text || '').trim();
        const who = m.sender.split("@")[0];

        const owners = ['59898719147','59896026646'];

        const frasesComunes = [
            `@${who}, sos terrible ganso, afuera 😹`,
            `@${who}, payaso detectado, andá a dormir 😎`,
            `@${who}, fuera, no molestes 😏`,
            `@${who}, rajá de acá 😜`,
            `@${who}, te vas a comer un kick 😈`
        ];

        const frasesOwners = [
            `@${who}, tranquilo capo, vos mandás acá 😎`,
            `@${who}, dueño supremo detectado, siga nomás 😏`,
            `@${who}, nadie te puede tocar 😇`
        ];

        const frasesAdmins = [
            `@${who}, ⚠️ Aviso: para la próxima podrías perder tu admin.`,
            `@${who}, ⚠️ Cuidado: si insistes, te quitan el admin.`
        ];

        const groupMetadata = await conn.groupMetadata(m.chat);
        const participant = groupMetadata.participants.find(p => p.id.split("@")[0] === who);
        const isAdmin = participant?.admin || false;

        // OWNER
        if (owners.includes(who)) {
            let index;
            do index = Math.floor(Math.random() * frasesOwners.length);
            while (index === lastOwnerIndex);
            lastOwnerIndex = index;
            return conn.sendMessage(m.chat, { text: frasesOwners[index], mentions: [m.sender] });
        }

        // ADMIN
        if (isAdmin) {
            const index = Math.floor(Math.random() * frasesAdmins.length);
            return conn.sendMessage(m.chat, { text: frasesAdmins[index], mentions: [m.sender] });
        }

        // USUARIO COMÚN
        if (!isAdmin && !owners.includes(who)) {
            let index;
            do index = Math.floor(Math.random() * frasesComunes.length);
            while (index === lastCommonIndex);
            lastCommonIndex = index;

            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            await conn.sendMessage(m.chat, { text: frasesComunes[index], mentions: [m.sender] });
        }

    } catch (e) {
        console.error('Error en autokick Te eliminó:', e);
    }
};

// Regex ultra flexible para todas las variantes de “te eliminó”
// Incluye letras cambiadas por números, errores de tipeo, espacios, acentos y mayúsculas
handler.customPrefix = /t[3e]\s*e[l1ií!|]\s*i?m[i1í]n[o0ó]?.?|te\s*elimin[o0ó]n?.?|te\s*echa(ron)?|fuera|raj[aá4]|andate|kick(eado)?|expulsado|sacado|fuera\s*de\s*aca/i;

handler.command = new RegExp();
handler.group = true;

export default handler;

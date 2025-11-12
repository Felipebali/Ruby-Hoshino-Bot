// 📂 plugins/cambios-grupo.js
import { proto } from '@whiskeysockets/baileys';

let handler = async (m, { conn, command, isAdmin }) => {
  const chat = global.db.data.chats[m.chat] || {};
  chat.cambios = chat.cambios === true ? false : true; // alternar
  global.db.data.chats[m.chat] = chat;

  // Aviso automático de activación/desactivación
  const estado = chat.cambios ? '✅ *Monitor de cambios activado*' : '❌ *Monitor de cambios desactivado*';
  await conn.sendMessage(
    m.chat,
    { text: `${estado}\nUsa *.cambios* para alternar.` },
    { quoted: m }
  );
};

handler.help = ['cambios'];
handler.tags = ['group'];
handler.command = /^cambios$/i;
handler.group = true;
handler.admin = true;
export default handler;

// -------------------------
// Evento que escucha cambios en el grupo
export async function groupUpdateListener(conn) {
  conn.ev.on('groups.update', async (updates) => {
    try {
      for (const update of updates) {
        const chatId = update.id;
        const chatData = global.db.data.chats[chatId] || {};
        if (!chatData.cambios) continue; // solo si está activado

        const changes = [];

        // Foto del grupo
        if (update.announce !== undefined) {
          changes.push(`🖼️ Foto o permisos del grupo cambiados`);
        }

        // Nombre del grupo
        if (update.subject) {
          changes.push(`✏️ Nombre del grupo cambiado a: ${update.subject}`);
        }

        // Descripción
        if (update.desc) {
          changes.push(`💬 Descripción cambiada a: ${update.desc}`);
        }

        // Quién hizo el cambio
        const actor = update.participant || 'desconocido';

        if (changes.length) {
          await conn.sendMessage(
            chatId,
            { text: `📢 Cambios en el grupo:\n${changes.join('\n')}\n\n👤 Por: @${actor.split('@')[0]}`, mentions: [actor] }
          );
        }
      }
    } catch (err) {
      console.error(err);
    }
  });
}

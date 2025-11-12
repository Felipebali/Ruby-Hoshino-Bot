// 📂 plugins/_cambios.js
import pkg from '@whiskeysockets/baileys';
const { downloadProfilePicture } = pkg;

let handler = async (m, { conn }) => {
  const chat = global.db.data.chats[m.chat] || {};
  chat.cambios = chat.cambios === true ? false : true; // alternar
  global.db.data.chats[m.chat] = chat;

  const estado = chat.cambios 
    ? '✅ *Log de cambios activado*' 
    : '❌ *Log de cambios desactivado*';

  await conn.sendMessage(
    m.chat,
    { text: `${estado}\nUsa *.cambios* para alternar.` },
    { quoted: m }
  );

  if (!conn.cambiosListenerRegistrado) {
    conn.cambiosListenerRegistrado = true;
    registerGroupChangesListener(conn);
  }
};

handler.help = ['cambios'];
handler.tags = ['group', 'log'];
handler.command = /^cambios$/i;
handler.group = true;
handler.admin = true;
export default handler;

function registerGroupChangesListener(conn) {
  const groupCache = {};

  conn.ev.on('groups.update', async (updates) => {
    for (const update of updates) {
      const chatId = update.id;
      const chatData = global.db.data.chats[chatId] || {};
      if (!chatData.cambios) continue;

      if (!groupCache[chatId]) groupCache[chatId] = {};
      const cache = groupCache[chatId];
      const cambios = [];

      // Nombre
      if (update.subject && update.subject !== cache.subject) {
        cambios.push(`✏️ Nombre cambiado a: ${update.subject}\n👤 Por: un administrador`);
        cache.subject = update.subject;
      }

      // Descripción
      if ((update.desc || '') !== (cache.desc || '')) {
        cambios.push(`💬 Descripción cambiada a: ${update.desc || 'vacía'}\n👤 Por: un administrador`);
        cache.desc = update.desc || '';
      }

      // Foto
      let photoMessage = null;
      if (update.icon && update.icon !== cache.icon) {
        cambios.push(`🖼️ Foto del grupo cambiada\n👤 Por: un administrador`);
        cache.icon = update.icon;

        try {
          const buffer = await downloadProfilePicture(chatId).catch(() => null);
          if (buffer) photoMessage = buffer;
        } catch {}
      }

      if (cambios.length) {
        // Obtener admins del grupo
        const metadata = await conn.groupMetadata(chatId);
        const adminJids = metadata.participants
          .filter(p => p.admin === 'superadmin' || p.admin === 'admin')
          .map(p => p.id);

        // Mencionar todos los admins
        const mentions = [...adminJids];

        if (photoMessage) {
          await conn.sendMessage(
            chatId,
            { image: photoMessage, caption: `📢 *Log de cambios del grupo:*\n${cambios.join('\n')}`, mentions },
          );
        } else {
          await conn.sendMessage(
            chatId,
            { text: `📢 *Log de cambios del grupo:*\n${cambios.join('\n')}`, mentions },
          );
        }
      }
    }
  });
}

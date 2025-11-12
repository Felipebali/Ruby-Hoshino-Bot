// 📂 plugins/_cambios.js
import { proto } from '@whiskeysockets/baileys';

let handler = async (m, { conn, command, isAdmin }) => {
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

  // Registrar listener solo una vez
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

// -------------------------
// Listener de cambios del grupo
function registerGroupChangesListener(conn) {
  const groupCache = {};

  conn.ev.on('groups.update', async (updates) => {
    try {
      for (const update of updates) {
        const chatId = update.id;
        const chatData = global.db.data.chats[chatId] || {};
        if (!chatData.cambios) continue; // solo si está activado

        if (!groupCache[chatId]) groupCache[chatId] = {};
        const cache = groupCache[chatId];
        const cambios = [];

        // Nombre
        if (update.subject && update.subject !== cache.subject) {
          cambios.push(`✏️ Nombre cambiado a: ${update.subject}\n👤 Por: @${(update.subjectOwner || 'desconocido').split('@')[0]}`);
          cache.subject = update.subject;
        }

        // Descripción
        if ((update.desc || '') !== (cache.desc || '')) {
          cambios.push(`💬 Descripción cambiada a: ${update.desc || 'vacía'}\n👤 Por: @${(update.descOwner || 'desconocido').split('@')[0]}`);
          cache.desc = update.desc || '';
        }

        // Foto
        if (update.icon && update.icon !== cache.icon) {
          cambios.push(`🖼️ Foto del grupo cambiada`);
          cache.icon = update.icon;
        }

        // Enviar log solo si hay cambios
        if (cambios.length) {
          // Obtener admins del grupo
          let metadata = await conn.groupMetadata(chatId);
          let adminJids = metadata.participants
            .filter(p => p.admin === 'superadmin' || p.admin === 'admin')
            .map(p => p.id);

          // Determinar menciones: quien hizo el cambio + admins
          const mentions = [];
          if (update.subjectOwner) mentions.push(update.subjectOwner);
          if (update.descOwner) mentions.push(update.descOwner);
          mentions.push(...adminJids);

          // Enviar mensaje tipo log
          await conn.sendMessage(
            chatId,
            { text: `📢 *Log de cambios del grupo:*\n${cambios.join('\n')}`, mentions },
          );
        }
      }
    } catch (err) {
      console.error('Error en log de grupo:', err);
    }
  });
}

// 📂 plugins/_cambios.js
import pkg from '@whiskeysockets/baileys';
const { downloadProfilePicture } = pkg;

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net'];

let handler = async (m, { conn }) => {
  const chat = global.db.data.chats[m.chat] || {};
  chat.cambios = !chat.cambios;
  global.db.data.chats[m.chat] = chat;

  const estado = chat.cambios
    ? '✅ *Log de cambios activado*'
    : '❌ *Log de cambios desactivado*';

  await conn.sendMessage(m.chat, { text: `${estado}\nUsa *.cambios* para alternar.` }, { quoted: m });

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

      let photoMessage = null;

      // Foto
      if (update.icon && update.icon !== cache.icon) {
        cambios.push(`🖼️ *Foto del grupo cambiada*`);
        cache.icon = update.icon;
        try {
          photoMessage = await downloadProfilePicture(chatId).catch(() => null);
        } catch {}
      }

      // Nombre
      if (update.subject && update.subject !== cache.subject) {
        cambios.push(`✏️ *Nombre cambiado a:* ${update.subject}`);
        cache.subject = update.subject;
      }

      // Descripción
      if ((update.desc || '') !== (cache.desc || '')) {
        cambios.push(`💬 *Descripción cambiada a:* ${update.desc || 'vacía'}`);
        cache.desc = update.desc || '';
      }

      if (cambios.length) {
        // Obtener metadata y admins
        const metadata = await conn.groupMetadata(chatId);
        const participants = metadata.participants;

        // Filtrar admins y dueños
        const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id);
        const ownersInGroup = participants.filter(p => ownerNumbers.includes(p.id)).map(p => p.id);
        const allMentions = [...admins, ...ownersInGroup];

        // Construir texto final con @ explícitos para notificación
        let texto = `📢 *Log de cambios del grupo:*\n\n`;
        texto += cambios.map(c => `${c}\n👤 Por: un administrador`).join('\n\n') + '\n\n';
        texto += `🛡️ *Administradores mencionados:*\n`;
        texto += allMentions.map(jid => `@${jid.split('@')[0]}`).join(' ');

        // Enviar mensaje con foto si existe
        if (photoMessage) {
          await conn.sendMessage(chatId, { image: photoMessage, caption: texto, mentions: allMentions });
        } else {
          await conn.sendMessage(chatId, { text: texto, mentions: allMentions });
        }
      }
    }
  });
}

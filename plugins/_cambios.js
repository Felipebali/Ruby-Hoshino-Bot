// 📂 plugins/_cambios.js
import pkg from '@whiskeysockets/baileys';
const { downloadProfilePicture } = pkg;

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // Dueños del bot

let handler = async (m, { conn }) => {
  const chat = global.db.data.chats[m.chat] || {};
  chat.cambios = chat.cambios === true ? false : true;
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
// Listener de cambios del grupo
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
        cambios.push(`🖼️ Foto del grupo cambiada\n👤 Por: un administrador`);
        cache.icon = update.icon;
        try {
          photoMessage = await downloadProfilePicture(chatId).catch(() => null);
        } catch {}
      }

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

      if (cambios.length) {
        // Obtener metadata para admins
        const metadata = await conn.groupMetadata(chatId);
        const participants = metadata.participants;

        const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
        const ownersInGroup = participants.filter(p => ownerNumbers.includes(p.id));
        const otherAdmins = admins.filter(a => !ownerNumbers.includes(a.id));

        // Construir texto estilo ejemplo que me diste
        let texto = `📢 *Log de cambios del grupo:*\n\n`;
        if (ownersInGroup.length > 0) {
          texto += `👑 *Dueños del Grupo:*\n`;
          texto += ownersInGroup.map(o => `• @${o.id.split('@')[0]}`).join('\n');
          texto += '\n\n';
        }
        const adminText = otherAdmins.map(a => `• @${a.id.split('@')[0]}`).join('\n');
        texto += `🛡️ *Administradores:*\n${adminText || 'Ninguno'}\n\n`;
        texto += cambios.join('\n');

        const allMentions = [
          ...ownersInGroup.map(o => o.id),
          ...otherAdmins.map(a => a.id)
        ];

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

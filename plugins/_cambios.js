// 📂 plugins/cambios-grupo.js
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
};

// Plugin principal
handler.help = ['cambios'];
handler.tags = ['group', 'log'];
handler.command = /^cambios$/i;
handler.group = true;
handler.admin = true;
export default handler;

// -------------------------
// Registro de cambios del grupo (tipo log)
export async function logGrupoPlugin(conn) {
  // Cache para comparar cambios
  const groupCache = {};

  conn.ev.on('groups.update', async (updates) => {
    try {
      for (const update of updates) {
        const chatId = update.id;
        const chatData = global.db.data.chats[chatId] || {};
        if (!chatData.cambios) continue; // solo si el log está activado

        // Inicializar cache si no existe
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

        // Si hay cambios, enviar log
        if (cambios.length) {
          const mentions = [];
          if (update.subjectOwner) mentions.push(update.subjectOwner);
          if (update.descOwner) mentions.push(update.descOwner);

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

// Ejecutar automáticamente el log sin tocar index.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { conn } from '../index.js'; // asegúrate que esta ruta apunta a tu instancia de conn
if (conn) logGrupoPlugin(conn);

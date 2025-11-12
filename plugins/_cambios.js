// 📂 plugins/cambios-grupo.js
let handler = async (m, { conn, command, isAdmin, isBotAdmin }) => {
  const chat = global.db.data.chats[m.chat] || {};
  chat.cambios = chat.cambios === true ? false : true; // alternar
  global.db.data.chats[m.chat] = chat;

  await conn.sendMessage(
    m.chat,
    { text: `✅ Monitor de cambios de grupo ${chat.cambios ? 'activado' : 'desactivado'}\nUsa *.cambios* para alternar.` },
    { quoted: m }
  );
};

handler.help = ['cambios'];
handler.tags = ['group'];
handler.command = /^cambios$/i;
handler.group = true;
handler.admin = true; // Solo admins pueden activar/desactivar
export default handler;

// -------------------------
// Evento que escucha cambios en el grupo
import { proto } from '@whiskeysockets/baileys';

let grupoHandler = async (update) => {
  try {
    if (!update || !update.chat) return;

    const chatId = update.chat;
    const chat = global.db.data.chats[chatId] || {};
    if (!chat.cambios) return; // si no está activado, salir

    const groupMetadata = await update.conn.groupMetadata(chatId);
    const changes = [];

    // 📌 Foto del grupo
    if (update.update && update.update.includes('setGroupProfilePicture')) {
      changes.push(`🖼️ Foto del grupo cambiada`);
    }

    // 📌 Nombre del grupo
    if (update.update && update.update.includes('subject')) {
      changes.push(`✏️ Nombre del grupo cambiado a: ${groupMetadata.subject}`);
    }

    // 📌 Descripción del grupo
    if (update.update && update.update.includes('description')) {
      changes.push(`💬 Descripción cambiada a: ${groupMetadata.desc || 'vacía'}`);
    }

    // Determinar quién lo hizo
    const actor = update.participant || 'desconocido';

    if (changes.length) {
      await update.conn.sendMessage(
        chatId,
        { text: `📢 Cambios en el grupo:\n${changes.join('\n')}\n\n👤 Por: @${actor.split('@')[0]}`, mentions: [actor] }
      );
    }

  } catch (err) {
    console.error(err);
  }
};

// Aquí debes vincular `grupoHandler` al evento 'group-participants-update' y 'group-update' según la librería
// Ejemplo con Baileys:
// conn.ev.on('group-update', grupoHandler);

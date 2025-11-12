// plugins/cambios.js
let handler = async (m, { conn, command }) => {
    if (!m.isGroup) return m.reply('Este comando solo funciona en grupos.');

    // Confirmar activación
    global.db.data.chats[m.chat].notifyChanges = true;
    m.reply('✅ Ahora se notificará cada cambio de nombre, descripción o foto del grupo.');
};

export default handler;

// En tu archivo principal (index.js o donde manejes eventos)
conn.ev.on('groups.update', async (updates) => {
    for (let update of updates) {
        const chatId = update.id;
        const chatData = global.db.data.chats[chatId] || {};

        // Solo si el comando .cambios está activo
        if (!chatData.notifyChanges) continue;

        if (update.subject) {
            await conn.sendMessage(chatId, { text: `📛 El nombre del grupo cambió a: *${update.subject}*` });
        }
        if (update.desc) {
            await conn.sendMessage(chatId, { text: `📝 La descripción del grupo cambió a: *${update.desc}*` });
        }
        if (update.icon) {
            await conn.sendMessage(chatId, { text: `🖼️ La foto del grupo ha sido cambiada.` });
        }
    }
});

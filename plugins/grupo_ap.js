// 📂 plugins/admin-ap.js
let handler = async (m, { conn, isAdmin, isOwner }) => {
    if (!isAdmin && !isOwner) return m.reply('❌ Solo administradores o el dueño pueden usar este comando.');

    try {
        // Obtén información del grupo
        const groupMetadata = await conn.groupMetadata(m.chat);
        const pendingParticipants = groupMetadata.participants.filter(p => p.pending);

        if (pendingParticipants.length === 0) {
            return m.reply('ℹ️ No hay solicitudes pendientes en este grupo.');
        }

        // Aprobar todas las solicitudes pendientes
        for (let user of pendingParticipants) {
            await conn.groupParticipantsUpdate(m.chat, [user.id], 'approve'); // 'approve' o 'add', según versión
        }

        // Mensaje de confirmación con menciones clickeables
        let mentions = pendingParticipants.map(u => u.id);
        await conn.sendMessage(m.chat, {
            text: `✅ Se aprobaron todas las solicitudes pendientes:\n${mentions.map(jid => `@${jid.split('@')[0]}`).join('\n')}`,
            mentions
        });

    } catch (err) {
        console.log(err);
        m.reply('❌ Ocurrió un error al aprobar las solicitudes.');
    }
};

handler.command = /^ap$/i;
handler.group = true;
handler.admin = true; // Solo admins
handler.rowner = true; // Y dueño
export default handler;

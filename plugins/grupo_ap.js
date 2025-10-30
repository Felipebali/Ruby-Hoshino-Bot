// 📂 plugins/admin-ap.js
let handler = async (m, { conn, isAdmin, isOwner }) => {
    if (!isAdmin && !isOwner) return m.reply('❌ Solo administradores o el dueño pueden usar este comando.');

    try {
        // Obtener todos los grupos donde el bot está
        const allGroups = await conn.groupFetchAllParticipating();
        const group = allGroups[m.chat];
        if (!group) return m.reply('❌ No se pudo obtener información del grupo.');

        // Solicitudes pendientes vienen en invites
        const pendingRequests = Object.values(group.inviteRequests || {});
        if (pendingRequests.length === 0) return m.reply('ℹ️ No hay solicitudes pendientes.');

        // Aprobar todas las solicitudes
        for (let req of pendingRequests) {
            await conn.groupParticipantsUpdate(m.chat, [req.id], 'approve'); // aprovar solicitud
        }

        // Mensaje de confirmación
        let mentions = pendingRequests.map(u => u.id);
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
handler.admin = true;
handler.rowner = true;
export default handler;

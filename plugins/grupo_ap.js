// 📂 plugins/admin-ap.js
let handler = async (m, { conn, text, isAdmin, isOwner, usedPrefix }) => {
    if (!isAdmin && !isOwner) return m.reply('❌ Solo administradores o el dueño pueden usar este comando.');

    // Verifica que haya texto (número o mención)
    if (!text) return m.reply(`❌ Usa: ${usedPrefix}ap @usuario`);

    // Extraer JIDs de las menciones
    let mentions = m.mentionedJid;
    if (!mentions || mentions.length === 0) return m.reply('❌ Debes mencionar al usuario a aprobar.');

    for (let jid of mentions) {
        try {
            // Aprobar solicitud de unirse (aceptar al usuario)
            await conn.groupAcceptInvite(jid); // <-- esto depende de tu versión de la librería
            await conn.sendMessage(m.chat, { text: `✅ @${jid.split('@')[0]} fue aprobado para unirse al grupo.`, mentions: [jid] });
        } catch (err) {
            console.log(err);
            await m.reply(`❌ No se pudo aprobar a @${jid.split('@')[0]}.`);
        }
    }
};

handler.command = /^ap$/i;
handler.group = true;
handler.rowner = true; // Solo dueño si quieres
handler.admin = true;  // Solo admin
export default handler;

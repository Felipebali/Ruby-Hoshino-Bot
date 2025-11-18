// plugins/invitar.js — inteligente (agrega o envía link según privacidad)
let handler = async (m, { conn, args }) => {

    if (!m.isGroup) 
        return conn.sendMessage(m.chat, { text: "❌ Este comando solo funciona en grupos." });

    // Obtener info del grupo
    const metadata = await conn.groupMetadata(m.chat);
    const bot = conn.user.jid || conn.user.id;
    const botData = metadata.participants.find(p => p.id === bot);

    // Verificar si el bot es admin
    if (!botData?.admin) {
        return conn.sendMessage(m.chat, { text: "❌ Necesito ser administrador para agregar o invitar." });
    }

    // Validar número
    if (!args[0]) {
        return conn.sendMessage(m.chat, { 
            text: "❌ Debes escribir un número.\n\n👉 Ejemplo:\n`.invitar 59891234567`" 
        });
    }

    // Normalizar número
    let number = args[0].replace(/[^0-9]/g, '');
    if (number.length < 8) {
        return conn.sendMessage(m.chat, { text: "❌ Número inválido." });
    }

    const jid = number + '@s.whatsapp.net';

    try {
        // Intento 1: Agregar directamente
        await conn.groupParticipantsUpdate(m.chat, [jid], "add");

        await conn.sendMessage(m.chat, { 
            text: `✅ *${number} agregado al grupo exitosamente.*` 
        });

    } catch (error) {
        console.log("No se pudo agregar. Intentando invitación…");

        try {
            // Intento 2: Enviar invitación por link
            const invite = await conn.groupInviteCode(m.chat);
            const groupName = metadata.subject;

            await conn.sendMessage(jid, {
                text: `👋 ¡Hola! El grupo *${groupName}* te invita a unirte.\nÚnete desde aquí:\nhttps://chat.whatsapp.com/${invite}`
            });

            await conn.sendMessage(m.chat, {
                text: `⚠️ *No fue posible agregar a +${number}.*\n👉 Le envié una *invitación por mensaje privado* 🚀`
            });

        } catch (e2) {
            console.error(e2);

            await conn.sendMessage(m.chat, {
                text: "❌ No pude agregar ni invitar a ese número.\nPuede que no exista o no tenga WhatsApp."
            });
        }
    }
};

handler.help = ['invitar <número>'];
handler.tags = ['grupo'];
handler.command = /^invitar$/i;
handler.admin = true;
handler.group = true;

export default handler;

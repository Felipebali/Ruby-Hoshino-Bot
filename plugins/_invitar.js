// plugins/invitar.js — versión FINAL corregida
let handler = async (m, { conn, args }) => {

    if (!m.isGroup) 
        return conn.sendMessage(m.chat, { text: "❌ Este comando solo funciona en grupos." });

    const group = await conn.groupMetadata(m.chat);

    // Detectar el JID correcto del bot
    const botNumber = conn.user?.id || conn.user?.jid || conn.user;
    const botJid = botNumber.replace(/:.+/, ''); // limpia resource

    const botData = group.participants.find(p => p.id === botJid);

    // Verificar si el bot es admin correctamente
    if (!botData || !(botData.admin || botData.superadmin)) {
        return conn.sendMessage(m.chat, { text: "❌ Necesito ser *administrador* para agregar o invitar." });
    }

    // Validar número
    if (!args[0]) {
        return conn.sendMessage(m.chat, { 
            text: "❌ Debes escribir un número.\n\n👉 Ejemplo:\n.invitar 59891234567" 
        });
    }

    // Normalizar número
    let number = args[0].replace(/[^0-9]/g, '');
    if (number.length < 8) {
        return conn.sendMessage(m.chat, { text: "❌ Número inválido." });
    }

    const jid = number + '@s.whatsapp.net';

    try {
        // Intentar agregar al grupo directamente
        await conn.groupParticipantsUpdate(m.chat, [jid], "add");

        await conn.sendMessage(m.chat, { 
            text: `✅ *${number} agregado al grupo exitosamente.*` 
        });

    } catch (error) {
        console.log("No se pudo agregar. Probando invitación...");

        try {
            // Crear link e invitar
            const invite = await conn.groupInviteCode(m.chat);
            const groupName = group.subject;

            await conn.sendMessage(jid, {
                text: `👋 ¡Hola! Te están invitando al grupo *${groupName}*.\nÚnete desde aquí:\nhttps://chat.whatsapp.com/${invite}`
            });

            await conn.sendMessage(m.chat, {
                text: `⚠️ *No pude agregar a +${number}.*\n👉 Le envié una invitación por *mensaje privado*.`
            });

        } catch (e2) {
            console.error(e2);

            await conn.sendMessage(m.chat, {
                text: "❌ No pude agregar ni invitar al número.\nPuede que no tenga WhatsApp o tenga privacidad estricta."
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

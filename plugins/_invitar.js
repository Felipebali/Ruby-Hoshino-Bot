// plugins/invitar.js — DETECCIÓN PERFECTA DEL BOT COMO ADMIN
let handler = async (m, { conn, args }) => {

    if (!m.isGroup) 
        return conn.sendMessage(m.chat, { text: "❌ Este comando solo funciona en grupos." });

    const group = await conn.groupMetadata(m.chat);

    // ======== DETECCIÓN REAL DEL BOT ========

    // Obtener todas las posibles formas del JID del bot
    const botIds = [
        conn.user?.id,
        conn.user?.jid,
        conn.info?.wid?.id,
        conn.info?.wid?.user + "@s.whatsapp.net"
    ]
    .filter(Boolean)
    .map(v => v.replace(/:.+/, "")); // normalizar

    // Extraer solo número para comparar
    const botNumbers = botIds.map(j => j.split("@")[0]);

    // Buscar al bot como participante SIN importar el formato del JID
    const botInGroup = group.participants.find(p => {
        const participantNumber = p.id.split("@")[0];
        return botNumbers.includes(participantNumber);
    });

    // ========================

    // Fallo: no se encontró al bot en la lista (muy raro pero puede pasar)
    if (!botInGroup) {
        return conn.sendMessage(m.chat, { 
            text: "⚠️ No pude detectar al bot entre los participantes.\nReenvíame un mensaje del bot o reinicia el proceso." 
        });
    }

    // Verificar si es admin
    if (!(botInGroup.admin || botInGroup.superadmin)) {
        return conn.sendMessage(m.chat, { 
            text: "❌ Necesito ser *administrador* para agregar o invitar." 
        });
    }

    // ========================

    // Validar número
    if (!args[0]) {
        return conn.sendMessage(m.chat, { 
            text: "❌ Debes escribir un número.\n\n👉 Ejemplo:\n.invitar 59891234567" 
        });
    }

    let number = args[0].replace(/[^0-9]/g, '');
    if (number.length < 8) {
        return conn.sendMessage(m.chat, { text: "❌ Número inválido." });
    }

    const jid = number + '@s.whatsapp.net';

    try {
        // Intentar agregar directamente
        await conn.groupParticipantsUpdate(m.chat, [jid], "add");

        await conn.sendMessage(m.chat, { 
            text: `✅ *${number} agregado al grupo exitosamente.*` 
        });

    } catch (error) {
        console.log("No se pudo agregar. Probando invitación...");

        try {
            // Generar link
            const invite = await conn.groupInviteCode(m.chat);

            await conn.sendMessage(jid, {
                text: `👋 ¡Hola! Te invitan al grupo *${group.subject}*.\nÚnete desde aquí:\nhttps://chat.whatsapp.com/${invite}`
            });

            await conn.sendMessage(m.chat, {
                text: `⚠️ No pude agregar a *+${number}*.\n📩 Le envié una invitación por mensaje privado.`
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

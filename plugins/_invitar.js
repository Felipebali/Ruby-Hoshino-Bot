// 📂 plugins/grupos-invitar.js — FelixCat_Bot 🐾
// Invita a un número y si el usuario tiene habilitado unirse automáticamente, WhatsApp lo agrega.
// Si no, le envía la invitación para que acepte manualmente.
// Uso: .invitar 598XXXXXXX

let handler = async (m, { conn, args }) => {

    if (!m.isGroup) 
        return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);

    // Requiere que el bot sea admin para usar groupAdd
    const grupo = await conn.groupMetadata(m.chat);
    const botID = conn.user.jid || conn.user.id;
    const botAdmin = grupo.participants.some(p => p.id === botID && p.admin);

    if (!botAdmin)
        return conn.reply(m.chat, '⚠️ Necesito ser *admin* para invitar automáticamente.\n\nPuedo enviar enlace, pero no agregar.', m);

    if (!args[0]) 
        return conn.reply(m.chat, '✏️ *Uso:* .invitar 59898719147', m);

    // Normalizamos número
    let numero = args[0].replace(/[^0-9]/g, '');
    if (numero.length < 7) 
        return conn.reply(m.chat, '❌ Número inválido.', m);

    let jid = numero + '@s.whatsapp.net';

    try {
        // WhatsApp decide si lo agrega o si solo manda invitación
        let res = await conn.groupAdd(m.chat, [jid]);

        /*
          Respuestas posibles:
          - "200": agregado automáticamente
          - "403": el usuario no permite agregar -> se manda invitación
        */

        if (res && res[0] && res[0].status === 200) {
            return conn.reply(m.chat, `✅ *${numero} fue añadido automáticamente* al grupo.`, m);
        }

        if (res && res[0] && res[0].status === 403) {
            // Enviar link manual si WhatsApp no deja agregar
            let link = await conn.groupInviteCode(m.chat);
            let enlace = `https://chat.whatsapp.com/${link}`;

            await conn.sendMessage(jid, { 
                text: `👋 Fuiste invitado a un grupo:\n➡️ ${enlace}\n📌 Debes aceptar la invitación.`,
            });

            return conn.reply(m.chat, `📨 El usuario *${numero}* no permite ser agregado.\n✔ Le envié el enlace por privado.`, m);
        }

        return conn.reply(m.chat, '⚠️ No se pudo agregar. Puede que el número no exista o tenga bloqueo.', m);

    } catch (e) {
        console.log(e);
        return conn.reply(m.chat, '❌ Error al invitar al usuario.', m);
    }
};

handler.help = ['invitar <número>'];
handler.tags = ['group'];
handler.command = /^invitar$/i;

export default handler;

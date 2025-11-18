// 📂 plugins/grupos-invitar.js — FelixCat_Bot 🐾
// Invita a un número enviándole el link, y si el bot es admin intenta agregar automáticamente.
// Uso: .invitar 598XXXXXXX

let handler = async (m, { conn, args }) => {

    if (!m.isGroup)
        return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);

    if (!args[0])
        return conn.reply(m.chat, '✏️ *Uso:* .invitar 59898719147', m);

    // Normalizamos número
    let numero = args[0].replace(/[^0-9]/g, '');
    if (numero.length < 7)
        return conn.reply(m.chat, '❌ Número inválido.', m);

    let jid = numero + '@s.whatsapp.net';

    // Generar código de invitación siempre
    let linkCode = await conn.groupInviteCode(m.chat);
    let link = `https://chat.whatsapp.com/${linkCode}`;

    // Enviar invitación por privado SIEMPRE
    await conn.sendMessage(jid, {
        text: `👋 *Has sido invitado a un grupo:*\n🔗 ${link}\n\n📌 Puedes unirte tocando el enlace.`
    });

    // Confirmar al grupo
    await conn.reply(m.chat, `📨 Envié el enlace al número *${numero}*.`, m);

    // Intentar agregar automáticamente SOLO si el bot es admin
    try {
        const groupData = await conn.groupMetadata(m.chat);
        const botID = conn.user.jid || conn.user.id;
        const botAdmin = groupData.participants.some(p => p.id === botID && p.admin);

        if (botAdmin) {
            // Intento de agregado automático
            let res = await conn.groupAdd(m.chat, [jid]);

            if (res && res[0]) {
                if (res[0].status === 200) {
                    return conn.reply(m.chat, `✅ El usuario *${numero}* fue agregado automáticamente.`, m);
                }
                // Si no permite ser agregado, ya enviamos el enlace antes, así que no pasa nada
            }
        }
    } catch (e) {
        console.log('Error en agregado automático:', e);
    }
};

handler.help = ['invitar <número>'];
handler.tags = ['group'];
handler.command = /^invitar$/i;

export default handler;

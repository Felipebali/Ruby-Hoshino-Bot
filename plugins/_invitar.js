// 📂 plugins/grupos-agregar.js — FelixCat_Bot 🐾
// Comando: .agregar <número>
// Agrega directamente a un usuario al grupo (solo si el bot es admin)

let handler = async (m, { conn, args }) => {
    if (!m.isGroup)
        return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);

    if (!args[0])
        return conn.reply(m.chat, '✏️ *Uso correcto:* .agregar 59898719147', m);

    // Normalizamos número
    let numero = args[0].replace(/[^0-9]/g, '');
    if (numero.length < 7)
        return conn.reply(m.chat, '❌ Número inválido.', m);

    let jid = numero + '@s.whatsapp.net';

    // Verificar si el bot es admin
    const group = await conn.groupMetadata(m.chat);
    const botID = conn.user.jid || conn.user.id;
    const botEsAdmin = group.participants.some(p => p.id === botID && p.admin);

    if (!botEsAdmin)
        return conn.reply(m.chat, '❌ Necesito ser administrador para agregar al usuario.', m);

    // Intento de agregado
    try {
        let res = await conn.groupAdd(m.chat, [jid]);

        // Respuesta tipo Baileys
        let r = res[0] || res;

        if (r.status === 200) {
            return conn.reply(m.chat, `✅ Usuario *${numero}* agregado correctamente.`, m);
        }

        if (r.status === 409) {
            return conn.reply(m.chat, '⚠️ Ese usuario ya está en el grupo.', m);
        }

        if (r.status === 403) {
            return conn.reply(m.chat, '⚠️ El usuario no permite que lo agreguen. Solo lo pueden invitar por enlace.', m);
        }

        return conn.reply(m.chat, `⚠️ No pude agregar a *${numero}*. Código: ${r.status}`, m);

    } catch (e) {
        console.log('Error al agregar:', e);
        conn.reply(m.chat, '❌ Ocurrió un error al intentar agregar al usuario.', m);
    }
};

handler.help = ['agregar <número>'];
handler.tags = ['group'];
handler.command = /^agregar$/i;

export default handler;

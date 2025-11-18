// 📂 plugins/grupos-agregar.js — FelixCat_Bot 🐾
// Comando: .agregar <número>

let handler = async (m, { conn, args }) => {

    if (!m.isGroup)
        return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);

    if (!args[0])
        return conn.reply(m.chat, '✏️ *Uso:* .agregar 59898719147', m);

    // Normalizamos número
    let numero = args[0].replace(/[^0-9]/g, '');
    if (numero.length < 7)
        return conn.reply(m.chat, '❌ Número inválido.', m);

    let jid = numero + '@s.whatsapp.net';

    // Obtener metadata del grupo
    const group = await conn.groupMetadata(m.chat);

    // Detectar el ID real del bot (compatibilidad total Baileys)
    const botIdsPosibles = [
        conn.user.id,
        conn.user.jid,
        (conn.user.id || '').split(':')[0] + '@s.whatsapp.net',
        (conn.user.jid || '').split(':')[0] + '@s.whatsapp.net'
    ].filter(Boolean);

    // Detectar admin correctamente
    const botEsAdmin = group.participants.some(p =>
        p.admin &&
        botIdsPosibles.includes(p.id.split(':')[0])
    );

    if (!botEsAdmin)
        return conn.reply(m.chat, '❌ Necesito ser administrador para agregar al usuario.', m);

    // Intentar agregar
    try {
        let res = await conn.groupAdd(m.chat, [jid]);
        let r = res[0] || res;

        if (r.status === 200)
            return conn.reply(m.chat, `✅ Usuario *${numero}* agregado correctamente.`, m);

        if (r.status === 409)
            return conn.reply(m.chat, '⚠️ Ese usuario ya está en el grupo.', m);

        if (r.status === 403)
            return conn.reply(m.chat, '⚠️ Ese usuario no permite que lo agreguen.', m);

        conn.reply(m.chat, `⚠️ No pude agregarlo. Código: ${r.status}`, m);

    } catch (e) {
        console.error(e);
        conn.reply(m.chat, '❌ Error al agregar al usuario.', m);
    }
};

handler.command = /^agregar$/i;

export default handler;

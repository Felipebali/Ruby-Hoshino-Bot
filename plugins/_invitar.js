// 📂 plugins/grupos-agregar.js — FelixCat_Bot 🐾

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

    // Obtener metadata del grupo
    const group = await conn.groupMetadata(m.chat);

    // ID REAL DEL BOT, recortado, compatible al 100%
    const botID = (conn.user.jid || conn.user.id || "")
        .split(':')[0]   // elimina cualquier :1 ó :2
        .replace(/[^0-9@s\.]/g, ''); 

    // Buscar al bot en la lista de admins (formato estable)
    const botEsAdmin = group.participants.some(p => {
        const pid = p.id.split(':')[0]; // recorta el :1 / :2
        return pid === botID && p.admin;
    });

    if (!botEsAdmin) {
        return conn.reply(m.chat, '❌ El bot NO se reconoce como admin en este grupo.\n\n📌 *Solución:* Quitá al bot como admin y volvé a ponerlo.', m);
    }

    // Intentar agregar
    try {
        let res = await conn.groupAdd(m.chat, [jid]);
        let r = res[0] || res;

        if (r.status === 200)
            return conn.reply(m.chat, `✅ Usuario *${numero}* agregado correctamente.`, m);

        if (r.status === 409)
            return conn.reply(m.chat, '⚠️ Ese usuario ya está en el grupo.', m);

        if (r.status === 403)
            return conn.reply(m.chat, '⚠️ Ese usuario no permite que lo agreguen al grupo.', m);

        conn.reply(m.chat, `⚠️ No pude agregarlo. Código: ${r.status}`, m);

    } catch (e) {
        console.log('Error al agregar:', e);
        conn.reply(m.chat, '❌ Ocurrió un error al intentar agregar al usuario.', m);
    }
};

handler.command = /^agregar$/i;

export default handler;

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net'];
const actividadAdmins = {}; // almacenamiento temporal

const handler = async (m, { conn }) => {
    if (!m.isGroup) return;

    // registrar actividad de todos los mensajes del grupo
    if (!actividadAdmins[m.chat]) actividadAdmins[m.chat] = {};
    actividadAdmins[m.chat][m.sender] = Date.now();

    // detectar el comando
    if (!m.text) return;
    const texto = m.text.trim().toLowerCase();
    if (texto !== '.admins') return;

    // obtener datos del grupo
    const group = await conn.groupMetadata(m.chat);
    const admins = group.participants.filter(p => p.admin);
    const isAdmin = admins.some(a => a.id === m.sender);
    const isOwner = ownerNumbers.includes(m.sender);

    if (!isAdmin && !isOwner)
        return m.reply('🚫 Solo los administradores o el dueño pueden usar este comando.');

    // analizar actividad
    const ahora = Date.now();
    const limite = 24 * 60 * 60 * 1000; // 24 horas

    let activos = [];
    let inactivos = [];

    for (const adm of admins) {
        const id = adm.id;
        const ultimo = actividadAdmins[m.chat]?.[id];
        if (ultimo && (ahora - ultimo) < limite) activos.push('@' + id.split('@')[0]);
        else inactivos.push('@' + id.split('@')[0]);
    }

    let textoFinal = `👑 *Actividad de administradores*\n📅 (Últimas 24 h)\n\n`;

    if (activos.length)
        textoFinal += `🟢 *Activos:*\n${activos.map(a => '• ' + a).join('\n')}\n\n`;
    else textoFinal += `🟢 *Activos:* Ninguno 😴\n\n`;

    if (inactivos.length)
        textoFinal += `🔴 *Inactivos:*\n${inactivos.map(a => '• ' + a).join('\n')}`;
    else textoFinal += `🔴 *Inactivos:* Ninguno 🎉`;

    await conn.sendMessage(m.chat, {
        text: textoFinal,
        mentions: admins.map(a => a.id)
    });
};

handler.help = ['admins'];
handler.tags = ['admin'];
handler.command = /^admins$/i;
handler.group = true;

export default handler;

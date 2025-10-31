const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net'];
const ultimosMensajes = {}; // almacena actividad temporal

let handler = async (m, { conn }) => {
    if (!m.isGroup) return; // solo grupos

    // Guardar el mensaje como actividad
    if (!ultimosMensajes[m.chat]) ultimosMensajes[m.chat] = {};
    ultimosMensajes[m.chat][m.sender] = Date.now();

    // Detectar comando (prefijo .)
    if (!m.text) return;
    const texto = m.text.trim().toLowerCase();
    if (texto !== '.activos') return;

    // Obtener datos del grupo
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participantes = groupMetadata.participants;
    const admins = participantes.filter(p => p.admin);

    const isAdmin = admins.some(a => a.id === m.sender);
    const isOwner = ownerNumbers.includes(m.sender);
    if (!isAdmin && !isOwner)
        return m.reply('🚫 Solo los administradores o el dueño pueden usar este comando.');

    // Analizar actividad de los admins
    const ahora = Date.now();
    const limite = 24 * 60 * 60 * 1000; // 24h

    let activos = [];
    let inactivos = [];

    for (let adm of admins) {
        const id = adm.id;
        const ultimo = ultimosMensajes[m.chat]?.[id];
        if (ultimo && (ahora - ultimo) < limite) activos.push('@' + id.split('@')[0]);
        else inactivos.push('@' + id.split('@')[0]);
    }

    let textoFinal = `📊 *Actividad de Administradores*\n📅 Últimas 24 horas\n\n`;

    if (activos.length)
        textoFinal += `🟢 *Activos:*\n${activos.map(a => '• ' + a).join('\n')}\n\n`;
    else textoFinal += '🟢 *Activos:* Ninguno 😴\n\n';

    if (inactivos.length)
        textoFinal += `🔴 *Inactivos:*\n${inactivos.map(a => '• ' + a).join('\n')}`;
    else textoFinal += '🔴 *Inactivos:* Ninguno 🎉';

    await conn.sendMessage(m.chat, {
        text: textoFinal,
        mentions: admins.map(a => a.id)
    });
};

handler.help = ['activos'];
handler.tags = ['admin'];
handler.command = /^activos$/i;
handler.group = true;

export default handler;

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // Dueños del bot

let ultimosMensajes = {}; // se guardan temporalmente los mensajes por grupo

const handler = async (m, { conn }) => {
    if (!m.isGroup) return;

    // Registrar el mensaje
    if (!ultimosMensajes[m.chat]) ultimosMensajes[m.chat] = {};
    ultimosMensajes[m.chat][m.sender] = Date.now();

    // Solo responde al comando .activos
    if (!/^\.activos$/i.test(m.text)) return;

    // Obtener datos del grupo
    const groupMetadata = await conn.groupMetadata(m.chat);
    const admins = groupMetadata.participants.filter(p => p.admin);
    const isAdmin = admins.some(a => a.id === m.sender);
    const isOwner = ownerNumbers.includes(m.sender);

    if (!isAdmin && !isOwner)
        return m.reply('🚫 Solo los administradores o el dueño pueden usar este comando.');

    // Analizar actividad reciente (últimas 24 horas)
    const ahora = Date.now();
    const unDia = 24 * 60 * 60 * 1000;

    let texto = `📊 *Actividad de administradores (últimas 24h)*\n\n`;
    let activos = [];

    for (let adm of admins) {
        const id = adm.id;
        const ultimo = ultimosMensajes[m.chat][id];
        if (ultimo && (ahora - ultimo) < unDia) {
            activos.push('@' + id.split('@')[0]);
        }
    }

    if (activos.length === 0) texto += '😴 Ningún administrador ha hablado en las últimas 24 h.';
    else texto += '🟢 Activos:\n' + activos.map(a => `• ${a}`).join('\n');

    await conn.sendMessage(m.chat, { text: texto, mentions: admins.map(a => a.id) });
};

handler.help = ['activos'];
handler.tags = ['admin'];
handler.command = /^activos$/i;
handler.group = true;

export default handler;

// 📂 plugins/gpu.js
const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // Dueños

let handler = async (m, { conn }) => {
  try {
    const sender = m.sender;

    if (!ownerNumbers.includes(sender)) return m.reply('🚫 Solo los dueños del bot pueden usar este comando.');

    // Determinar target:
    let target = null;

    // 1️⃣ Mención: revisar m.mentionedJid
    if (m.mentionedJid && m.mentionedJid.length > 0) {
      target = m.mentionedJid[0];
    }
    // 2️⃣ Si citó un mensaje
    else if (m.quoted && m.quoted.sender) {
      target = m.quoted.sender;
    }

    if (!target) return m.reply('❌ Debes mencionar a alguien o citar su mensaje.');

    const simpleTarget = target.split('@')[0];

    // Obtener foto de perfil
    let ppUrl = null;
    try {
      ppUrl = await conn.profilePictureUrl(target, 'image').catch(() => null);
    } catch {}
    if (!ppUrl) return m.reply(`❌ @${simpleTarget} no tiene foto de perfil pública.`, { mentions: [target] });

    // Enviar la foto mencionando solo al target
    await conn.sendMessage(
      m.chat,
      {
        image: { url: ppUrl },
        caption: `📥 Foto de perfil de @${simpleTarget}`,
        mentions: [target]
      },
      { quoted: m }
    );

  } catch (err) {
    console.error(err);
    m.reply('⚠️ Ocurrió un error al intentar descargar la foto.');
  }
};

handler.command = /^(gpu)$/i;
handler.tags = ['owner', 'tools'];
handler.help = ['gpu'];
handler.group = false;
export default handler;

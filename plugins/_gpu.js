// 📂 plugins/gpu.js
import pkg from '@whiskeysockets/baileys';
const { default: baileysPkg } = pkg;

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // Dueños del bot

let handler = async (m, { conn, mentionedJid }) => {
  try {
    const sender = m.sender;

    // Solo owners pueden usarlo
    if (!ownerNumbers.includes(sender)) {
      return m.reply('🚫 Solo los dueños del bot pueden usar este comando.');
    }

    // Determinar el target real:
    let target = null;

    // 1️⃣ Si mencionó a alguien explícitamente
    if (mentionedJid && mentionedJid.length > 0) {
      target = mentionedJid[0];
    }
    // 2️⃣ Si citó un mensaje
    else if (m.quoted && m.quoted.sender) {
      target = m.quoted.sender;
    }

    // 3️⃣ Si no hay mención ni quote -> error
    if (!target) return m.reply('❌ Debes mencionar a alguien o citar su mensaje.');

    // Normalizar JID
    if (!target.endsWith('@s.whatsapp.net')) target = target.split('@')[0] + '@s.whatsapp.net';

    const simpleTarget = target.split('@')[0];
    const simpleSender = sender.split('@')[0];

    // Obtener URL de la foto
    let ppUrl = null;
    try {
      ppUrl = await conn.profilePictureUrl(target, 'image').catch(() => null);
    } catch {
      ppUrl = null;
    }

    if (!ppUrl) {
      return await conn.sendMessage(
        m.chat,
        { text: `❌ @${simpleTarget} no tiene foto de perfil pública o no se pudo descargar.`, mentions: [target] },
        { quoted: m }
      );
    }

    // Enviar la foto mencionando al target y al owner
    await conn.sendMessage(
      m.chat,
      {
        image: { url: ppUrl },
        caption: `📥 Foto de perfil de @${simpleTarget}\n👑 Solicitada por @${simpleSender}`,
        mentions: [target, sender]
      },
      { quoted: m }
    );

  } catch (err) {
    console.error('Error en .gpu:', err);
    try {
      await conn.sendMessage(m.chat, { text: '⚠️ Ocurrió un error al intentar descargar la foto de perfil.' }, { quoted: m });
    } catch {}
  }
};

handler.help = ['gpu'];
handler.tags = ['owner', 'tools'];
handler.command = /^(gpu)$/i;
handler.group = false;
export default handler;

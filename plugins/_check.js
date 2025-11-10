// 🐾 plugins/_adminRequired.js — FelixCat_Bot
// Bloquea cualquier comando (prefijo ".") si el bot no es admin

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return; // solo grupos
    if (!m.text?.startsWith('.')) return; // solo comandos con "."

    const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const metadata = await conn.groupMetadata(m.chat);
    const botInfo = metadata.participants.find(p => p.id === botNumber);

    if (!botInfo?.admin) {
      await m.reply('⚠️ *Necesito ser administrador para poder usar mis comandos en este grupo.*');
      throw false; // evita que otros comandos se ejecuten
    }

  } catch (err) {
    console.error('[ADMIN REQUIRED ERROR]', err);
  }
};

export default handler;

// 🐾 plugins/_botAdminCheck.js — FelixCat_Bot
// Detecta cualquier comando con prefijo "." y avisa si el bot no es administrador

let handler = async (m, { conn }) => {
  try {
    // Solo se ejecuta si es un grupo y el mensaje empieza con "."
    if (!m.isGroup || !m.text?.startsWith('.')) return;

    const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const metadata = await conn.groupMetadata(m.chat);
    const botInfo = metadata.participants.find(p => p.id === botNumber);

    if (!botInfo?.admin) {
      await conn.sendMessage(m.chat, {
        text: `⚠️ *Necesito ser administrador* para funcionar correctamente en este grupo 😿\n\nPor favor, otórgame permisos para usar mis comandos.`
      });
    }
  } catch (err) {
    console.error('[BOT ADMIN CHECK ERROR]', err);
  }
};

export default handler;

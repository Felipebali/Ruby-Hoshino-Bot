// 🐾 plugins/_autoCheckBotAdmin.js — FelixCat_Bot
// Aviso automático si el bot no es administrador en un grupo

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return;

    const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const groupMetadata = await conn.groupMetadata(m.chat);
    const botData = groupMetadata.participants.find(p => p.id === botNumber);

    if (!botData?.admin) {
      await conn.sendMessage(m.chat, {
        text: '⚠️ *Atención:* Necesito ser *administrador* para funcionar correctamente en este grupo.\n\nPor favor, otórgame permisos de administrador 😿'
      });
    }
  } catch (e) {
    console.error('[AUTO CHECK ADMIN ERROR]', e);
  }
};

export default handler;

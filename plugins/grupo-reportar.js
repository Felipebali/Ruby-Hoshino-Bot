const handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.');

  const admins = participants?.filter(p => p.admin) || [];
  if (!admins.length) return m.reply('⚠️ No hay administradores en este grupo.');

  const senderTag = `@${m.sender.split('@')[0]}`;
  const aviso = `🚨 *ALERTA EN EL GRUPO* 🚨\n\n📣 El usuario ${senderTag} ha solicitado la atención de los administradores.\n\n⚠️ *Revisen el mensaje citado o la conversación actual.*`;

  const mentions = [m.sender, ...admins.map(a => a.id)];

  try {
    // 📌 Si hay un mensaje citado, obtener solo el mensaje limpio
    const quoted = m.quoted?.message ? m.quoted : null;

    await conn.sendMessage(
      m.chat,
      {
        text: aviso,
        mentions
      },
      quoted ? { quoted } : {} // solo citar si existe
    );
  } catch (err) {
    console.error('Error al enviar aviso a administradores:', err);
    m.reply('❌ Hubo un error al intentar notificar a los administradores.');
  }
};

handler.command = ['avisar', 'reportar'];
handler.tags = ['group'];
handler.help = ['avisar', 'reportar'];
handler.group = true;

export default handler;

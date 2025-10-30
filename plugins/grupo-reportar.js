const handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.');

  const admins = participants?.filter(p => p.admin) || [];
  if (!admins.length) return m.reply('⚠️ No hay administradores en este grupo.');

  const senderTag = `@${m.sender.split('@')[0]}`;
  const aviso = `🚨 *ALERTA EN EL GRUPO* 🚨\n\n📣 El usuario ${senderTag} ha solicitado la atención de los administradores.\n\n⚠️ *Revisen el mensaje citado o la conversación actual.*`;

  // Crear lista de menciones clickeables
  const mentions = [m.sender, ...admins.map(a => a.id)];

  // Si hay mensaje citado, usarlo. Si no, usar el propio mensaje.
  const quotedMsg = m.quoted ? m.quoted : m;

  try {
    await conn.sendMessage(
      m.chat,
      {
        text: aviso,
        mentions
      },
      { quoted: quotedMsg }
    );
  } catch (err) {
    console.error('Error al enviar mensaje de aviso:', err);
    m.reply('❌ Hubo un error al intentar notificar a los administradores.');
  }
};

handler.command = ['avisar', 'reportar'];
handler.tags = ['group'];
handler.help = ['avisar', 'reportar'];
handler.group = true;

export default handler;

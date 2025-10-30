const handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.');

  // Buscar todos los administradores del grupo
  const admins = participants.filter(p => p.admin);
  if (!admins.length) return m.reply('⚠️ No hay administradores en este grupo.');

  // Construir mensaje
  const aviso = `🚨 *ALERTA EN EL GRUPO* 🚨\n\n📣 El usuario @${m.sender.split('@')[0]} ha solicitado la atención de los administradores.\n\n⚠️ *Revisen el mensaje citado o la conversación actual.*`;

  // Menciones clickeables de todos los admins
  const mentions = admins.map(a => a.id);

  // Enviar mensaje citando el mensaje original si hay uno
  await conn.sendMessage(m.chat, {
    text: aviso,
    mentions
  }, { quoted: m.quoted ? m.quoted : m }); // cita el mensaje al que respondió o el propio
};

handler.command = ['avisar', 'reportar'];
handler.tags = ['group'];
handler.help = ['avisar', 'reportar'];
handler.group = true;

export default handler;

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // Dueños del bot

const handler = async (m, { conn, text, participants }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.');

  if (!text) return m.reply('📢 Escribe el motivo del aviso. Ejemplo:\n*.avisar Mensaje inapropiado*');

  const sender = m.sender;
  const senderData = participants.find(p => p.id === sender);
  const isAdmin = senderData?.admin;

  // Solo miembros pueden avisar (no restringimos por admin)
  const admins = participants.filter(p => p.admin);
  const allOwners = ownerNumbers.map(o => ({ id: o }));

  // 📄 Crear el mensaje
  const aviso = `🚨 *AVISO DE GRUPO* 🚨\n\n👤 Reportado por: @${sender.split('@')[0]}\n📢 Motivo: ${text}\n\n🧩 Administradores y dueños, por favor revisen este asunto.`;

  // Mencionar a todos los dueños y administradores
  const mentions = [...admins.map(a => a.id), ...ownerNumbers];

  await conn.sendMessage(m.chat, {
    text: aviso,
    mentions
  });
};

handler.command = ['avisar', 'reportar'];
handler.tags = ['group'];
handler.help = ['avisar <motivo>', 'reportar <motivo>'];
handler.group = true;

export default handler;

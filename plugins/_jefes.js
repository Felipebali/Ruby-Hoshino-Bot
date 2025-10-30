const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // Dueños del bot

const handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.');

  const sender = m.sender;
  const isOwner = ownerNumbers.includes(sender);
  const senderData = participants.find(p => p.id === sender);
  const isAdmin = senderData?.admin;

  // 🔒 Solo dueños o administradores pueden usar el comando
  if (!isOwner && !isAdmin) {
    return m.reply('🚫 Solo los administradores y los dueños pueden usar este comando.');
  }

  const admins = participants.filter(p => p.admin);
  const ownersInGroup = participants.filter(p => ownerNumbers.includes(p.id));
  const otherAdmins = admins.filter(a => !ownerNumbers.includes(a.id));

  // Rangos personalizados para dueños
  const ownerRanks = {
    '59898719147@s.whatsapp.net': 'Comandante Supremo 👑',
    '59896026646@s.whatsapp.net': 'Mariscal General 👑'
  };

  // Rangos y emojis para admins
  const adminRanks = [
    { title: 'Mayor', emoji: '🛡️' },
    { title: 'Capitán', emoji: '⚔️' },
    { title: 'Teniente', emoji: '🪖' },
    { title: 'Sargento', emoji: '🔰' },
    { title: 'Coronel', emoji: '📜' }
  ];

  // Construir menciones clickeables
  const ownerText = ownersInGroup.map(o => {
    const rank = ownerRanks[o.id] || 'Líder Supremo';
    return `${rank} @${o.id.split('@')[0]}`;
  });

  const adminText = otherAdmins.map((a, i) => {
    const rank = adminRanks[i % adminRanks.length];
    return `${rank.emoji} ${rank.title} @${a.id.split('@')[0]}`;
  });

  // Frases militares aleatorias
  const frases = [
    '💣 Todos los mensajes deben alinearse o enfrentarán fuego de artillería.',
    '🪖 Cada miembro desobediente será castigado con fusilamiento digital.',
    '🔥 Que tiemble el grupo: los generales controlan cada bit.',
    '☠️ Las sanciones caen con precisión quirúrgica sobre los rebeldes.',
    '⚡ Aquellos que desafíen al Comandante conocerán el horror de la disciplina.',
    '💥 Toda insubordinación será eliminada sin piedad.',
    '🛡️ La autoridad absoluta está por encima de cualquier miembro.',
    '🔫 Cada palabra fuera de lugar será registrada y castigada.'
  ];
  const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];

  let texto = `👑 *JEFES SUPREMOS DEL GRUPO* 👑\n\n`;

  if (ownersInGroup.length > 0) {
    texto += `💫 *COMANDANTES SUPREMOS:*\n`;
    texto += ownerText.join('\n');
    texto += `\n\n"${fraseAleatoria}"\n\n`;
  }

  texto += `⚡ *ADMINISTRADORES DEL GRUPO:*\n`;
  texto += adminText.join('\n') || 'Ninguno';
  texto += `\n\n⚠️ *Respeten a los jefes o sufrirán las consecuencias de la disciplina militar.*`;

  // Menciones completas (dueños + admins)
  const allMentions = [...ownersInGroup.map(o => o.id), ...otherAdmins.map(a => a.id)];

  await conn.sendMessage(m.chat, {
    text: texto,
    mentions: allMentions
  });
};

handler.command = ['jefes'];
handler.tags = ['group'];
handler.help = ['jefes'];
handler.group = true;

export default handler;

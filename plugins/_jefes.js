const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // Dueños del bot
const specialNumber = '59895044754@s.whatsapp.net'; // Persona con rango único

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
  const specialUser = participants.find(p => p.id === specialNumber);
  const otherAdmins = admins.filter(a => !ownerNumbers.includes(a.id) && a.id !== specialNumber);

  // 👑 Rangos personalizados para dueños
  const ownerRanks = {
    '59898719147@s.whatsapp.net': 'Comandante Supremo 👑',
    '59896026646@s.whatsapp.net': 'Mariscal General 👑'
  };

  // 🌟 Rango único especial
  const specialRank = '✨ General Estelar del Ejército FelixCat 🚀';

  // 🪖 Rangos y emojis para admins
  const adminRanks = [
    { title: 'Coronel', emoji: '📜' },
    { title: 'Mayor', emoji: '🛡️' },
    { title: 'Capitán', emoji: '⚔️' },
    { title: 'Teniente', emoji: '🪖' },
    { title: 'Sargento', emoji: '🔰' },
    { title: 'Cabo', emoji: '🎖️' },
    { title: 'Soldado de Élite', emoji: '🏅' },
    { title: 'Táctico de Guerra', emoji: '🎯' },
    { title: 'Comandante de Campo', emoji: '🪓' },
    { title: 'Oficial Estratégico', emoji: '🗺️' },
    { title: 'Operador Especial', emoji: '🔫' },
    { title: 'Centinela', emoji: '🧭' },
    { title: 'Guardia Real', emoji: '🦾' },
    { title: 'Veterano de Batalla', emoji: '🦅' },
    { title: 'Instructor de Tropas', emoji: '📢' }
  ];

  // 💬 Frases militares aleatorias
  const frases = [
    '💣 Todos los mensajes deben alinearse o enfrentarán fuego de artillería.',
    '🪖 Cada miembro desobediente será castigado con fusilamiento digital.',
    '🔥 Que tiemble el grupo: los generales controlan cada bit.',
    '☠️ Las sanciones caen con precisión quirúrgica sobre los rebeldes.',
    '⚡ Aquellos que desafíen al Comandante conocerán el horror de la disciplina.',
    '💥 Toda insubordinación será eliminada sin piedad.',
    '🛡️ La autoridad absoluta está por encima de cualquier miembro.',
    '🔫 Cada palabra fuera de lugar será registrada y castigada.',
    '🎯 El orden y la obediencia son pilares del escuadrón digital.',
    '🚀 Bajo el mando de los jefes, el caos no tiene lugar.'
  ];
  const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];

  // 🫡 Texto de dueños
  let texto = `👑 *JEFES SUPREMOS DEL GRUPO* 👑\n\n`;
  if (ownersInGroup.length > 0) {
    texto += `💫 *COMANDANTES SUPREMOS:*\n`;
    texto += ownersInGroup
      .map(o => `${ownerRanks[o.id] || 'Líder Supremo'} @${o.id.split('@')[0]}`)
      .join('\n');
    texto += `\n\n"${fraseAleatoria}"\n\n`;
  }

  // 🌟 Usuario especial (si está en el grupo)
  if (specialUser) {
    texto += `🌠 *MIEMBRO DISTINGUIDO:*\n`;
    texto += `${specialRank} @${specialUser.id.split('@')[0]}\n\n`;
  }

  // ⚡ Otros administradores
  const adminText = otherAdmins.map((a, i) => {
    const rank = adminRanks[i % adminRanks.length];
    return `${rank.emoji} ${rank.title} @${a.id.split('@')[0]}`;
  });

  texto += `⚡ *ADMINISTRADORES DEL GRUPO:*\n`;
  texto += adminText.join('\n') || 'Ninguno';
  texto += `\n\n⚠️ *Respeten a los jefes o sufrirán las consecuencias de la disciplina militar.*`;

  // 📣 Menciones completas
  const allMentions = [
    ...ownersInGroup.map(o => o.id),
    ...(specialUser ? [specialUser.id] : []),
    ...otherAdmins.map(a => a.id)
  ];

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

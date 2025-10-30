const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // Dueños del bot

const handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.');

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

  // 🧠 Obtener nombres de los usuarios
  const getDisplayName = async (jid) => {
    const name = await conn.getName(jid);
    return name?.replace(/\n/g, ' ') || jid.split('@')[0];
  };

  // Frases militares grotescas
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

  // 🔧 Construcción de texto dinámico con menciones y nombres
  const ownerMentions = [];
  const ownerText = [];

  for (const o of ownersInGroup) {
    const name = await getDisplayName(o.id);
    const rank = ownerRanks[o.id] || 'Dueño';
    ownerText.push(`${rank} @${name}`);
    ownerMentions.push(o.id);
  }

  const adminText = [];
  const adminMentions = [];

  for (let i = 0; i < otherAdmins.length; i++) {
    const a = otherAdmins[i];
    const name = await getDisplayName(a.id);
    const rank = adminRanks[i % adminRanks.length];
    adminText.push(`${rank.emoji} ${rank.title} @${name}`);
    adminMentions.push(a.id);
  }

  // 📜 Texto final
  let texto = `👑 *JEFES SUPREMOS DEL GRUPO* 👑\n\n`;

  if (ownerText.length > 0) {
    texto += `💫 *COMANDANTES SUPREMOS:*\n`;
    texto += ownerText.join('\n');
    texto += `\n\n"${fraseAleatoria}"\n\n`;
  }

  texto += `⚡ *ADMINISTRADORES DEL GRUPO:*\n`;
  texto += adminText.join('\n') || 'Ninguno';
  texto += `\n\n⚠️ *Respeten a los jefes o sufrirán las consecuencias de la disciplina militar.*`;

  await conn.sendMessage(m.chat, {
    text: texto,
    mentions: [...ownerMentions, ...adminMentions]
  });
};

handler.command = ['jefes'];
handler.tags = ['group'];
handler.help = ['jefes'];
handler.group = true;

export default handler;

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // Dueños del bot

const handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.');

  const admins = participants.filter(p => p.admin);
  const ownersInGroup = participants.filter(p => ownerNumbers.includes(p.id));
  const otherAdmins = admins.filter(a => !ownerNumbers.includes(a.id));

  // Rangos personalizados
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

  // Obtener nombre visible del contacto
  const getDisplayName = async (jid) => {
    const name = await conn.getName(jid);
    return name?.replace(/\n/g, ' ') || jid.split('@')[0];
  };

  // Frases aleatorias
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

  // Texto principal
  let texto = `👑 *JEFES SUPREMOS DEL GRUPO* 👑\n\n💫 *COMANDANTES SUPREMOS:*\n`;

  const mentions = [];

  // Añadir dueños
  for (const o of ownersInGroup) {
    const name = await getDisplayName(o.id);
    texto += `${ownerRanks[o.id] || 'Dueño'} @${name}\n`;
    mentions.push(o.id);
  }

  texto += `\n"${fraseAleatoria}"\n\n⚡ *ADMINISTRADORES DEL GRUPO:*\n`;

  if (otherAdmins.length === 0) {
    texto += 'Ninguno\n';
  } else {
    for (let i = 0; i < otherAdmins.length; i++) {
      const a = otherAdmins[i];
      const name = await getDisplayName(a.id);
      const rank = adminRanks[i % adminRanks.length];
      texto += `${rank.emoji} ${rank.title} @${name}\n`;
      mentions.push(a.id);
    }
  }

  texto += `\n⚠️ *Respeten a los jefes o sufrirán las consecuencias de la disciplina militar.*`;

  await conn.sendMessage(m.chat, { text: texto.trim(), mentions });
};

handler.command = ['jefes'];
handler.tags = ['group'];
handler.help = ['jefes'];
handler.group = true;

export default handler;

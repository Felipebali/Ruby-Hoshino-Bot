const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // dueños

const handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.');

  const admins = participants.filter(p => p.admin);
  const ownersInGroup = participants.filter(p => ownerNumbers.includes(p.id));
  const otherAdmins = admins.filter(a => !ownerNumbers.includes(a.id));

  // Rangos de dueños
  const ownerRanks = {
    '59898719147@s.whatsapp.net': '👑 Comandante Supremo',
    '59896026646@s.whatsapp.net': '👑 Mariscal General'
  };

  // Rangos para admins
  const adminRanks = ['🛡️ Mayor', '⚔️ Capitán', '🪖 Teniente', '🔰 Sargento', '📜 Coronel'];

  // Frases aleatorias
  const frases = [
    '💣 Todos los mensajes deben alinearse o enfrentarán fuego de artillería.',
    '🪖 Cada miembro desobediente será castigado con fusilamiento digital.',
    '🔥 Que tiemble el grupo: los generales controlan cada bit.',
    '☠️ Las sanciones caen con precisión quirúrgica sobre los rebeldes.',
    '⚡ Aquellos que desafíen al Comandante conocerán el horror de la disciplina.',
    '💥 Toda insubordinación será eliminada sin piedad.'
  ];
  const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];

  let texto = `👑 *JEFES SUPREMOS DEL GRUPO* 👑\n\n💫 *COMANDANTES SUPREMOS:*\n`;
  const mentions = [];

  // 🔹 Dueños
  for (const o of ownersInGroup) {
    texto += `${ownerRanks[o.id] || 'Dueño'} @${o.id.split('@')[0]}\n`;
    mentions.push(o.id);
  }

  texto += `\n"${fraseAleatoria}"\n\n⚡ *ADMINISTRADORES DEL GRUPO:*\n`;

  if (otherAdmins.length === 0) {
    texto += 'Ninguno\n';
  } else {
    otherAdmins.forEach((a, i) => {
      const rank = adminRanks[i % adminRanks.length];
      texto += `${rank} @${a.id.split('@')[0]}\n`;
      mentions.push(a.id);
    });
  }

  texto += `\n⚠️ *Respeten a los jefes o sufrirán las consecuencias de la disciplina militar.*`;

  // 📤 Enviar con menciones clickeables reales
  await conn.sendMessage(m.chat, {
    text: texto,
    mentions: mentions
  }, { quoted: m });
};

handler.command = ['jefes'];
handler.tags = ['group'];
handler.help = ['jefes'];
handler.group = true;

export default handler;

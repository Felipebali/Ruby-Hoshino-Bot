// 📂 plugins/owner-info.js
const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // Números de los dueños

const handler = async (m, { conn }) => {
  const ownersInContacts = [];

  // Buscar en lista de contactos y generar datos
  for (const id of ownerNumbers) {
    const contact = conn.contacts[id] || {};
    const name = contact.notify || contact.name || contact.vname || 'Desconocido';
    ownersInContacts.push({ id, name });
  }

  // Rango especial de cada dueño
  const ownerRanks = {
    '59898719147@s.whatsapp.net': '👑 Comandante Supremo',
    '59896026646@s.whatsapp.net': '⚔️ Mariscal General'
  };

  // Frases temáticas
  const frases = [
    '🪖 El poder no se otorga, se conquista.',
    '💫 Los dueños mantienen el orden del reino digital.',
    '🔥 En su presencia, hasta los bits se alinean.',
    '⚡ Nadie escapa del juicio de los Comandantes.',
    '👁️ La autoridad suprema vigila cada mensaje.',
    '📜 Sus decisiones son ley dentro del grupo.',
    '🚀 Desde lo alto del trono, gobiernan con precisión.'
  ];
  const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];

  let texto = `👑 *INFORMACIÓN DE LOS DUEÑOS DEL BOT* 👑\n\n`;

  for (const o of ownersInContacts) {
    const numero = o.id.split('@')[0];
    const rango = ownerRanks[o.id] || 'Líder Supremo';
    texto += `🔰 *Nombre:* ${o.name}\n`;
    texto += `📞 *Número:* +${numero}\n`;
    texto += `🎖️ *Rango:* ${rango}\n`;
    texto += `🕶️ *Mención:* @${numero}\n\n`;
  }

  texto += `💬 "${fraseAleatoria}"`;

  await conn.sendMessage(m.chat, {
    text: texto,
    mentions: ownerNumbers
  });
};

handler.command = ['owner', 'dueño'];
handler.tags = ['info'];
handler.help = ['owner'];
handler.group = true; // Puede usarse en grupos
handler.register = true;

export default handler;

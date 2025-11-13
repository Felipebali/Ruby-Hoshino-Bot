// 📂 plugins/owner-info.js — FelixCat-Bot 🐾
// Muestra la info de los dueños o solo la del que usa el comando

const ownerNumbers = [
  '59898719147@s.whatsapp.net', // Feli
  '59896026646@s.whatsapp.net', // G
  '59892363485@s.whatsapp.net'  // Nuevo dueño
];

// 🏅 Rangos personalizados
const ownerRanks = {
  '59898719147@s.whatsapp.net': '👑 Comandante Supremo',
  '59896026646@s.whatsapp.net': '⚔️ Mariscal General',
  '59892363485@s.whatsapp.net': '🛡️ Capitán Estratégico'
};

// 🌟 Frases aleatorias
const frases = [
  '🪖 El poder no se otorga, se conquista.',
  '💫 Los dueños mantienen el orden del reino digital.',
  '🔥 En su presencia, hasta los bits se alinean.',
  '⚡ Nadie escapa del juicio de los Comandantes.',
  '👁️ La autoridad suprema vigila cada mensaje.',
  '📜 Sus decisiones son ley dentro del grupo.',
  '🚀 Desde lo alto del trono, gobiernan con precisión.'
];

let handler = async (m, { conn }) => {
  try {
    if (!ownerNumbers.length) return m.reply('⚠️ No hay dueños configurados.');

    const sender = m.sender;
    const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];

    // 🧾 Si quien usa el comando es un dueño
    if (ownerNumbers.includes(sender)) {
      const rango = ownerRanks[sender] || 'Líder Supremo';
      const numero = sender.split('@')[0];

      const texto = `👑 *INFORMACIÓN DE TU PERFIL DE DUEÑO* 👑\n\n` +
        `🔰 *Número:* +${numero}\n` +
        `🎖️ *Rango:* ${rango}\n` +
        `💬 "${fraseAleatoria}"`;

      await conn.sendMessage(m.chat, {
        text: texto,
        mentions: [sender]
      }, { quoted: m });

      return;
    }

    // 🧾 Si quien lo usa NO es dueño → muestra lista completa
    let texto = `👑 *INFORMACIÓN DE LOS DUEÑOS DEL BOT* 👑\n\n`;
    for (const id of ownerNumbers) {
      const numero = id.split('@')[0];
      const rango = ownerRanks[id] || 'Líder Supremo';

      texto += `🔰 *Número:* +${numero}\n`;
      texto += `🎖️ *Rango:* ${rango}\n`;
      texto += `🕶️ *Mención:* @${numero}\n\n`;
    }

    texto += `💬 "${fraseAleatoria}"`;

    await conn.sendMessage(m.chat, {
      text: texto,
      mentions: ownerNumbers
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ Ocurrió un error al mostrar la información del dueño.');
  }
};

handler.command = ['owner', 'dueño'];
handler.help = ['owner'];
handler.tags = ['info'];
handler.group = false;

export default handler;

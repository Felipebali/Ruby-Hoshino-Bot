// 📂 plugins/owner-info.js

const ownerNumbers = [
  '59898719147@s.whatsapp.net', // Feli
  '59896026646@s.whatsapp.net', // G
  '59892363485@s.whatsapp.net'  // Nuevo dueño
]; 

const handler = async (m, { conn }) => {
  try {
    if (!ownerNumbers.length) return m.reply('⚠️ No hay dueños configurados.');

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
    const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];

    // 🧾 Construcción del mensaje
    let texto = `👑 *INFORMACIÓN DE LOS DUEÑOS DEL BOT* 👑\n\n`;

    for (const id of ownerNumbers) {
      const numero = id.split('@')[0];
      const rango = ownerRanks[id] || 'Líder Supremo';

      texto += `🔰 *Número:* +${numero}\n`;
      texto += `🎖️ *Rango:* ${rango}\n`;
      texto += `🕶️ *Mención:* @${numero}\n\n`;
    }

    texto += `💬 "${fraseAleatoria}"`;

    // ✉️ Envío del mensaje con menciones
    await conn.sendMessage(m.chat, {
      text: texto,
      mentions: ownerNumbers
    });
  } catch (e) {
    console.error(e);
    m.reply('❌ Ocurrió un error al mostrar los datos del dueño.');
  }
};

handler.command = ['owner', 'dueño'];
handler.help = ['owner'];
handler.tags = ['info'];
handler.group = false; // puede usarse en privado o grupo

export default handler;

// 📂 plugins/gay.js
let handler = async (m, { conn, mentionedJid, quoted }) => {
  try {
    const chat = global.db.data.chats[m.chat] || {};
    const gamesEnabled = chat.games !== false;

    if (!gamesEnabled) {
      return conn.sendMessage(m.chat, {
        text: '🎮 *Los mini-juegos están desactivados.*\nActívalos con *.juegos* 🔓'
      });
    }

    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

    // 🎯 Detectar a quién se le aplicará el test
    let target;

    if (quoted && quoted.sender) {
      target = quoted.sender; // prioridad: mensaje citado
    } else if (mentionedJid && mentionedJid[0]) {
      target = mentionedJid[0]; // segundo: menciones
    } else {
      target = m.sender; // si no hay cita ni mención
    }

    // 🎲 Generar porcentaje aleatorio
    const porcentaje = Math.floor(Math.random() * 101);

    // 💬 Frases aleatorias divertidas
    const frases = [
      "🌈 Vive la vida con brillo y sin miedo 😘",
      "💅 Más fabulos@ que nunca ✨",
      "😏 La bandera te representa con orgullo",
      "🦄 Nació para iluminar el arcoíris",
      "👠 Diva certificada del mes 💖",
      "💋 Confirmado por la NASA, gay de otro planeta 🪐",
    ];
    const frase = frases[Math.floor(Math.random() * frases.length)];

    // 📄 Mensaje con mención clickeable
    const texto = `
🏳️‍🌈 *TEST GAY FELIXCAT* 🐾

@${target.split('@')[0]} es *${porcentaje}% gay* 😹

${frase}
`;

    await conn.sendMessage(
      m.chat,
      { text: texto, mentions: [target] },
      { quoted: m }
    );

  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, '✖️ Error al ejecutar el test gay.', m);
  }
};

handler.command = ['gay'];
handler.tags = ['fun'];
handler.help = ['gay <@user>'];
handler.group = true;

export default handler;

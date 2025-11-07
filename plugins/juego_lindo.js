// 📂 plugins/lindo.js
let handler = async (m, { conn, participants, command }) => {
  try {
    // ✅ Verifica si los juegos están activados
    const chat = global.db.data.chats[m.chat] || {};
    const gamesEnabled = chat.games !== false;

    if (!gamesEnabled) {
      return conn.sendMessage(m.chat, {
        text: '🎮 *Los mini-juegos están desactivados.*\nActívalos con *.juegos* 🔓',
      });
    }

    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

    // 🧍‍♂️ Detectar a quién se aplicará el test
    let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;

    // 🎲 Porcentaje aleatorio
    const porcentaje = Math.floor(Math.random() * 101);

    // 😻 Frases aleatorias según el comando
    const frasesLindo = [
      "😎 Fachero facherito 🔥",
      "💘 Rompe corazones oficial del grupo 😍",
      "✨ Tan lindo que debería estar en un cuadro 💅",
      "🐾 Su belleza gatuna no tiene comparación 😻",
      "💫 Irresistible y con estilo propio 💖",
      "🎯 100% aprobado por FelixCat Industries 😼",
    ];

    const frasesLinda = [
      "💖 La más hermosa del grupo 😍",
      "🌸 Tan linda que hace brillar el chat ✨",
      "💅 Pura elegancia felina 😻",
      "🌹 Debería tener su propio filtro de belleza 💋",
      "😽 Una diosa con encanto natural 💞",
      "🐾 FelixCat confirma: belleza nivel celestial 😇",
    ];

    const frases = command === 'linda' ? frasesLinda : frasesLindo;
    const frase = frases[Math.floor(Math.random() * frases.length)];

    // 🧾 Mensaje final con mención clickeable
    const texto = `
💞 *TEST DE BELLEZA FELIXCAT* 🐾

@${target.split('@')[0]} es *${porcentaje}% ${command === 'linda' ? 'linda' : 'lindo'}* 😻

${frase}
`;

    await conn.sendMessage(m.chat, { text: texto, mentions: [target] }, { quoted: m });

  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, '✖️ Error al ejecutar el test de belleza.', m);
  }
};

handler.command = ['lindo', 'linda'];
handler.tags = ['fun'];
handler.help = ['lindo <@user>', 'linda <@user>'];
handler.group = true;

export default handler;

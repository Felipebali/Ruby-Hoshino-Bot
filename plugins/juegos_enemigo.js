// 📂 plugins/enemigo.js
let handler = async (m, { conn, participants }) => {
  try {
    // Verificar si los juegos están activados en el chat
    const chat = global.db.data.chats[m.chat] || {};
    const gamesEnabled = chat.games !== false; // Por defecto activados

    if (!gamesEnabled) {
      return conn.sendMessage(m.chat, {
        text: '⚠️ Los mini-juegos están desactivados.\nUn admin puede activarlos con *.juegos* 🔴'
      });
    }

    // Verificar si hay suficientes personas
    if (!participants || participants.length < 2) {
      return conn.sendMessage(m.chat, { text: '👥 Se necesitan al menos 2 personas en el grupo para este juego.' });
    }

    // Elegir dos personas al azar
    let user1 = participants[Math.floor(Math.random() * participants.length)].id;
    let user2;
    do {
      user2 = participants[Math.floor(Math.random() * participants.length)].id;
    } while (user1 === user2);

    // Mensaje aleatorio divertido
    const frases = [
      "🔥 La batalla está servida, ¡que gane el más fuerte!",
      "💣 Dos enemigos jurados han nacido hoy.",
      "⚡ El odio entre estos dos se siente en el aire.",
      "😈 Que empiece la guerra... sin piedad.",
      "💥 Este enfrentamiento pasará a la historia."
    ];
    const frase = frases[Math.floor(Math.random() * frases.length)];

    // Crear mensaje final
    let text = `
💢 *ENEMIGOS GATUNOS DETECTADOS* 💢

🐾 ${await conn.getName(user1)} VS ${await conn.getName(user2)}

${frase}
`;

    await conn.sendMessage(m.chat, { text, mentions: [user1, user2] }, { quoted: m });

  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, '✖️ Ocurrió un error al ejecutar el juego.', m);
  }
};

handler.command = ['enemigo', 'enemigos'];
handler.group = true;

export default handler; 

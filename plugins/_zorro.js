// 📂 plugins/gay.js
let handler = async (m, { conn, command, mentionedJid, quoted }) => {
  try {
    const chatData = global.db.data.chats[m.chat] || {};

    // ⚠️ Verificar si los juegos están activados
    if (!chatData.games) {
      return await conn.sendMessage(
        m.chat,
        { text: '❌ Los mini-juegos están desactivados en este chat. Usa *.juegos* para activarlos.' },
        { quoted: m }
      );
    }

    // Determinar objetivo
    let who = quoted ? (quoted.sender || (quoted.key && quoted.key.participant)) 
                      : (mentionedJid && mentionedJid[0]) 
                      || m.sender;
    let simpleId = who.split("@")[0];

    // Calcular porcentaje aleatorio
    let porcentaje = Math.floor(Math.random() * 101);

    // Crear barra visual usando 🏳️‍🌈
    const totalBars = 10;
    const filledBars = Math.round(porcentaje / 10);
    const bar = '🏳️‍🌈'.repeat(filledBars) + '⬜'.repeat(totalBars - filledBars);

    // Frases según porcentaje
    let frase;
    if (porcentaje >= 95) frase = '🏳️‍🌈 Nivel divino: eres el arcoíris viviente.';
    else if (porcentaje >= 80) frase = '💅 Fabulos@ total: nadie te alcanza.';
    else if (porcentaje >= 65) frase = '🦄 Brillas con estilo y orgullo.';
    else if (porcentaje >= 50) frase = '😉 Seguro/a y confiado/a en tu arcoíris.';
    else if (porcentaje >= 35) frase = '🤭 Algo de color se nota, pero sutil.';
    else if (porcentaje >= 20) frase = '😇 Bastante tranquilo/a, pero con chispa.';
    else if (porcentaje >= 5) frase = '😎 Casi neutral, solo un toque de brillo.';
    else frase = '🗿 Puro/a e inocente, sin arcoíris aún.';

    // Título del test
    const titulo = '🏳️‍🌈 *TEST GAY FELIXCAT 2.0* 🐾';

    // Armar mensaje final
    let msg = `
${titulo}

👤 *Usuario:* @${simpleId}
📊 *Nivel de gay:* ${porcentaje}%

${bar}

💬 ${frase}
`.trim();

    // Enviar mensaje con mención
    await conn.sendMessage(m.chat, { text: msg, mentions: [who] }, { quoted: m });

  } catch (err) {
    console.error(err);
    return conn.reply(m.chat, '❌ Error ejecutando el comando .gay', m);
  }
};

handler.help = ['gay'];
handler.tags = ['fun', 'juego'];
handler.command = /^(gay)$/i;
handler.group = true;

export default handler;

// 📂 plugins/juego-humilla.js

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

    // Determinar objetivo: citado o mencionado
    let target = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0]) || m.sender;

    // Nivel de ilusión aleatorio
    const porcentaje = Math.floor(Math.random() * 101);

    // Barra visual
    const totalBars = 10;
    const filledBars = Math.round(porcentaje / 10);
    const bar = '💖'.repeat(filledBars) + '⬜'.repeat(totalBars - filledBars);

    // Frases sarcásticas según porcentaje
    let frase;
    if (porcentaje > 90) frase = '😍 ¡Te tiene ilusionado/a al máximo! Pero shhh… solo es diversión.';
    else if (porcentaje > 70) frase = '🥰 Muy ilusionado/a, te va a romper el corazón si te das cuenta.';
    else if (porcentaje > 50) frase = '😏 Algo ilusionado/a… pero no te emociones demasiado.';
    else if (porcentaje > 30) frase = '😅 Apenas te ilusiona, pero vos ya te estás haciendo drama.';
    else frase = '🗿 No te ilusiona nada… y aún así te preocupás.';

    const texto = `
🎮 *Juego de Ilusión Humillante* 💀

👤 @${target.split('@')[0]} te ilusiona: ${porcentaje}%

${bar}

💬 ${frase}
`;

    await conn.sendMessage(
      m.chat,
      { text: texto, mentions: [target] },
      { quoted: m }
    );

  } catch (e) {
    console.error(e);
    await m.reply('⚠️ Ocurrió un error ejecutando el juego ilusiona-humilla.');
  }
};

handler.help = ['ilusionado', 'ilusionada'];
handler.tags = ['fun', 'juego'];
handler.command = /^(ilusionado|ilusionada)$/i;
handler.group = true;

export default handler;

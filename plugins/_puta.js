let handler = async (m, { conn }) => {
  try {
    const chatData = global.db.data.chats[m.chat] || {};

    // ⚠️ Verificar si los juegos están activados en este chat
    if (!chatData.games) {
      return await conn.sendMessage(m.chat, { text: '❌ Los mini-juegos están desactivados en este chat. Usa .juegos para activarlos.' }, { quoted: m });
    }

    // Determinar objetivo: citado > mencionado > autor
    let who = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0]) || m.sender;
    let simpleId = who.split("@")[0];

    // Obtener nombre
    let name = conn.getName ? conn.getName(who) : simpleId;
    if (!name) name = simpleId;

    // Generar porcentaje aleatorio 0-100
    let porcentaje = Math.floor(Math.random() * 101);

    // Barra visual 0-10
    let filled = Math.round(porcentaje / 10);
    let bar = '█'.repeat(filled) + '░'.repeat(10 - filled);

    // Frases según porcentaje
    let frase;
    if (porcentaje >= 90) frase = '🔥 Modo diosa/o';
    else if (porcentaje >= 70) frase = '😏 Rompe corazones';
    else if (porcentaje >= 50) frase = '😉 Coquetea sin miedo';
    else if (porcentaje >= 30) frase = '😅 Disimula un poco';
    else if (porcentaje >= 10) frase = '😇 Casi inocente';
    else frase = '👼 Nivel ángel';

    // Mensaje final con mención clickeable
    let msg = [
      `💄 *Test de Puta 2.1*`,
      ``,
      `👤 @${simpleId}`,
      `📊 Nivel: *${porcentaje}%*`,
      `▸ ${bar}`,
      ``,
      `💬 ${frase}`
    ].join('\n');

    // Enviar mensaje con mención clickeable
    await conn.sendMessage(m.chat, { text: msg, mentions: [who] }, { quoted: m });

  } catch (err) {
    console.error(err);
    return conn.reply(m.chat, '❌ Error ejecutando el comando .puta', m);
  }
}

handler.help = ['puta'];
handler.tags = ['fun'];
handler.command = /^puta$/i;
handler.group = true; // solo grupos
handler.rowner = false;

export default handler;

// 🐱 FelixCat_Bot - plugin match.js
// Comando: .match  / .macht
// Hace parejas aleatorias en el grupo

let handler = async (m, { conn, args }) => {
  try {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

    // obtener participantes del grupo
    const groupMetadata = await conn.groupMetadata(m.chat);
    let participants = groupMetadata.participants.map(p => p.id);

    // excluir al bot y a los dueños
    const botNumber = conn.user?.id.split(':')[0];
    const owners = ['59898719147', '59896026646'];
    participants = participants.filter(p => {
      const num = p.replace(/@s\.whatsapp\.net$/, '');
      return num !== botNumber && !owners.includes(num);
    });

    if (participants.length < 2) return m.reply('👀 No hay suficientes personas para hacer un match.');

    // función auxiliar
    const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

    // modo general (.match all)
    if (args[0] && args[0].toLowerCase() === 'all') {
      participants = participants.sort(() => Math.random() - 0.5);
      let msg = '💘 *MATCH GENERAL* 💘\n\n';
      let mentions = [];

      for (let i = 0; i < participants.length; i += 2) {
        if (participants[i + 1]) {
          msg += `💞 @${participants[i].split('@')[0]} ❤️ @${participants[i + 1].split('@')[0]}\n`;
          mentions.push(participants[i], participants[i + 1]);
        } else {
          msg += `😿 @${participants[i].split('@')[0]} se quedó sin pareja 💔\n`;
          mentions.push(participants[i]);
        }
      }

      await conn.sendMessage(m.chat, { text: msg, mentions }, { quoted: m });
      return;
    }

    // si se menciona a alguien (.match @usuario)
    let mentioned = m.mentionedJid && m.mentionedJid[0];
    if (mentioned) {
      const partner = pickRandom(participants.filter(p => p !== mentioned));
      const msg = `💞 *MATCH ENCONTRADO* 💞\n\n@${mentioned.split('@')[0]} ❤️ @${partner.split('@')[0]}\n\n¡Qué linda pareja 😻!`;
      await conn.sendMessage(m.chat, { text: msg, mentions: [mentioned, partner] }, { quoted: m });
      return;
    }

    // si no se menciona, empareja al autor con otro
    const author = m.sender;
    const partner = pickRandom(participants.filter(p => p !== author));
    const msg = `💞 *MATCH ALEATORIO* 💞\n\n@${author.split('@')[0]} ❤️ @${partner.split('@')[0]}\n\n¡El amor está en el aire 😽!`;
    await conn.sendMessage(m.chat, { text: msg, mentions: [author, partner] }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('⚠️ Ocurrió un error al generar el match.');
  }
};

handler.help = ['match', 'macht'];
handler.tags = ['fun'];
handler.command = /^(match|macht)$/i;
handler.group = true;

export default handler;

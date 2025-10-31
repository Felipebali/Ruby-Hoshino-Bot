// plugins/parejas.js
let propuestas = {}; // Guardará las propuestas activas
let parejas = {}; // Guardará las parejas formadas

const handler = async (m, { conn, command, args }) => {
  const sender = m.sender;
  const chatId = m.chat;
  const text = m.text;
  const mentioned = m.mentionedJid ? m.mentionedJid[0] : null;

  switch (command) {

    // 💍 PROPUESTA
    case 'marry':
      if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.');
      if (!mentioned) return m.reply('💞 Debes mencionar a alguien. Ejemplo: *.marry @usuario*');
      if (mentioned === sender) return m.reply('❌ No puedes casarte contigo mismo.');
      if (parejas[sender]) return m.reply('💔 Ya tienes pareja.');
      if (parejas[mentioned]) return m.reply('💔 Esa persona ya tiene pareja.');

      propuestas[mentioned] = { proponente: sender, chat: chatId };
      await conn.sendMessage(chatId, {
        text: `💍 *${(await conn.getName(sender))}* le propuso matrimonio a *@${mentioned.split('@')[0]}*\n\n👉 Usa *.aceptar* o *.rechazar* para responder.`,
        mentions: [sender, mentioned]
      });
      break;

    // 💖 ACEPTAR PROPUESTA
    case 'aceptar':
      if (!propuestas[sender]) return m.reply('❌ No tienes ninguna propuesta pendiente.');
      const { proponente } = propuestas[sender];
      if (!proponente) return m.reply('⚠️ Error interno, intenta de nuevo.');

      parejas[sender] = proponente;
      parejas[proponente] = sender;

      delete propuestas[sender];
      await conn.sendMessage(chatId, {
        text: `💞 *${(await conn.getName(sender))}* y *${(await conn.getName(proponente))}* ahora son pareja oficial ❤️\n\n✨ ¡Felicidades a ambos! ✨`,
        mentions: [sender, proponente]
      });
      break;

    // 💔 RECHAZAR PROPUESTA
    case 'rechazar':
      if (!propuestas[sender]) return m.reply('❌ No tienes ninguna propuesta pendiente.');
      const { proponente: rechazado } = propuestas[sender];
      delete propuestas[sender];
      await conn.sendMessage(chatId, {
        text: `💔 *@${sender.split('@')[0]}* ha rechazado la propuesta de *@${rechazado.split('@')[0]}*.`,
        mentions: [sender, rechazado]
      });
      break;

    // 📜 LISTA DE PAREJAS
    case 'listap':
      if (Object.keys(parejas).length === 0) return m.reply('💤 No hay parejas registradas todavía.');
      let lista = [];
      let usados = new Set();
      for (let [a, b] of Object.entries(parejas)) {
        if (!usados.has(a) && !usados.has(b)) {
          lista.push(`💞 *@${a.split('@')[0]}* ❤️ *@${b.split('@')[0]}*`);
          usados.add(a);
          usados.add(b);
        }
      }
      await conn.sendMessage(chatId, {
        text: `🌹 *Lista de Parejas FelixCat 💫*\n\n${lista.join('\n')}`,
        mentions: [...usados]
      });
      break;

    // 💔 TERMINAR RELACIÓN
    case 'terminar':
      if (!parejas[sender]) return m.reply('😿 No tienes pareja actualmente.');
      const pareja = parejas[sender];
      delete parejas[sender];
      delete parejas[pareja];
      await conn.sendMessage(chatId, {
        text: `💔 *@${sender.split('@')[0]}* ha terminado su relación con *@${pareja.split('@')[0]}*.`,
        mentions: [sender, pareja]
      });
      break;
  }
};

handler.command = /^(marry|aceptar|rechazar|listap|terminar)$/i;
export default handler;

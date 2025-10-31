
// 💞 Sistema de parejas FelixCat_Bot
if (!global.propuestas) global.propuestas = {};
if (!global.parejas) global.parejas = {};

let handler = async (m, { conn, command, args }) => {
  const sender = m.sender;
  const chat = m.chat;
  const mentioned = m.mentionedJid ? m.mentionedJid[0] : null;

  switch (command) {

    // 💍 PROPUESTA
    case 'marry':
      if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.');
      if (!mentioned) return m.reply('💞 Debes mencionar a alguien.\n👉 Ejemplo: *.marry @usuario*');
      if (mentioned === sender) return m.reply('❌ No puedes casarte contigo mismo.');
      if (global.parejas[sender]) return m.reply('💔 Ya tienes pareja.');
      if (global.parejas[mentioned]) return m.reply('💔 Esa persona ya tiene pareja.');

      global.propuestas[mentioned] = { de: sender, chat: chat };
      await conn.sendMessage(chat, {
        text: `💍 *${await conn.getName(sender)}* le propuso matrimonio a *@${mentioned.split('@')[0]}* 💞\n\nResponde con *.aceptar* o *.rechazar* para decidir 💌`,
        mentions: [sender, mentioned]
      });
      break;

    // 💖 ACEPTAR PROPUESTA
    case 'aceptar':
      if (!global.propuestas[sender]) return m.reply('❌ No tienes ninguna propuesta pendiente.');
      const { de } = global.propuestas[sender];
      if (!de) return m.reply('⚠️ Error interno, intenta de nuevo.');

      // Registrar pareja
      global.parejas[sender] = de;
      global.parejas[de] = sender;
      delete global.propuestas[sender];

      await conn.sendMessage(chat, {
        text: `💞 *${await conn.getName(sender)}* y *${await conn.getName(de)}* ahora son pareja oficial ❤️\n\n🎉 ¡Felicidades! 🎉`,
        mentions: [sender, de]
      });
      break;

    // 💔 RECHAZAR PROPUESTA
    case 'rechazar':
      if (!global.propuestas[sender]) return m.reply('❌ No tienes ninguna propuesta pendiente.');
      const { de: rechazado } = global.propuestas[sender];
      delete global.propuestas[sender];

      await conn.sendMessage(chat, {
        text: `💔 *@${sender.split('@')[0]}* ha rechazado la propuesta de *@${rechazado.split('@')[0]}* 😢`,
        mentions: [sender, rechazado]
      });
      break;

    // 📜 LISTA DE PAREJAS
    case 'listap':
      const parejas = Object.entries(global.parejas);
      if (parejas.length === 0) return m.reply('💤 No hay parejas registradas todavía.');

      let usados = new Set();
      let lista = [];
      for (let [a, b] of parejas) {
        if (!usados.has(a) && !usados.has(b)) {
          lista.push(`💞 *@${a.split('@')[0]}* ❤️ *@${b.split('@')[0]}*`);
          usados.add(a);
          usados.add(b);
        }
      }

      await conn.sendMessage(chat, {
        text: `🌹 *Lista de Parejas FelixCat 💫*\n\n${lista.join('\n')}`,
        mentions: [...usados]
      });
      break;

    // 💔 TERMINAR RELACIÓN
    case 'terminar':
      if (!global.parejas[sender]) return m.reply('😿 No tienes pareja actualmente.');
      const pareja = global.parejas[sender];
      delete global.parejas[sender];
      delete global.parejas[pareja];

      await conn.sendMessage(chat, {
        text: `💔 *@${sender.split('@')[0]}* ha terminado su relación con *@${pareja.split('@')[0]}*.`,
        mentions: [sender, pareja]
      });
      break;
  }
};

handler.command = /^(marry|aceptar|rechazar|listap|terminar)$/i;
export default handler;

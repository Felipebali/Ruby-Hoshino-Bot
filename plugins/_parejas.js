// plugins/parejas.js
// Guardado en db.data.parejas y db.data.propuestas para persistencia
if (!global.db.data.parejas) global.db.data.parejas = {};
if (!global.db.data.propuestas) global.db.data.propuestas = {};

const handler = async (m, { conn, command }) => {
  const sender = m.sender;
  const chat = m.chat;
  const mentioned = m.mentionedJid ? m.mentionedJid[0] : null;
  const parejas = global.db.data.parejas;
  const propuestas = global.db.data.propuestas;

  switch (command) {

    case 'marry':
      if (!mentioned) return m.reply('💞 Menciona a alguien. Ejemplo: *.marry @usuario*');
      if (mentioned === sender) return m.reply('❌ No puedes casarte contigo mismo.');
      if (parejas[sender] || parejas[mentioned]) return m.reply('💔 Alguno ya tiene pareja.');

      // Guardar propuesta en db persistente
      propuestas[mentioned] = { de: sender, chat: chat };

      await conn.sendMessage(chat, {
        text: `💍 @${sender.split('@')[0]} te propuso matrimonio a @${mentioned.split('@')[0]} 💞\nResponde con *.aceptar* o *.rechazar*`,
        mentions: [sender, mentioned]
      });
      break;

    case 'aceptar':
      if (!propuestas[sender]) return m.reply('❌ No tienes ninguna propuesta pendiente.');
      const { de } = propuestas[sender];

      parejas[sender] = de;
      parejas[de] = sender;
      delete propuestas[sender];

      await conn.sendMessage(chat, {
        text: `💞 @${sender.split('@')[0]} y @${de.split('@')[0]} ahora son pareja ❤️`,
        mentions: [sender, de]
      });
      break;

    case 'rechazar':
      if (!propuestas[sender]) return m.reply('❌ No tienes ninguna propuesta pendiente.');
      const { de: rechazado } = propuestas[sender];
      delete propuestas[sender];

      await conn.sendMessage(chat, {
        text: `💔 @${sender.split('@')[0]} rechazó la propuesta de @${rechazado.split('@')[0]}.`,
        mentions: [sender, rechazado]
      });
      break;

    case 'listap':
      let lista = [];
      let usados = new Set();
      for (let [a, b] of Object.entries(parejas)) {
        if (!usados.has(a) && !usados.has(b)) {
          lista.push(`💞 @${a.split('@')[0]} ❤️ @${b.split('@')[0]}`);
          usados.add(a);
          usados.add(b);
        }
      }
      if (lista.length === 0) return m.reply('💤 No hay parejas.');
      await conn.sendMessage(chat, { text: `🌹 Lista de parejas:\n\n${lista.join('\n')}`, mentions: [...usados] });
      break;

    case 'terminar':
      if (!parejas[sender]) return m.reply('😿 No tienes pareja.');
      const pareja = parejas[sender];
      delete parejas[sender];
      delete parejas[pareja];
      await conn.sendMessage(chat, {
        text: `💔 @${sender.split('@')[0]} terminó su relación con @${pareja.split('@')[0]}.`,
        mentions: [sender, pareja]
      });
      break;
  }
};

handler.command = /^(marry|aceptar|rechazar|listap|terminar)$/i;
export default handler;

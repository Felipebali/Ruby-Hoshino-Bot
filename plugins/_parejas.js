// ✅ Sistema de parejas FelixCat_Bot – Persistente en DB
if (!global.db.data.propuestas) global.db.data.propuestas = {};
if (!global.db.data.parejas) global.db.data.parejas = {};

const handler = async (m, { conn, command }) => {
  const sender = m.sender;
  const chat = m.chat;
  const mentioned = m.mentionedJid ? m.mentionedJid[0] : null;
  const parejas = global.db.data.parejas;
  const propuestas = global.db.data.propuestas;

  switch (command) {

    // 💍 PROPUESTA DE MATRIMONIO
    case 'marry':
      if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.');
      if (!mentioned) return m.reply('💞 Debes mencionar a alguien. Ejemplo: *.marry @usuario*');
      if (mentioned === sender) return m.reply('❌ No puedes casarte contigo mismo.');
      if (parejas[sender] || parejas[mentioned]) return m.reply('💔 Alguno ya tiene pareja.');

      // Guardar propuesta en DB
      propuestas[mentioned] = { de: sender, chat: chat };

      await conn.sendMessage(chat, {
        text: `💍 @${sender.split('@')[0]} te propuso matrimonio 💞\nResponde con *.aceptar* o *.rechazar* para decidir 💌`,
        mentions: [sender, mentioned]
      });
      break;

    // ✅ ACEPTAR PROPUESTA
    case 'aceptar':
      if (!propuestas[sender]) return m.reply('❌ No tienes ninguna propuesta pendiente.');
      const { de } = propuestas[sender];

      // Guardar pareja en DB
      parejas[sender] = de;
      parejas[de] = sender;
      delete propuestas[sender];

      await conn.sendMessage(chat, {
        text: `💞 @${sender.split('@')[0]} y @${de.split('@')[0]} ahora son pareja ❤️`,
        mentions: [sender, de]
      });
      break;

    // ❌ RECHAZAR PROPUESTA
    case 'rechazar':
      if (!propuestas[sender]) return m.reply('❌ No tienes ninguna propuesta pendiente.');
      const { de: rechazado } = propuestas[sender];
      delete propuestas[sender];

      await conn.sendMessage(chat, {
        text: `💔 @${sender.split('@')[0]} rechazó la propuesta de @${rechazado.split('@')[0]}.`,
        mentions: [sender, rechazado]
      });
      break;

    // 📜 LISTA DE PAREJAS
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
      if (lista.length === 0) return m.reply('💤 No hay parejas registradas.');
      await conn.sendMessage(chat, {
        text: `🌹 *Lista de parejas FelixCat 💫*\n\n${lista.join('\n')}`,
        mentions: [...usados]
      });
      break;

    // 💔 TERMINAR RELACIÓN
    case 'terminar':
      if (!parejas[sender]) return m.reply('😿 No tienes pareja actualmente.');
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

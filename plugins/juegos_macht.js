// plugins/macht.js
// Plugin: .macht / .match - Empareja personas al azar en el grupo
// Compatible con bots estilo FelixCat / Hoshino (Baileys / whatsapp-web.js style handlers)

let handler = async (m, { conn, text, args }) => {
  try {
    if (!m.isGroup) return conn.reply(m.chat, 'Este comando solo funciona en grupos.', m);

    // Obtener metadata del grupo y lista de participantes
    const metadata = await conn.groupMetadata(m.chat);
    let members = metadata.participants.map(u => (u.id || u.jid || u)); // adaptativo

    // Formatear IDs para comparar (algunos bots usan '@s.whatsapp.net', otros 'number@...')
    const normalize = jid => (''+jid).replace(/:\d+|@c\.us/g, '').replace('@s.whatsapp.net', '@s.whatsapp.net');

    // Excluir al bot y a los owners
    const BOT_NUMBERS = [ (conn.user && conn.user.id) ? conn.user.id.split(':')[0] : null, '59898301727' ]; // fallback con tu bot
    const OWNERS = ['59896026646', '59898719147']; // números sin + y sin dominio
    // normalizar participants
    members = members.map(mb => (mb.id ? mb.id : (mb.jid ? mb.jid : mb))).filter(Boolean);

    // Filtrar participantes válidos (no el bot)
    let pool = members.filter(p => {
      const n = (''+p).replace(/@.+/,''); // número solo
      if (!n) return false;
      if (BOT_NUMBERS.some(b => b && n.includes(b))) return false;
      if (OWNERS.some(o => n.includes(o))) return false; // si no querés excluir owners, quita esta línea
      return true;
    });

    if (pool.length < 2) return conn.reply(m.chat, 'No hay suficientes participantes válidos para hacer parejas.', m);

    // Helper: elegir aleatorio distinto de exclude
    const pickRandomExcept = (arr, exclude) => {
      const pool = arr.filter(x => x !== exclude);
      if (!pool.length) return null;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    // Si el usuario pidió ".macht all" — hacer parejas para todo el grupo
    if (args && args[0] && args[0].toLowerCase() === 'all') {
      // mezclar aleatoriamente y agrupar en parejas
      const shuffled = pool.slice().sort(() => Math.random() - 0.5);
      const pairs = [];
      for (let i = 0; i < shuffled.length; i += 2) {
        if (i + 1 < shuffled.length) pairs.push([shuffled[i], shuffled[i+1]]);
        else pairs.push([shuffled[i]]); // uno solo si impar
      }

      // Construir mensaje bonito con menciones
      let textOut = `💘 *Match para todos*\n\n`;
      const mentions = [];
      pairs.forEach((pair, idx) => {
        if (pair.length === 2) {
          textOut += `🔗 Pareja ${idx + 1}: @${pair[0].replace(/@.+/,'')} + @${pair[1].replace(/@.+/,'')}\n`;
          mentions.push(pair[0], pair[1]);
        } else {
          textOut += `⚠️ Queda solo: @${pair[0].replace(/@.+/,'')} (sin pareja)\n`;
          mentions.push(pair[0]);
        }
      });

      return conn.reply(m.chat, textOut, m, { contextInfo: { mentionedJid: mentions }});
    }

    // Si hay una mención en el mensaje, emparejar al mencionado con otro al azar
    const mentioned = m.mentionedJid && m.mentionedJid.length ? m.mentionedJid[0] : null;

    if (mentioned) {
      const target = mentioned;
      // asegurarnos de que target esté en pool (si es owner o bot podría no estar)
      if (!pool.includes(target)) return conn.reply(m.chat, 'No puedo emparejar a ese usuario (quizá es el bot o un owner excluido).', m);

      const partner = pickRandomExcept(pool, target);
      if (!partner) return conn.reply(m.chat, 'No hay nadie más para emparejar con esa persona.', m);

      const out = `💞 *Match encontrado*\n\n@${target.replace(/@.+/,'')} ❤️ @${partner.replace(/@.+/,'')}\n\n¡Suerte!`;
      return conn.reply(m.chat, out, m, { contextInfo: { mentionedJid: [target, partner] }});
    }

    // Si no hay mención: emparejar al autor del comando con alguien aleatorio
    const author = m.sender;
    if (!pool.includes(author)) {
      // Si el autor fue excluido (owner/bot), elegimos dos al azar del pool
      const a = pool[Math.floor(Math.random() * pool.length)];
      let b = pickRandomExcept(pool, a);
      if (!b) return conn.reply(m.chat, 'No hay suficientes participantes para emparejar.', m);
      const out = `💞 *Match aleatorio*\n\n@${a.replace(/@.+/,'')} ❤️ @${b.replace(/@.+/,'')}\n\n(Seleccionados al azar)`;
      return conn.reply(m.chat, out, m, { contextInfo: { mentionedJid: [a,b] }});
    } else {
      const partner = pickRandomExcept(pool, author);
      if (!partner) return conn.reply(m.chat, 'No hay nadie más en el grupo para emparejarte.', m);
      const out = `💞 *Tu match*\n\n@${author.replace(/@.+/,'')} ❤️ @${partner.replace(/@.+/,'')}\n\n¡Que la fuerza del amor te acompañe!`;
      return conn.reply(m.chat, out, m, { contextInfo: { mentionedJid: [author, partner] }});
    }

  } catch (err) {
    console.error(err);
    conn.reply(m.chat, 'Ocurrió un error al generar el match. Intenta de nuevo.', m);
  }
}

handler.help = ['macht', 'match', 'macht all', 'macht @user'];
handler.tags = ['fun'];
handler.command = /^(macht|match)$/i;
handler.group = true;

module.exports = handler;

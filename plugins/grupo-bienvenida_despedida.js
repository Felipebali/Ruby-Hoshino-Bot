// plugins/grupo-bienvenida_despedida.js
// Sistema combinado de bienvenida y despedida — compatible con ES Modules (Ruby-Hoshino-Bot)

let handler = async (m, { conn, isAdmin }) => {
  // Este handler solo registra los comandos
  if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.');
  if (!isAdmin) return m.reply('❌ Solo los administradores pueden usar este comando.');

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  const chat = global.db.data.chats[m.chat];

  const command = m.text.toLowerCase();

  if (command.includes('bienvenida')) {
    chat.bienvenida = !chat.bienvenida;
    return m.reply(`🎉 Bienvenida *${chat.bienvenida ? 'activada ✅' : 'desactivada ❌'}* en este grupo.`);
  }

  if (command.includes('despedida')) {
    chat.despedida = !chat.despedida;
    return m.reply(`👋 Despedida *${chat.despedida ? 'activada ✅' : 'desactivada ❌'}* en este grupo.`);
  }
};

// 🔹 Comandos disponibles
handler.command = /^(bienvenida|despedida)$/i;
handler.group = true;
handler.admin = true;

export default handler;

// 🪄 Evento automático: cuando alguien entra o sale del grupo
export async function before(m, { conn }) {
  if (!m.isGroup) return;
  const chatData = global.db.data.chats[m.chat] || {};

  // Bienvenida
  if (m.action === 'add' && m.participant && chatData.bienvenida) {
    const user = m.participant;
    const grupo = (await conn.groupMetadata(m.chat)).subject;

    const mensajes = [
      `🎉 ¡Bienvenido/a @${user.split('@')[0]} al grupo *${grupo}*! Disfruta tu estadía.`,
      `👋 @${user.split('@')[0]}, nos alegra tenerte en *${grupo}*!`,
      `🐾 @${user.split('@')[0]} se ha unido. ¡Pásalo genial en *${grupo}*!`
    ];
    const texto = mensajes[Math.floor(Math.random() * mensajes.length)];

    await conn.sendMessage(m.chat, { text: texto, mentions: [user] });
  }

  // Despedida
  if (m.action === 'remove' && m.participant && chatData.despedida) {
    const user = m.participant;

    const mensajes = [
      `😢 Adiós @${user.split('@')[0]}! Te extrañaremos en el grupo.`,
      `👋 @${user.split('@')[0]} ha salido del grupo. ¡Que te vaya bien!`,
      `💔 @${user.split('@')[0]} ha abandonado el grupo.`
    ];
    const texto = mensajes[Math.floor(Math.random() * mensajes.length)];

    await conn.sendMessage(m.chat, { text: texto, mentions: [user] });
  }
}

// plugins/_asustar.js
/**
 * Comando: .asusta | .aviso | .desmarco
 * Solo para dueños del bot 👑
 * Autor: Feli 💀
 */

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // dueños

const handler = async (m, { conn }) => {
  try {
    if (!m.isGroup)
      return conn.sendMessage(m.chat, { text: '❗ Este comando solo funciona en grupos.' });

    if (!ownerNumbers.includes(m.sender))
      return conn.sendMessage(m.chat, { text: '👑 Solo los dueños del bot pueden usar este comando.' });

    const texto = `*Ante cualquier investigación judicial o intervención realizada sobre este grupo y otros grupos, dejo por escrito que repudio cualquier contenido homofóbico, racista, xenófobo, nazi, comunista o fascista que se haya compartido en este grupo.*\n\n*No me asocio de ninguna manera con esas ideologías y me desmarco completamente de ellas. Tampoco tengo relación alguna con los demás participantes.*`;

    await conn.sendMessage(m.chat, { text: texto });

    try {
      await conn.sendMessage(m.chat, { react: { text: '⚖️', key: m.key } });
    } catch {}
  } catch (e) {
    console.error(e);
    conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al enviar el mensaje.' });
  }
};

handler.help = ['asusta', 'aviso', 'desmarco'];
handler.tags = ['owner'];
handler.command = /^(asusta|aviso|desmarco)$/i;
handler.group = true;
handler.rowner = true;

export default handler;

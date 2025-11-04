// plugins/_asustar.js
/**
 * Comando: .asusta | .aviso | .desmarco
 * Tipo: ES Module (compatible con "type": "module")
 * Autor: Feli 💀
 */

const handler = async (m, { conn, isAdmin, isOwner }) => {
  try {
    if (!m.isGroup)
      return conn.sendMessage(m.chat, { text: '❗ Este comando solo funciona en grupos.' }, { quoted: m });

    if (!isAdmin && !isOwner)
      return conn.sendMessage(m.chat, { text: '🔒 Solo administradores o dueños pueden usar este comando.' }, { quoted: m });

    const fecha = new Date().toLocaleString('es-UY', {
      timeZone: 'America/Montevideo',
      hour12: false,
    });

    const aviso = `*AVISO DE DESMARQUE* 📢\n\n` +
      `*Ante cualquier investigación judicial o intervención realizada sobre este grupo y otros grupos, dejo por escrito que repudio cualquier contenido homofóbico, racista, xenófobo, nazi, comunista o fascista que se haya compartido en este grupo.*\n\n` +
      `*No me asocio de ninguna manera con esas ideologías y me desmarco completamente de ellas. Tampoco tengo relación alguna con los demás participantes.*\n\n` +
      `🕒 _Fecha y hora:_ ${fecha}\n\n` +
      `— *Mensaje enviado por:* @${m.sender.split('@')[0]}`;

    await conn.sendMessage(
      m.chat,
      {
        text: aviso,
        mentions: [m.sender],
      },
      { quoted: m }
    );

    try {
      await conn.sendMessage(m.chat, { react: { text: '⚖️', key: m.key } });
    } catch { /* ignorar si no soporta reacciones */ }

  } catch (e) {
    console.error(e);
    conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al enviar el aviso.' }, { quoted: m });
  }
};

handler.help = ['asusta', 'aviso', 'desmarco'];
handler.tags = ['group'];
handler.command = /^(asusta|aviso|desmarco)$/i;
handler.group = true;
handler.admin = true;

export default handler;

// 📂 plugins/juego-addowner.js
const ownersList = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // números reales de dueños

let handler = async (m, { conn }) => {
  try {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

    // Determinar objetivo: citado o mencionado
    let target = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0]) || m.sender;

    // Generar un “nivel de owner” aleatorio para hacerlo más divertido
    const nivelOwner = Math.floor(Math.random() * 101); // 0 a 100%

    // Mensajes distintos según nivel
    let mensaje;
    if (ownersList.includes(target)) {
      // Si es dueño real
      mensaje = `👑 @${target.split('@')[0]} ya es OWNER REAL del bot.\n✅ Tiene acceso a todos los comandos exclusivos.`;
    } else {
      // Si no es dueño, pero en el juego parece owner
      if (nivelOwner > 80) {
        mensaje = `🎮 @${target.split('@')[0]} parece ser un OWNER de prueba 🕹️\nNivel de acceso simulado: ${nivelOwner}%\n⚠️ Solo es un juego, no puede usar comandos reales.`;
      } else if (nivelOwner > 50) {
        mensaje = `🎮 @${target.split('@')[0]} tiene acceso parcial al panel de OWNER\nNivel de ilusión: ${nivelOwner}%\n⚠️ No puede ejecutar comandos reales.`;
      } else {
        mensaje = `🎮 @${target.split('@')[0]} está en modo aprendiz OWNER\nNivel de ilusión: ${nivelOwner}%\n⚠️ No tiene permisos reales.`;
      }
    }

    await conn.sendMessage(
      m.chat,
      { text: mensaje, mentions: [target] },
      { quoted: m }
    );

  } catch (e) {
    console.error(e);
    await m.reply('⚠️ Ocurrió un error ejecutando el juego addowner.');
  }
};

handler.help = ['addowner'];
handler.tags = ['fun', 'juego'];
handler.command = /^(addowner)$/i;
handler.group = true;

export default handler;

// --- DATOS BÁSICOS DEL BOT ---
const packname = '⏤͟͞ू⃪ ̸̷͢𝐑𝐮𝐛𝐲 𝐇𝐨𝐬𝐡𝐢𝐧𝐨 𝐁𝐨𝐭͟˚₊·—̳͟͞͞♡̥';

// Array de miniaturas (imágenes aleatorias)
const iconos = [
  'https://qu.ax/wwbar.jpg',
  'https://qu.ax/iFzQw.jpeg',
  'https://qu.ax/dsZyo.jpeg',
  'https://qu.ax/eNdBB.jpeg',
  'https://qu.ax/MSzGw.jpeg',
  'https://qu.ax/JqMBW.jpeg',
  'https://qu.ax/HKcSr.jpeg',
  'https://qu.ax/HOuUU.jpeg',
  'https://qu.ax/ojUNn.jpeg',
  'https://qu.ax/HtqBi.jpeg',
  'https://qu.ax/bmQOA.jpeg',
  'https://qu.ax/nTFtU.jpeg',
  'https://qu.ax/PYKgC.jpeg',
  'https://qu.ax/exeBy.jpeg',
  'https://qu.ax/SCxhf.jpeg',
  'https://qu.ax/sqxSO.jpeg',
  'https://qu.ax/cdSYJ.jpeg',
  'https://qu.ax/dRmZY.jpeg',
  'https://qu.ax/ubwLP.jpg',
  'https://qu.ax/JSgSc.jpg',
  'https://qu.ax/FUXJo.jpg',
  'https://qu.ax/qhKUf.jpg',
  'https://qu.ax/mZKgt.jpg'
];

// Función para obtener una miniatura aleatoria
const getRandomIcono = () => iconos[Math.floor(Math.random() * iconos.length)];

/**
 * Plugin centralizado para manejar los mensajes de error de permisos.
 */
const handler = (type, conn, m, comando) => {
  const msg = {
    rowner: '💫 *Solo mi creador supremo puede usar este comando.*',
    owner: '🌹 *Este comando está reservado para mi dueño, no para simples mortales.*',
    mods: '🛠️ *Solo los moderadores tienen acceso a esta función especial.*',
    premium: '💎 *Función exclusiva para usuarios Premium.*\nCompra acceso con *.comprarpremium 3 dias*.',
    group: '👥 *Este comando solo puede usarse dentro de un grupo.*',
    private: '💌 *Este comando funciona únicamente en chats privados.*',
    admin: '🧷 *Solo los administradores del grupo pueden usar esta función.*',
    botAdmin: '🔧 *Necesito ser admin para poder ejecutar este comando correctamente.*',
    unreg: `📋 *No estás registrado aún.*\nUsa */reg tuNombre.edad* para acceder a mis comandos.`,
    restrict: '🚫 *Esta función está temporalmente deshabilitada.*'
  }[type];

  if (msg) {
    const contextInfo = {
      mentionedJid: [m.sender],
      isForwarded: true,
      forwardingScore: 999,
      externalAdReply: {
        title: packname,
        body: '🌸 Ruby Hoshino Bot 3.0',
        thumbnailUrl: getRandomIcono(),
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    return conn.reply(m.chat, msg, m, { contextInfo }).then(_ => m.react('✖️'));
  }

  return true;
};

export default handler;

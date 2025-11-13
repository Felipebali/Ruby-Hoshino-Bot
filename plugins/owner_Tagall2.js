// 📢 tagall2.js — Menciones ocultas x4 con frases aleatorias 🌍

const owners = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net'];

// 🗣️ Frases aleatorias en varios idiomas
const frases = [
  '🌎 ¡Despierten, equipo! 💪',                         // Español
  '🚀 Wake up everyone, time to move! 🔥',              // Inglés
  '💫 Levantem-se, guerreiros! ⚔️',                     // Portugués
  '🔥 Il est temps de briller, mes amis!',              // Francés
  '🐾 Tutti pronti per l’azione?',                      // Italiano
  '💥 Aufwachen Leute, los geht’s!',                    // Alemán
  '🌸 みんな、起きて！',                                 // Japonés
  '⚡ Все готовы к бою?',                               // Ruso
  '🌺 깨어나세요, 친구들!',                              // Coreano
  '🌼 大家好，准备开始吧！',                             // Chino
  '🌙 استيقظوا أيها الأبطال!',                         // Árabe
  '🐱 FelixCat les recuerda: ¡Hora de activarse!'       // Personalizada 😸
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let handler = async (m, { conn, participants, isBotAdmin }) => {
  try {
    // 🔒 Solo en grupos
    if (!m.isGroup) return m.reply('❗ Este comando solo puede usarse en grupos.');

    // 🧠 Solo owners
    const sender = m.sender;
    if (!owners.includes(sender)) return m.reply('🚫 Solo los dueños pueden usar este comando.');

    // 🤖 Verificar que el bot sea admin (para mencionar)
    if (!isBotAdmin) return m.reply('🤖 Necesito ser administrador para mencionar a todos.');

    // 📋 Obtener lista de participantes
    const groupMetadata = await conn.groupMetadata(m.chat);
    const members = groupMetadata.participants.map(u => u.id).filter(v => v !== conn.user.jid);

    if (!members.length) return m.reply('❌ No se encontraron miembros en el grupo.');

    // 🔕 Texto invisible para mención oculta
    const hidden = '\u200B'.repeat(400);

    // 🔁 Enviar 4 veces
    for (let i = 0; i < 4; i++) {
      const frase = frases[Math.floor(Math.random() * frases.length)];
      const text = `${frase}\n${hidden}`;

      await conn.sendMessage(
        m.chat,
        { text, mentions: members },
        { quoted: m }
      );

      await sleep(1500); // pequeña pausa entre mensajes
    }

    await m.reply('✅ Menciones ocultas enviadas con éxito x4 🌐');

  } catch (e) {
    console.error(e);
    m.reply('⚠️ Error al ejecutar el tagall extremo.');
  }
};

handler.help = ['tagall2'];
handler.tags = ['owner', 'group'];
handler.command = /^tagall2$/i;
handler.group = true;

export default handler; 

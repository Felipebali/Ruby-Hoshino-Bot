// 📂 plugins/owner-info.js — FelixCat-Bot 🐾
// Muestra la información de los dueños, o la ficha personal si un owner lo usa
// Si no es dueño, responde con algo chistoso

const ownerData = {
  '59898719147@s.whatsapp.net': {
    nombre: 'Feli',
    rango: '👑 Comandante Supremo',
    lema: '“Desde las sombras, gobierna el caos con estilo.”'
  },
  '59896026646@s.whatsapp.net': {
    nombre: 'G',
    rango: '⚔️ Mariscal General',
    lema: '“Disciplina, poder y control en cada mensaje.”'
  },
  '59892363485@s.whatsapp.net': {
    nombre: 'Benja',
    rango: '🛡️ Capitán Estratégico',
    lema: '“Planear antes de actuar es la clave del dominio.”'
  }
};

// 🌟 Frases generales
const frases = [
  '🪖 El poder no se otorga, se conquista.',
  '💫 Los dueños mantienen el orden del reino digital.',
  '🔥 En su presencia, hasta los bits se alinean.',
  '⚡ Nadie escapa del juicio de los Comandantes.',
  '👁️ La autoridad suprema vigila cada mensaje.',
  '📜 Sus decisiones son ley dentro del grupo.',
  '🚀 Desde lo alto del trono, gobiernan con precisión.'
];

// 😂 Frases chistosas para los no dueños
const frasesGraciosas = [
  '😹 Tranquilo crack, no sos dueño... pero sí sos especial (como el antivirus del 2005).',
  '🙃 No sos dueño, pero igual te queremos... más o menos.',
  '🐸 Tu nivel de poder es... inexistente.',
  '🪫 Lo siento, tu solicitud de dominación mundial fue rechazada.',
  '🤖 Solo los elegidos pueden ver esa información... y vos no estás en la lista 😏.',
  '🥴 Este comando requiere más *chakras* de los que tenés disponibles.',
  '🧙‍♂️ No sos dueño, pero podés seguir intentando invocar privilegios mágicos.'
];

let handler = async (m, { conn }) => {
  try {
    const sender = m.sender;
    const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];
    const ownerNumbers = Object.keys(ownerData);
    const citado = m.quoted;

    if (!ownerNumbers.length) return m.reply('⚠️ No hay dueños configurados.');

    // 🧾 Si se cita un mensaje y el que lo hace es un owner → muestra su ficha
    if (citado && ownerData[sender]) {
      const data = ownerData[sender];
      const numero = sender.split('@')[0];

      const texto = `👑 *FICHA DE DUEÑO DEL BOT* 👑\n\n` +
        `📱 *Número:* +${numero}\n` +
        `🧩 *Nombre:* @${numero}\n` +
        `🥇 *Rango:* ${data.rango}\n` +
        `💬 *Lema:* ${data.lema}\n\n` +
        `⚡ "${fraseAleatoria}"`;

      await conn.sendMessage(m.chat, {
        text: texto,
        mentions: [sender]
      }, { quoted: citado });

      return;
    }

    // 🙈 Si se cita y NO es dueño → responde con algo gracioso
    if (citado && !ownerData[sender]) {
      const chiste = frasesGraciosas[Math.floor(Math.random() * frasesGraciosas.length)];
      await conn.sendMessage(m.chat, { text: chiste }, { quoted: citado });
      return;
    }

    // 👥 Si no se cita → muestra todos los dueños
    let texto = `👑 *INFORMACIÓN DE LOS DUEÑOS DEL BOT* 👑\n\n`;
    let mentions = [];

    for (const id of ownerNumbers) {
      const data = ownerData[id];
      const numero = id.split('@')[0];

      texto += `📱 *Número:* +${numero}\n`;
      texto += `🧩 *Nombre:* @${numero}\n`;
      texto += `🥇 *Rango:* ${data.rango}\n`;
      texto += `🕶️ *Mención:* @${numero}\n\n`;
      mentions.push(id);
    }

    texto += `💫 "${fraseAleatoria}"`;

    await conn.sendMessage(m.chat, {
      text: texto,
      mentions
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply('❌ Ocurrió un error al mostrar la información del dueño.');
  }
};

handler.command = ['owner', 'dueño'];
handler.help = ['owner'];
handler.tags = ['info'];
handler.group = false;

export default handler;

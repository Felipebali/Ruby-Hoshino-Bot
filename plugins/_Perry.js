// 📂 plugins/autodestruccion.js — FelixCat_Bot 🐾
// AUTODESTRUCCIÓN ULTRA MEJORADA — DOOFENSHMIRTZ EVIL INC. ™
// Con fallas, ruidos raros y drama innecesario 💣😂

let handler = async (m, { conn }) => {

  // Mensaje inicial
  await conn.sendMessage(m.chat, { text:
`⚠️ *DOOFENSHMIRTZ EVIL INC.™ — SISTEMA DE AUTODESTRUCCIÓN* ⚠️

¡Oh no! Alguien tocó el *botón prohibido* 😱
Iniciando protocolo ultra-secreto...` });

  await new Promise(r => setTimeout(r, 1500));
  await conn.sendMessage(m.chat, { text: 
`🔄 Preparando cargas explosivas...
🧪 Mezclando químicos peligrosos...
🐀 Eliminando ratas del laboratorio...` });

  // Inicio de la cuenta regresiva
  await new Promise(r => setTimeout(r, 1500));
  await conn.sendMessage(m.chat, { text: `🚨 *Cuenta regresiva iniciada...*` });

  const pasos = [
    "🔥 5... calibrando el *Explosinator 3000™*...",
    "💥 4... calentando bobinas... demasiado, diría yo...",
    "⚡ 3... *ERROR 42:* ¿qué significa eso? ¡Ay caramba!",
    "☢️ 2... derritiendo cosas que no deberían derretirse...",
    "💣 1... ¡correeeeeeeeee!"
  ];

  for (let paso of pasos) {
    await new Promise(r => setTimeout(r, 1200));
    await conn.sendMessage(m.chat, { text: paso });
  }

  // GRAN FINAL
  await new Promise(r => setTimeout(r, 1800));
  await conn.sendMessage(m.chat, { text:
`💣💥 *¡¡BOOOOOOOOOOM!!* 💥💣

╰(°□°╰)   (╯°□°）╯︵ ┻━┻
El MAL™ ha explotado de forma espectacular.

Pero tranqui...
Nada explotó realmente 😎✨
Solo tu dignidad por presionar el botón equivocado.` });

  await new Promise(r => setTimeout(r, 1500));
  await conn.sendMessage(m.chat, { text:
`📡 *MENSAJE DEL DR. DOOFENSHMIRTZ:*

"Si este invento explotó es porque así lo planeé...
Y si NO explotó... también lo planeé."

Fin del comunicado.` });
};

handler.command = ['autodestruccion', 'autodestruct', 'explosion', 'boom', 'destruir'];
export default handler; 

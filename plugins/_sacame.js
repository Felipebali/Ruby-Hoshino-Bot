// 🚪 _sacame.js — Solo los dueños pueden usar "sacame" sin prefijo

const owners = [
  '59898719147@s.whatsapp.net', // Feli 💛
  '59896026646@s.whatsapp.net'  // G 🐾
];

const despedidas = [
  '👋 Hasta luego, jefe.',
  '💨 Ejecutando orden: expulsión inmediata.',
  '😼 El dueño pidió salir... acatando órdenes.',
  '🚪 Salida elegante activada.',
  '🌀 Desapareciendo del grupo... como todo un líder.',
  '🧞‍♂️ Tu deseo es mi orden, maestro.',
  '🐾 FelixCat obedece a su creador.',
  '💫 Adiós, patrón. Que el grupo te recuerde.',
  '🔥 Sacado con estilo y autoridad.',
  '📦 Dueño removido bajo su propia voluntad.'
];

let handler = async (m, { conn, isBotAdmin }) => {
  try {
    if (!m.isGroup) return; // Solo grupos

    const texto = (m.text || '').trim().toLowerCase();
    if (texto !== 'sacame') return; // Solo si dice exactamente "sacame"

    if (!owners.includes(m.sender)) return; // Solo owners autorizados

    if (!isBotAdmin)
      return m.reply('❌ No puedo sacarte porque no soy administrador.');

    const frase = despedidas[Math.floor(Math.random() * despedidas.length)];

    // Enviar frase sin citar el mensaje
    await conn.sendMessage(m.chat, { text: frase }, { quoted: null });

    // Esperar un poco antes de sacarlo
    await new Promise(res => setTimeout(res, 1000));

    // Expulsar al dueño (bajo su propio riesgo 😹)
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');

  } catch (err) {
    console.error('⚠️ Error en comando sacame:', err);
  }
};

handler.customPrefix = /^sacame$/i; // Detecta la palabra sin prefijo
handler.command = new RegExp(); // No usa prefijos
handler.group = true;

export default handler; 

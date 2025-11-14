// 📂 plugins/falso.js — FelixCat_Bot 🐾
// Detector completo de números falsos, desconocidos y extranjeros
// Incluye comando .falso y el sistema de vigilancia interno

let handler = async (m, { conn, command }) => {
  const chat = global.db.data.chats[m.chat] || {};

  if (command === 'falso') {
    chat.antiFalso = !chat.antiFalso;
    global.db.data.chats[m.chat] = chat;

    return conn.reply(
      m.chat,
      `🕵️ *Detector de Números Falsos / Desconocidos / Extranjeros*\n` +
      `➡️ Estado: *${chat.antiFalso ? 'ACTIVADO ✅' : 'DESACTIVADO ❌'}*`,
      m
    );
  }
};

handler.command = ['falso'];
handler.group = true;
export default handler;

// 🔥 SISTEMA COMPLETO DE DETECCIÓN (INTEGRADO EN EL MISMO PLUGIN)
export async function before(m, { conn }) {
  try {
    if (!m.isGroup) return;

    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.antiFalso) return; // Desactivado: no hace nada

    const sender = m.sender;
    const numero = sender.replace('@s.whatsapp.net', '');
    const esUruguay = numero.startsWith('598'); // +598 = Uruguay

    // Obtener participantes del grupo
    let group = await conn.groupMetadata(m.chat);
    let participantes = group.participants.map(p => p.id);

    // 🟥 1. Número que NO está en el grupo pero habla
    if (!participantes.includes(sender)) {
      await conn.sendMessage(m.chat, {
        text:
          `⚠️ *ALERTA: NÚMERO DESCONOCIDO DETECTADO*\n\n` +
          `📱 *${numero}*\n` +
          `No pertenece al grupo pero está enviando mensajes.`
      });
      return;
    }

    // 🟦 2. Número extranjero
    if (!esUruguay) {
      await conn.sendMessage(m.chat, {
        text:
          `🌎 *ALERTA: NÚMERO EXTRANJERO DETECTADO*\n\n` +
          `📱 *${numero}*\n` +
          `Proviene de *otro país*. Revisar si debe estar aquí.`
      });
      return;
    }

  } catch (e) {
    console.error('Error en plugin falso:', e);
  }
}

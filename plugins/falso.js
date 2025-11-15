// 📂 plugins/falso.js — FelixCat_Bot 🐾
// Detector completo — Expulsión de +598 y extranjeros

let handler = async (m, { conn, command }) => {
  const chat = global.db.data.chats[m.chat] || {};

  if (command === 'falso') {
    chat.antiFalso = !chat.antiFalso;
    global.db.data.chats[m.chat] = chat;

    return conn.reply(
      m.chat,
      `🕵️ *Detector AntiFalso*\n` +
      `Estado: *${chat.antiFalso ? 'ACTIVADO ✅' : 'DESACTIVADO ❌'}*`,
      m
    );
  }
};

handler.command = ['falso'];
handler.group = true;
export default handler;


// 🔥 SISTEMA DE DETECCIÓN REAL (EXPULSA DE VERDAD)
handler.before = async (m, { conn, isAdmin }) => {
  try {
    if (!m.isGroup) return;

    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.antiFalso) return;

    const sender = m.sender;                     // jid completo
    const numero = sender.split('@')[0];         // solo número
    const esUruguay = numero.startsWith('598');

    // Dueños — NO EXPULSAR
    const owners = ["59898719147", "59896026646"];
    if (owners.includes(numero)) return;

    // Admins — NO EXPULSAR
    if (isAdmin) return;

    // Datos del grupo
    let group = await conn.groupMetadata(m.chat);
    let participantes = group.participants.map(p => p.id);

    // Función segura de expulsión
    async function expulsar(jid) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [jid], "remove");
      } catch (e) {
        console.log("Error expulsando:", e);
      }
    }

    // 1️⃣ Si NO pertenece al grupo
    if (!participantes.includes(sender)) {
      await conn.sendMessage(m.chat, {
        text: `⚠️ *NÚMERO DESCONOCIDO*\n📱 ${numero}\nExpulsando...`
      });
      await expulsar(sender);
      return;
    }

    // 2️⃣ Expulsar NÚMEROS +598 (modo prueba)
    if (esUruguay) {
      await conn.sendMessage(m.chat, {
        text: `🟥 *DETECCIÓN +598 (PRUEBA)*\n📱 ${numero}\nExpulsando...`
      });
      await expulsar(sender);
      return;
    }

    // 3️⃣ Expulsar EXTRANJEROS
    if (!esUruguay) {
      await conn.sendMessage(m.chat, {
        text: `🌎 *EXTRANJERO DETECTADO*\n📱 ${numero}\nExpulsando...`
      });
      await expulsar(sender);
      return;
    }

  } catch (e) {
    console.log("Error en falso.js:", e);
  }
};

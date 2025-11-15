// 📂 plugins/falso.js — FelixCat_Bot 🐾
// Detector completo — Expulsa +598 y extranjeros
// Funciona con handler.before ✔️

let handler = async (m, { conn, command }) => {
  const chat = global.db.data.chats[m.chat] || {};

  if (command === 'falso') {
    chat.antiFalso = !chat.antiFalso;
    global.db.data.chats[m.chat] = chat;

    return conn.reply(
      m.chat,
      `🕵️ *Detector AntiFalso activado.*\n` +
      `Estado: *${chat.antiFalso ? 'ON ✅' : 'OFF ❌'}*`,
      m
    );
  }
};

handler.command = ['falso'];
handler.group = true;
export default handler;


// 🔥 NOW IT WORKS — handler.before activo
handler.before = async (m, { conn, isAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return;

    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.antiFalso) return;

    const sender = m.sender;
    const numero = sender.replace('@s.whatsapp.net', '');
    const esUruguay = numero.startsWith('598');

    // DUEÑOS — NO TOCAR
    const owners = ["59898719147", "59896026646"];
    if (owners.includes(numero)) return;

    // ADMINS — NO TOCAR
    if (isAdmin) return;

    // METADATA DEL GRUPO
    let group = await conn.groupMetadata(m.chat);
    let participantes = group.participants.map(p => p.id);

    // 1️⃣ Si NO pertenece al grupo
    if (!participantes.includes(sender)) {
      await conn.sendMessage(m.chat, {
        text: `⚠️ *Número desconocido detectado*\n📱 ${numero}\nExpulsando...`
      });
      await conn.groupParticipantsUpdate(m.chat, [sender], "remove");
      return;
    }

    // 2️⃣ Expulsar +598 (modo prueba)
    if (esUruguay) {
      await conn.sendMessage(m.chat, {
        text: `🟥 *Modo prueba: +598 detectado*\n📱 ${numero}\nExpulsando...`
      });
      await conn.groupParticipantsUpdate(m.chat, [sender], "remove");
      return;
    }

    // 3️⃣ Extranjeros
    if (!esUruguay) {
      await conn.sendMessage(m.chat, {
        text: `🌎 *Extranjero detectado*\n📱 ${numero}\nExpulsando...`
      });
      await conn.groupParticipantsUpdate(m.chat, [sender], "remove");
      return;
    }

  } catch (e) {
    console.log("Error en falso.js:", e);
  }
};

// 🔞 FelixCat-Bot — Sistema +18 ultra estable
// Compatible con cualquier versión de Baileys / Node
// Anubis 🐺💀

const owners = [
  "59898719147@s.whatsapp.net",
  "59896026646@s.whatsapp.net",
  "59892363485@s.whatsapp.net"
];

// Imagenes SIEMPRE funcionales (Imgur)
const packs = [
  "https://i.imgur.com/Ko2u1mR.jpeg",
  "https://i.imgur.com/f1IuE2H.jpeg",
  "https://i.imgur.com/4ZQZ4sQ.jpeg",
  "https://i.imgur.com/uIuGcgE.jpeg"
];

const hentai = [
  "https://i.imgur.com/Oqj0YUi.jpeg",
  "https://i.imgur.com/EJsZ3Up.jpeg"
];

const boobs = [
  "https://i.imgur.com/TMEv35J.jpeg",
  "https://i.imgur.com/8lUp3Ve.jpeg"
];

const ass = [
  "https://i.imgur.com/qZQLQIT.jpeg",
  "https://i.imgur.com/vT0GMp6.jpeg"
];

const rule34 = [
  "https://i.imgur.com/D7Fx1sj.jpeg",
  "https://i.imgur.com/F5t4mNy.jpeg"
];

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

let handler = async (m, { conn, command }) => {

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
  let chat = global.db.data.chats[m.chat];

  if (typeof chat.adultMode !== "boolean") chat.adultMode = false;

  // 📝 LISTA DE COMANDOS
  if (command === "list18") {
    if (!owners.includes(m.sender)) return conn.reply(m.chat, "🚫 No tenés permiso.", m);

    return conn.reply(m.chat,
`🔞 *COMANDOS +18 DISPONIBLES*

• .pack
• .hentai
• .boobs
• .ass
• .rule34

🔧 Control:
• .+18   (activar/desactivar)
• .list18

Estado: *${chat.adultMode ? "🟢 ACTIVADO" : "🔴 DESACTIVADO"}*`, m);
  }

  // 🔘 ACTIVAR / DESACTIVAR
  if (command === "+18") {
    if (!owners.includes(m.sender)) return conn.reply(m.chat, "🚫 No sos owner.", m);

    chat.adultMode = !chat.adultMode;
    return conn.reply(
      m.chat,
      chat.adultMode ? "🔞 *Modo +18 ACTIVADO*" : "🧼 *Modo +18 DESACTIVADO*",
      m
    );
  }

  // Bloqueo si está apagado
  const nsfw = ["pack","hentai","boobs","ass","rule34"];

  if (nsfw.includes(command) && !chat.adultMode)
    return conn.reply(m.chat, "❌ El modo +18 está desactivado.", m);

  // Solo owners
  if (nsfw.includes(command) && !owners.includes(m.sender))
    return conn.reply(m.chat, "🚫 Solo el owner puede usar esto.", m);

  // Ejecución
  let url = null;

  if (command === "pack") url = pick(packs);
  if (command === "hentai") url = pick(hentai);
  if (command === "boobs") url = pick(boobs);
  if (command === "ass") url = pick(ass);
  if (command === "rule34") url = pick(rule34);

  if (url) {
    return conn.sendMessage(m.chat, { image: { url }, caption: "🔞" }, { quoted: m });
  }
};

handler.command = /^(pack|hentai|boobs|ass|rule34|\+18|list18)$/i;

export default handler;

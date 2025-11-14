// 🔥 FelixCat-Bot — EXTREME NSFW SYSTEM
// By Anubis 🐺💀

const owners = [
  "59898719147@s.whatsapp.net",
  "59896026646@s.whatsapp.net"
];

// 📦 Galerías
const fotos = [
  "https://i.imgur.com/QZ1e1tA.jpeg",
  "https://i.imgur.com/6M2LQ1x.jpeg",
  "https://i.imgur.com/f1IuE2H.jpeg",
  "https://i.imgur.com/8X0bE3h.jpeg",
  "https://i.imgur.com/qGkJp0a.jpeg"
];

const boobs = [
  "https://i.imgur.com/c8w7G1t.jpeg",
  "https://i.imgur.com/Kk0uS1Q.jpeg",
  "https://i.imgur.com/7K2mDbH.jpeg"
];

const ass = [
  "https://i.imgur.com/ZcLW8BZ.jpeg",
  "https://i.imgur.com/2BkvKAr.jpeg",
  "https://i.imgur.com/HbZs1te.jpeg"
];

const anal = [
  "https://i.imgur.com/SuMEuPH.jpeg",
  "https://i.imgur.com/2Kmf2px.jpeg"
];

const creampie = [
  "https://i.imgur.com/ao2iUpG.jpeg",
  "https://i.imgur.com/jAxG0KY.jpeg"
];

const cosplay = [
  "https://i.imgur.com/RIgqfaE.jpeg",
  "https://i.imgur.com/cJm4MFy.jpeg",
  "https://i.imgur.com/1qFSKjJ.jpeg"
];

const gifs = [
  "https://i.imgur.com/OR0OZaQ.gif",
  "https://i.imgur.com/H6aEF5n.gif",
  "https://i.imgur.com/XUOXxNZ.gif"
];

const videos = [
  "https://i.imgur.com/ZzQp5eE.mp4",
  "https://i.imgur.com/YgM7K7e.mp4",
  "https://i.imgur.com/kpM3U64.mp4",
  "https://i.imgur.com/q1W1oNm.mp4"
];

const hentai = [
  "https://i.imgur.com/wsZ6Nlt.png",
  "https://i.imgur.com/9uITyqH.jpeg",
  "https://i.imgur.com/J3mX2by.jpeg",
  "https://i.imgur.com/pdgOoxP.jpeg"
];

// 🐺 Premium extremo
const extreme = [
  "https://i.imgur.com/SHc9s6J.mp4",
  "https://i.imgur.com/OBgM1x3.jpeg",
  "https://i.imgur.com/o36Pq0T.jpeg"
];

// 🔥 Roleplay frases
const actions = [
  "🔥 *Te besa salvajemente en el cuello*",
  "😈 *Te arrincona contra la pared lentamente*",
  "💋 *Muerde tu labio inferior*",
  "👅 *Pasa la lengua por tu abdomen*",
  "🖤 *Te toma de la cintura sin pedir permiso*"
];

// 💬 DirtyChat
const dirty = [
  "😈 Quiero que sigas... no pares.",
  "🔥 Pensé en vos toda la noche.",
  "💋 Vení... te quiero encima mío.",
  "🖤 No tenés idea de lo que te haría ahora."
];

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

const handler = async (m, { conn, command }) => {
  const sender = m.sender;

  // Protege si el chat tiene modo seguro
  const chat = global.db.data.chats[m.chat] || {};
  if (chat.nsfw === false)
    return conn.reply(m.chat, "🔒 *Modo seguro activado en este chat.*", m);

  try {
    switch (command) {

      case "random18":
        await conn.sendMessage(m.chat, { image: { url: pick(fotos) }, caption: "🔥 NSFW" }, { quoted: m });
        break;

      case "video18":
        await conn.sendMessage(m.chat, { video: { url: pick(videos) }, caption: "🎥 Video +18" }, { quoted: m });
        break;

      case "gif18":
        await conn.sendMessage(m.chat, { video: { url: pick(gifs), gifPlayback: true }, caption: "🎞️ GIF +18" }, { quoted: m });
        break;

      case "hentai":
        await conn.sendMessage(m.chat, { image: { url: pick(hentai) }, caption: "🍥 Hentai" }, { quoted: m });
        break;

      case "boobs18":
        await conn.sendMessage(m.chat, { image: { url: pick(boobs) }, caption: "😏 Boobs" }, { quoted: m });
        break;

      case "ass18":
        await conn.sendMessage(m.chat, { image: { url: pick(ass) }, caption: "🍑 Ass" }, { quoted: m });
        break;

      case "anal18":
        await conn.sendMessage(m.chat, { image: { url: pick(anal) }, caption: "😈 Anal" }, { quoted: m });
        break;

      case "creampie18":
        await conn.sendMessage(m.chat, { image: { url: pick(creampie) }, caption: "💦 Creampie" }, { quoted: m });
        break;

      case "cosplay18":
        await conn.sendMessage(m.chat, { image: { url: pick(cosplay) }, caption: "🎭 Cosplay" }, { quoted: m });
        break;

      case "mix18":
        const opciones = ["foto", "gif", "video"];
        const elección = pick(opciones);

        if (elección === "foto")
          await conn.sendMessage(m.chat, { image: { url: pick(fotos) }, caption: "🔥 Mix: Foto" }, { quoted: m });

        if (elección === "gif")
          await conn.sendMessage(m.chat, { video: { url: pick(gifs), gifPlayback: true }, caption: "🔥 Mix: GIF" }, { quoted: m });

        if (elección === "video")
          await conn.sendMessage(m.chat, { video: { url: pick(videos) }, caption: "🔥 Mix: Video" }, { quoted: m });

        break;

      case "pack18":
        for (let i = 0; i < 5; i++) {
          await conn.sendMessage(m.chat, {
            image: { url: pick(fotos) },
            caption: `🔥 Pack ${i + 1}/5`
          }, { quoted: m });
        }
        break;

      case "packvip":
        if (!owners.includes(sender))
          return conn.reply(m.chat, "🚫 Solo owners pueden usar *Pack VIP*.", m);

        for (let i = 0; i < 10; i++) {
          await conn.sendMessage(m.chat, {
            image: { url: pick(fotos.concat(boobs, ass, cosplay)) },
            caption: `👑 VIP ${i + 1}/10`
          }, { quoted: m });
        }
        break;

      case "extreme18":
        if (!owners.includes(sender))
          return conn.reply(m.chat, "👑 Solo los dueños pueden usar *EXTREME*.", m);

        await conn.sendMessage(m.chat, {
          image: { url: pick(extreme) },
          caption: "💀🔥 *EXTREME NSFW*"
        }, { quoted: m });
        break;

      case "roleplay":
        await conn.reply(m.chat, pick(actions), m);
        break;

      case "dirtychat":
        await conn.reply(m.chat, pick(dirty), m);
        break;

      case "roulette18":
        const categorias = [fotos, gifs, videos, boobs, ass, cosplay];
        const elegido = pick(categorias);

        if (elegido === gifs)
          await conn.sendMessage(m.chat, { video: { url: pick(gifs), gifPlayback: true }, caption: "🎲 Roulette: GIF" }, { quoted: m });
        else if (elegido === videos)
          await conn.sendMessage(m.chat, { video: { url: pick(videos) }, caption: "🎲 Roulette: Video" }, { quoted: m });
        else
          await conn.sendMessage(m.chat, { image: { url: pick(elegido) }, caption: "🎲 Roulette" }, { quoted: m });

        break;
    }

  } catch (err) {
    console.log(err);
    return conn.reply(m.chat, "⚠️ Error inesperado. Intentá de nuevo.", m);
  }
};

handler.command = /^(random18|video18|gif18|pack18|mix18|hentai|boobs18|ass18|anal18|creampie18|cosplay18|roleplay|dirtychat|roulette18|packvip|extreme18)$/i;

export default handler;

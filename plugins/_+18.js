// 🔞 FelixCat-Bot — Modo +18 básico, estable y sin errores
// Solo imágenes (las más estables) — Videos se agregan después
// By Anubis 🐺💀

const owners = [
  "59898719147@s.whatsapp.net",
  "59896026646@s.whatsapp.net",
  "59892363485@s.whatsapp.net"
]

// IMÁGENES ESTABLES (No caen, no expiran)
const NSFW_IMAGES = [
  "https://i.imgur.com/4ZQZ4sQ.jpeg",
  "https://i.imgur.com/Ko2u1mR.jpeg",
  "https://i.imgur.com/uIuGcgE.jpeg",
  "https://i.imgur.com/Rp1L7hG.jpeg",
  "https://i.imgur.com/9d2HeQ2.jpeg",
  "https://i.imgur.com/tFoE9Lh.jpeg"
]

// HENTAI ESTABLE
const HENTAI_IMAGES = [
  "https://i.imgur.com/Oqj0YUi.jpeg",
  "https://i.imgur.com/bpWsF8f.jpeg",
  "https://i.imgur.com/EJsZ3Up.jpeg"
]

// ASS
const ASS_IMAGES = [
  "https://i.imgur.com/qZQLQIT.jpeg",
  "https://i.imgur.com/vT0GMp6.jpeg"
]

// BOOBS
const BOOBS_IMAGES = [
  "https://i.imgur.com/8lUp3Ve.jpeg",
  "https://i.imgur.com/TMEv35J.jpeg"
]

// RULE34 FAKES (cero riesgo)
const RULE34_IMAGES = [
  "https://i.imgur.com/D7Fx1sj.jpeg",
  "https://i.imgur.com/F5t4mNy.jpeg"
]

const pick = arr => arr[Math.floor(Math.random() * arr.length)]

let handler = async (m, { conn, command }) => {
  
  // Iniciar chat si no existe
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  let chat = global.db.data.chats[m.chat]

  // Default OFF
  if (typeof chat.adultMode !== 'boolean') chat.adultMode = false

  // 🔥 LISTA COMANDOS
  if (command === 'list18') {
    if (!owners.includes(m.sender)) return conn.reply(m.chat, '🚫 No sos owner.', m)

    return conn.reply(m.chat,
`🔞 *COMANDOS +18 DISPONIBLES*

• .hentai
• .pack
• .ass
• .boobs
• .rule34

Control:
• .+18  (activar / desactivar)
• .list18

Estado actual: *${chat.adultMode ? '🟢 ACTIVADO' : '🔴 DESACTIVADO'}*`, m)
  }

  // 🔞 ON/OFF
  if (command === '+18') {
    if (!owners.includes(m.sender)) return conn.reply(m.chat, "🚫 No tenés permiso.", m)

    chat.adultMode = !chat.adultMode
    return conn.reply(m.chat, chat.adultMode ? "🔞 Modo +18 ACTIVADO." : "🧼 Modo +18 DESACTIVADO.", m)
  }

  // Bloquear si está apagado
  const nsfwCmds = ["hentai","pack","ass","boobs","rule34"]

  if (nsfwCmds.includes(command) && !chat.adultMode)
    return conn.reply(m.chat, "❌ El modo +18 está desactivado.", m)

  // Solo owners usan contenido +18
  if (nsfwCmds.includes(command) && !owners.includes(m.sender))
    return conn.reply(m.chat, "🚫 Solo owners pueden usar contenido +18.", m)

  // Ejecutar imágenes
  let url = null

  if (command === 'pack') url = pick(NSFW_IMAGES)
  if (command === 'hentai') url = pick(HENTAI_IMAGES)
  if (command === 'ass') url = pick(ASS_IMAGES)
  if (command === 'boobs') url = pick(BOOBS_IMAGES)
  if (command === 'rule34') url = pick(RULE34_IMAGES)

  if (url) {
    return conn.sendMessage(m.chat, { image: { url }, caption: "🔞" }, { quoted: m })
  }

}

handler.command = [
  '+18', 'list18',
  'hentai', 'pack', 'ass', 'boobs', 'rule34'
]

export default handler

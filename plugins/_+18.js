// /plugins/_+18.js
// SISTEMA +18 ALEATORIO – COMPATIBLE CON NODE TERMUX
// Feli 💀 2025

import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream'
import { promisify } from 'util'
const streamPipeline = promisify(pipeline)

let ytdl = null
try { ytdl = await import('ytdl-core') } catch {}

// OWNERS (ARREGLADO + NÚMERO NUEVO)
const owners = [
  '59898719147@s.whatsapp.net',
  '59896026646@s.whatsapp.net',
  '59892682421@s.whatsapp.net'
]

// LISTAS RANDOM (FUNCIONANDO)
const RANDOM_IMAGES = [
  "https://i.waifu.pics/wWohc6f.jpg",
  "https://i.waifu.pics/ox~FJp8.jpg",
  "https://i.waifu.pics/kpZpjje.jpg",
  "https://i.waifu.pics/YQ~6avl.jpg",
  "https://i.ibb.co/3hRBQhb/1.jpg",
  "https://i.ibb.co/v3kM6Kk/2.jpg",
  "https://i.ibb.co/R0Pfjqh/3.jpg",
  "https://i.ibb.co/vx8XgZn/4.jpg",
  "https://i.ibb.co/qjXQg0Q/5.jpg"
]

const RANDOM_RULE34 = [
  "https://img.rule34.xxx/images/1/1.jpg",
  "https://img.rule34.xxx/images/2/2.jpg",
  "https://img.rule34.xxx/images/3/3.jpg"
]

// VIDEOS (CATBOX + FALLBACKS)
const RANDOM_VIDEOS = [
  "https://files.catbox.moe/0bf3ak.mp4",
  "https://files.catbox.moe/7q3k9x.mp4",
  "https://files.catbox.moe/qw9h2v.mp4",
  // fallbacks estables
  "https://neonmoe.com/media1.mp4",
  "https://neonmoe.com/media2.mp4"
]

let handler = async (m, { conn, args, command }) => {

  // FIX COMPATIBLE: NO ||= OPERATOR
  if (!global.db.data.chats[m.chat]) {
    global.db.data.chats[m.chat] = {}
  }

  let chat = global.db.data.chats[m.chat]
  if (typeof chat.adultMode !== 'boolean') chat.adultMode = false

  // ─────────────────────────────────────────────
  // 📌 LISTA DE COMANDOS
  // ─────────────────────────────────────────────
  if (command === 'list18') {
    if (!owners.includes(m.sender)) return conn.reply(m.chat, '🚫 No sos owner.', m)

    return conn.reply(m.chat,
`🔞 *COMANDOS +18 DISPONIBLES*

📸 Imágenes:
• .hentai
• .pack
• .rule34

🎥 Videos:
• .random18
• .xnxx
• .xvideos
• .ph
• .pornhub

⬇️ Descargas:
• .porno <url>
• .ytporn <url>

Control:
• .+18 (activar/desactivar)
• .list18

Estado actual: *${chat.adultMode ? 'ON 🔥' : 'OFF ❌'}*`, m)
  }

  // ─────────────────────────────────────────────
  // 🔞 ACTIVAR / DESACTIVAR
  // ─────────────────────────────────────────────
  if (command === '+18') {
    if (!owners.includes(m.sender)) return conn.reply(m.chat, '🚫 No sos owner.', m)
    chat.adultMode = !chat.adultMode
    return conn.reply(m.chat,
      chat.adultMode ? '🔞 Modo +18 ACTIVADO.' : '🧼 Modo +18 DESACTIVADO.',
      m
    )
  }

  // SI ESTA APAGADO, BLOQUEAR TODO
  const nsfwCmds = [
    'xnxx','xvideos','ph','pornhub',
    'hentai','pack','rule34','random18',
    'porno','ytporn'
  ]

  if (nsfwCmds.includes(command) && !chat.adultMode)
    return conn.reply(m.chat, '❌ El modo +18 está desactivado.', m)

  // SOLO OWNERS
  if (!owners.includes(m.sender))
    return conn.reply(m.chat, '🚫 Solo owners.', m)

  try {

    // ─────────────────────────────────────────────
    // 📸 IMÁGENES ALEATORIAS
    // ─────────────────────────────────────────────
    if (['hentai', 'pack'].includes(command)) {
      let url = RANDOM_IMAGES[Math.floor(Math.random() * RANDOM_IMAGES.length)]
      return conn.sendMessage(m.chat, { image: { url }, caption: '🔞 Imagen random' }, { quoted: m })
    }

    if (command === 'rule34') {
      let url = RANDOM_RULE34[Math.floor(Math.random() * RANDOM_RULE34.length)]
      return conn.sendMessage(m.chat, { image: { url }, caption: '🔞 Rule34 random' }, { quoted: m })
    }

    // ─────────────────────────────────────────────
    // 🎥 VIDEOS ALEATORIOS
    // ─────────────────────────────────────────────
    if (['random18','xnxx','xvideos','ph','pornhub'].includes(command)) {

      let url = RANDOM_VIDEOS[Math.floor(Math.random() * RANDOM_VIDEOS.length)]

      // fallback si un link está muerto
      try {
        await fetch(url)
      } catch {
        url = "https://neonmoe.com/media1.mp4"
      }

      return conn.sendMessage(m.chat,
        { video: { url }, caption: '🔞 Video random' },
        { quoted: m }
      )
    }

    // ─────────────────────────────────────────────
    // ⬇️ DESCARGA DIRECTA
    // ─────────────────────────────────────────────
    if (command === 'porno') {
      const link = args[0]
      if (!link) return conn.reply(m.chat, '🔞 Uso: .porno <url>', m)

      await conn.reply(m.chat, '⬇️ Descargando...', m)

      try {
        let res = await fetch(link)
        if (!res.ok) return conn.reply(m.chat, '❌ Error al descargar.', m)

        const tmp = path.join('/tmp', `nsfw_${Date.now()}.mp4`)
        const file = fs.createWriteStream(tmp)
        await streamPipeline(res.body, file)

        await conn.sendMessage(m.chat, { video: fs.readFileSync(tmp), caption: '🔞 Aquí tenés' }, { quoted: m })
        fs.unlinkSync(tmp)
      } catch {
        return conn.reply(m.chat, '❌ Enlace inválido.', m)
      }
      return
    }

    // ─────────────────────────────────────────────
    // 📺 YouTube
    // ─────────────────────────────────────────────
    if (command === 'ytporn') {
      const link = args[0]
      if (!link) return conn.reply(m.chat, '🔞 Uso: .ytporn <url>', m)
      if (!ytdl) return conn.reply(m.chat, '❌ Instala ytdl-core.', m)

      await conn.reply(m.chat, '⬇️ Descargando video...', m)

      try {
        const info = await ytdl.default.getInfo(link)
        const format = ytdl.default.chooseFormat(info.formats, { quality: 'lowest', filter: 'audioandvideo' })

        const tmp = path.join('/tmp', `ytp_${Date.now()}.mp4`)
        const r = await fetch(format.url)
        const file = fs.createWriteStream(tmp)
        await streamPipeline(r.body, file)

        await conn.sendMessage(m.chat, { video: fs.readFileSync(tmp), caption: info.videoDetails.title }, { quoted: m })
        fs.unlinkSync(tmp)
      } catch {
        return conn.reply(m.chat, '❌ Error descargando YouTube.', m)
      }
    }

  } catch (e) {
    console.log(e)
    return conn.reply(m.chat, '❌ Error ejecutando el comando.', m)
  }
}

handler.command = [
  '+18','list18',
  'hentai','pack','rule34',
  'random18','xnxx','xvideos','ph','pornhub',
  'porno','ytporn'
]

export default handler

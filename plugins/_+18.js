// /plugins/nsfw-full-fixed.js
// Plugin +18 reescrito — descarga de videos real (Opción A) + listas + toggles
// Owners: 59898719147, 59896026646, 59892363485
// Feli 💀 — 2025

import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream'
import { promisify } from 'util'
const streamPipeline = promisify(pipeline)

// Si querés soporte de YouTube, instala en tu proyecto:
// npm i ytdl-core
let ytdl
try { ytdl = await import('ytdl-core') } catch (e) { ytdl = null }

const owners = [
  '59898719147@s.whatsapp.net',
  '59896026646@s.whatsapp.net',
  '59892363485@s.whatsapp.net'
]

let handler = async (m, { conn, args, command }) => {
  // DB chat
  let chat = global.db && global.db.data && global.db.data.chats
    ? (global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {})
    : (global.db = global.db || { data: { chats: {} } }, global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {})

  // -----------------------
  // .list18 (solo owners) - muestra comandos
  // -----------------------
  if (command === 'list18') {
    if (!owners.includes(m.sender))
      return conn.reply(m.chat, '🚫 Solo los dueños pueden ver esta lista.', m)

    let txt = `🔞 *COMANDOS +18 DISPONIBLES*\n
Comandos de búsqueda:
• .xnxx <texto>      (intenta buscar; si falla usa .porno <url>)
• .xvideos <texto>   (intenta buscar; si falla usa .porno <url>)
• .ph <texto>        (lo mismo)
• .pornhub <texto>
• .rule34 <texto>

Contenido random / imagenes:
• .hentai
• .pack
• .random18

Descarga directa (videos - opción A):
• .porno <url>       (descarga directa .mp4 / .webm)
• .ytporn <youtube_url> (descarga YouTube - requiere ytdl-core)

Control del sistema:
• .+18   (alternar activar / desactivar +18)
• .list18 (mostrar esta lista)

Modo actual: *${chat.adultMode ? 'ACTIVADO 🔥' : 'DESACTIVADO 🧼'}*
`
    return conn.reply(m.chat, txt, m)
  }

  // -----------------------
  // .+18 toggle (dueños)
  // -----------------------
  if (command === '+18') {
    if (!owners.includes(m.sender))
      return conn.reply(m.chat, '🚫 Solo los dueños pueden activar/desactivar +18.', m)

    chat.adultMode = !chat.adultMode
    return conn.reply(m.chat,
      chat.adultMode
        ? '🔞 *Modo +18 ACTIVADO.*\nAhora puedes usar comandos NSFW.'
        : '🧼 *Modo +18 DESACTIVADO.*\nTodos los comandos +18 fueron bloqueados.',
      m)
  }

  // -----------------------
  // Bloqueo global si modo off
  // -----------------------
  const nsfwCommands = ['xnxx','xvideos','ph','pornhub','hentai','rule34','pack','random18','porno','ytporn']
  if (nsfwCommands.includes(command) && !chat.adultMode) {
    return conn.reply(m.chat, '❌ *El modo +18 está desactivado.*\nActívalo con *. +18*', m)
  }

  // Solo owners pueden ejecutar los comandos NSFW
  if (!owners.includes(m.sender))
    return conn.reply(m.chat, '🚫 Solo los dueños pueden usar contenido +18.', m)

  const query = args.join(' ').trim()

  // comandos que requieren texto
  const needText = ['xnxx','xvideos','ph','pornhub','rule34']
  if (needText.includes(command) && !query)
    return conn.reply(m.chat, `🔞 Uso: .${command} <texto>`, m)

  try {
    // ========== IMAGES & RANDOM ==========
    // random18 -> nekobot (lewd) fallback waifu.pics
    if (command === 'random18') {
      // try nekobot
      try {
        let r = await fetch('https://nekobot.xyz/api/image?type=lewd')
        let j = await r.json()
        if (j?.message) {
          return conn.sendMessage(m.chat, { image: { url: j.message }, caption: '🔞 Aquí tenés 😈' }, { quoted: m })
        }
        // fallback to waifu.pics
      } catch (e) { /* fallthrough */ }

      // fallback: waifu.pics (nsfw/waifu)
      try {
        let r2 = await fetch('https://api.waifu.pics/nsfw/waifu')
        let j2 = await r2.json()
        if (j2?.url) return conn.sendMessage(m.chat, { image: { url: j2.url }, caption: '🔞 Aquí: waifu' }, { quoted: m })
      } catch (e) { /* fallthrough */ }

      return conn.reply(m.chat, '❌ No pude obtener imagen random. Intentá más tarde o usa .pack', m)
    }

    // hentai -> waifu.pics
    if (command === 'hentai') {
      let r = await fetch('https://api.waifu.pics/nsfw/waifu')
      let j = await r.json()
      if (j?.url) return conn.sendMessage(m.chat, { image: { url: j.url }, caption: '🔞 Hentai random' }, { quoted: m })
      return conn.reply(m.chat, '❌ No encontré hentai.', m)
    }

    // pack -> nekobot categories (ejemplos: ass / boobs / hentai)
    if (command === 'pack') {
      // intentar nekobot con tipo 'pussy' o 'ass' - rotar para variedad
      const types = ['pussy','ass','boobs','thigh','cum','hmidriff']
      for (let t of types) {
        try {
          let r = await fetch(`https://nekobot.xyz/api/image?type=${t}`)
          let j = await r.json()
          if (j?.message) {
            await conn.sendMessage(m.chat, { image: { url: j.message }, caption: `🔞 Pack (${t})` }, { quoted: m })
            // enviá 3 imágenes distintas
            for (let i = 0; i < 2; i++) {
              let r2 = await fetch(`https://nekobot.xyz/api/image?type=${t}`)
              let j2 = await r2.json()
              if (j2?.message) await conn.sendMessage(m.chat, { image: { url: j2.message } }, { quoted: m })
            }
            return
          }
        } catch (e) { continue }
      }
      return conn.reply(m.chat, '❌ No pude obtener pack.', m)
    }

    // rule34 -> usando rule34 json API
    if (command === 'rule34') {
      let r = await fetch(`https://rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(query)}`)
      if (!r.ok) return conn.reply(m.chat, '❌ Error Rule34 API.', m)
      let j = await r.json().catch(()=>null)
      if (!j || !j.length) return conn.reply(m.chat, '❌ No encontré resultados en Rule34.', m)
      // elegir una imagen aleatoria del resultado
      let item = j[Math.floor(Math.random() * j.length)]
      if (!item || !item.file_url) return conn.reply(m.chat, '❌ Resultado inválido.', m)
      return conn.sendMessage(m.chat, { image: { url: item.file_url }, caption: `🔞 Rule34: ${query}` }, { quoted: m })
    }

    // ========== VIDEO DOWNLOAD HELPERS ==========
    // .porno <url> -> descarga URL directa (mp4/webm)
    if (command === 'porno') {
      if (!query) return conn.reply(m.chat, '🔞 Uso: .porno <url-directa-a-mp4>', m)
      await conn.reply(m.chat, '🔞 Descargando video...', m)
      try {
        // descarga en streaming y envia buffer (cuidado con tamaños grandes)
        let res = await fetch(query, { timeout: 20000 })
        if (!res.ok) return conn.reply(m.chat, '❌ Error descargando el archivo. Verifica la URL.', m)
        // limitar tamaño razonable: 50 MB (ajustá si querés)
        const MAX_BYTES = 50 * 1024 * 1024
        const contentLength = res.headers.get('content-length')
        if (contentLength && Number(contentLength) > MAX_BYTES) {
          return conn.reply(m.chat, '❌ Archivo demasiado grande. Máx 50MB.', m)
        }
        // escribir a temp file
        let ext = '.mp4'
        // intentar sacar extensión de headers
        const ct = res.headers.get('content-type') || ''
        if (ct.includes('webm')) ext = '.webm'
        else if (ct.includes('mp4')) ext = '.mp4'
        const tmpFile = path.join('/tmp', `porno_${Date.now()}${ext}`)
        const fileStream = fs.createWriteStream(tmpFile)
        await streamPipeline(res.body, fileStream)
        // enviar
        await conn.sendMessage(m.chat, { video: fs.readFileSync(tmpFile), caption: '🔞 Aquí tienes' }, { quoted: m })
        // borrar
        fs.unlinkSync(tmpFile)
        return
      } catch (e) {
        console.error(e)
        return conn.reply(m.chat, '❌ No pude descargar ese contenido. Si es YouTube usa .ytporn <url>', m)
      }
    }

    // .ytporn <youtube_url> -> descarga YouTube vía ytdl-core (si está instalado)
    if (command === 'ytporn') {
      if (!query) return conn.reply(m.chat, '🔞 Uso: .ytporn <youtube_url>', m)
      if (!ytdl) {
        return conn.reply(m.chat, '❌ El módulo ytdl-core no está instalado en el bot.\nInstalar: npm i ytdl-core', m)
      }
      // validar url
      if (!ytdl.default.validateURL(query)) return conn.reply(m.chat, '❌ URL de YouTube inválida.', m)
      await conn.reply(m.chat, '🔞 Descargando desde YouTube...', m)
      try {
        // obtener info y elegir formato mp4
        const info = await ytdl.default.getInfo(query)
        const format = ytdl.default.chooseFormat(info.formats, { quality: 'highest', filter: (f)=> f.container === 'mp4' || f.container === 'webm' })
        if (!format || !format.url) return conn.reply(m.chat, '❌ No pude obtener formato mp4.', m)
        // streamear y guardar
        const tmpFile = path.join('/tmp', `ytporn_${Date.now()}.mp4`)
        const r = await fetch(format.url)
        if (!r.ok) return conn.reply(m.chat, '❌ Error descargando el video.', m)
        const fileStream = fs.createWriteStream(tmpFile)
        await streamPipeline(r.body, fileStream)
        await conn.sendMessage(m.chat, { video: fs.readFileSync(tmpFile), caption: `🔞 ${info.videoDetails.title}` }, { quoted: m })
        fs.unlinkSync(tmpFile)
        return
      } catch (e) {
        console.error(e)
        return conn.reply(m.chat, '❌ Error descargando YouTube.', m)
      }
    }

    // ========== BÚSQUEDAS (intentan API; si fallan piden link directo) ==========
    // Nota: muchas APIs públicas para XNXX/XVIDEOS/PORNHUB son inestables.
    // Aquí intentamos buscar con nekobot/lolhuman si existiera, pero si falla pedimos link directo.
    if (command === 'xnxx' || command === 'xvideos' || command === 'ph' || command === 'pornhub') {
      // intentar nekobot/lolhuman endpoints conocidos (fallará si no existen)
      // Primero intentamos usar nekobot generic search patterns (no siempre funcionan para video)
      try {
        // ejemplo: usar una búsqueda genérica en DuckDuckGo para encontrar primer resultado mp4/stream
        // Esto es mejor que depender de api-lolhuman caído: buscamos páginas y pedimos al owner el link directo si no encontramos mp4.
        await conn.reply(m.chat, '🔎 Buscando resultado, esto puede tardar... si no encuentra link directo usar .porno <url>', m)
        // Simple approach: usar DuckDuckGo HTML scraping via r.jina.ai to get rendered page text (lightweight)
        // Buscamos: "xnxx <query>" o "xvideos <query>" dependiendo del comando
        const site = command === 'xnxx' ? 'xnxx.com' : (command === 'xvideos' ? 'xvideos.com' : 'pornhub.com')
        const searchQuery = `${query} site:${site}`
        // usar textise dot iitty? -> vamos a usar "https://r.jina.ai/http://html.duckduckgo.com/html?q=" + encodeURIComponent(searchQuery)
        const jinaUrl = `https://r.jina.ai/http://html.duckduckgo.com/html?q=${encodeURIComponent(searchQuery)}`
        let sr = await fetch(jinaUrl, { timeout: 10000 })
        if (!sr.ok) throw 'no search'
        let body = await sr.text()
        // Buscar hrefs relativos a site
        const hrefs = [...body.matchAll(/href="(https?:\/\/[^"]+)"/g)].map(a=>a[1]).filter(u=>u.includes(site))
        if (hrefs.length === 0) {
          return conn.reply(m.chat, '❌ No encontré resultados claros. Pasa el enlace directo al video con .porno <url>', m)
        }
        // tomamos el primero
        const first = hrefs[0]
        // Intentamos obtener un link directo a archivo (puede no existir). Si la página contiene ".mp4" intentamos extraerlo
        let page = await fetch(`https://r.jina.ai/http://${first.replace(/^https?:\/\//,'')}`, { timeout: 10000 }).then(r=>r.text()).catch(()=>null)
        if (page) {
          // Buscar urls mp4/webm
          const matches = [...page.matchAll(/https?:\/\/[^"'\\\s]+\.m3u8|https?:\/\/[^"'\\\s]+\.mp4|https?:\/\/[^"'\\\s]+\.webm/g)].map(a=>a[0])
          if (matches.length) {
            // usamos el primero
            const mediaUrl = matches[0]
            return conn.sendMessage(m.chat, { video: { url: mediaUrl }, caption: `🔞 ${query} (desde búsqueda)` }, { quoted: m })
          }
        }
        // sino, devolvemos el primer enlace y pedimos que lo pases a .porno
        return conn.reply(m.chat, `🔎 Encontré una página: ${first}\nSi tiene video directo, pasalo a .porno <url> para descargarlo.`, m)
      } catch (e) {
        console.error('search error', e)
        return conn.reply(m.chat, '❌ No pude buscar correctamente (APIs de terceros inestables). Pasa enlace directo con .porno <url>', m)
      }
    }

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Error ejecutando el comando.', m)
  }
}

handler.help = [
  '+18', 'list18',
  'xnxx', 'xvideos', 'ph', 'pornhub',
  'hentai', 'rule34', 'pack', 'random18',
  'porno <url>', 'ytporn <youtube_url>'
]
handler.tags = ['nsfw']
handler.command = [
  '+18', 'list18',
  'xnxx','xvideos','ph','pornhub',
  'hentai','rule34','pack','random18',
  'porno','ytporn'
]

export default handler

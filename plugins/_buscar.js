import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.sendMessage(
      m.chat,
      { text: '🔎 *Ingresa algo para buscar.*\nEjemplo: *.buscar gatos*' },
      { quoted: m }
    )
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    // 🔍 DuckDuckGo Image Scraper (sin token, sin bloqueo)
    const url = `https://duckduckgo.com/?q=${encodeURIComponent(text)}&iax=images&ia=images`
    const res = await fetch(url)
    const html = await res.text()

    const token = html.match(/vqd='([^']+)'/)
    if (!token) throw 'No se pudo obtener token'

    const api = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(text)}&vqd=${token[1]}`
    const data = await fetch(api)
    const json = await data.json()

    if (!json.results || json.results.length === 0) throw 'Sin resultados'

    const image = json.results[0].image // primera imagen

    // enviar imagen REAL no archivo
    await conn.sendMessage(
      m.chat,
      {
        image: { url: image },
        caption: `🔎 *Resultado de:* ${text}`
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.log('Error en .buscar:', e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(
      m.chat,
      { text: '⚠️ No pude obtener imágenes. Probá con otro término.' },
      { quoted: m }
    )
  }
}

handler.command = ['buscar']
handler.tags = ['buscador']
handler.help = ['buscar <texto>']

export default handler

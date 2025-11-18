import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply('⚠️ Escribe qué querés buscar.\n\nEj: *.buscar gato negro*')
  }

  try {

    await conn.sendMessage(m.chat, { react: { text: '🔎', key: m.key } })

    // Buscador DuckDuckGo Images (no requiere token)
    const url = `https://duckduckgo.com/?q=${encodeURIComponent(text)}&iax=images&ia=images`

    const res = await fetch(url)
    const html = await res.text()

    // Extraer token vqd
    const vqd = html.match(/vqd='([\d-]+)'/)
    if (!vqd) throw new Error('No se pudo obtener token DuckDuckGo')

    const apiUrl = `https://duckduckgo.com/i.js?l=es-es&o=json&q=${encodeURIComponent(text)}&vqd=${vqd[1]}`
    const result = await fetch(apiUrl)
    const json = await result.json()

    if (!json.results || json.results.length === 0) {
      return m.reply('⚠️ No encontré imágenes para eso.')
    }

    const img = json.results[Math.floor(Math.random() * json.results.length)].image

    // Enviar como IMAGEN real
    await conn.sendMessage(
      m.chat,
      {
        image: { url: img },
        caption: `🔎 Resultado para: *${text}*`
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.log("ERROR .buscar:", e)
    return m.reply('⚠️ Ocurrió un error buscando la imagen.')
  }
}

handler.command = ['buscar']
export default handler

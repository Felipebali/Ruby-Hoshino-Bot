import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, '🔎 Escribe algo para buscar.\nEjemplo: *.buscar gatos*', m)
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    const url = `https://duckduckgo.com/?q=${encodeURIComponent(text)}&iax=images&ia=images`
    const res = await fetch(url)
    const html = await res.text()

    // 🔥 Extraemos el token que usa DuckDuckGo
    const token = html.match(/vqd=([\d-]+)/)?.[1]
    if (!token) throw new Error('No se pudo obtener token')

    // 🔥 Llamamos a la API de imágenes
    const api = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(text)}&vqd=${token}`
    const result = await fetch(api)
    const json = await result.json()

    if (!json.results || json.results.length === 0)
      throw new Error('sin resultados')

    // 🔥 Solo UNA imagen
    const image = json.results[0].image

    // Enviar imagen normal (NO archivo)
    await conn.sendMessage(
      m.chat,
      {
        image: { url: image },
        caption: `🔎 Resultado de: *${text}*`
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.reply(m.chat, '⚠️ No pude obtener imágenes. Probá con otro término.', m)
  }
}

handler.help = ['buscar <texto>']
handler.tags = ['buscador']
handler.command = ['buscar']

export default handler

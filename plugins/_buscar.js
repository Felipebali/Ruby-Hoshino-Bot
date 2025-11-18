import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.sendMessage(
      m.chat,
      { text: '🔎 Escribe algo para buscar.\nEjemplo: *.buscar gatos*' },
      { quoted: m }
    )
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    // API real y funcional de imágenes
    const url = `https://duckduckgo.com/i.js?q=${encodeURIComponent(text)}`
    const res = await fetch(url)
    const json = await res.json()

    if (!json.results || json.results.length === 0) {
      throw new Error('Sin imágenes')
    }

    const img = json.results[0].image // primera imagen

    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

    await conn.sendMessage(
      m.chat,
      {
        image: { url: img },
        caption: `🔎 *Resultado de:* ${text}`
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.log("Error en .buscar:", e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(
      m.chat,
      { text: '⚠️ No pude obtener imágenes. Probá otro término.' },
      { quoted: m }
    )
  }
}

handler.command = ['buscar']
handler.help = ['buscar <texto>']
handler.tags = ['tools']

export default handler

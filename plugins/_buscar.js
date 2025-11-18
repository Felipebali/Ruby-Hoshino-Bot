import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) {
    await conn.sendMessage(m.chat, {
      text: '🔎 Ingresa algo para buscar.\nEjemplo: *.buscar gatos*'
    }, { quoted: m })
    return
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    // 🔥 BUSCADOR DUCKDUCKGO (FUNCIONAL 2025)
    const res = await fetch(
      `https://duckduckgo.com/i.js?o=json&q=${encodeURIComponent(text)}`
    )
    const data = await res.json()

    if (!data?.results?.length) throw new Error('sin resultados')

    // 🔹 Tomamos SOLO una imagen
    const image = data.results[0].image

    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

    // 🔥 Enviar como IMAGEN real (no archivo)
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
    console.log('ERROR .buscar:', e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })

    await conn.sendMessage(m.chat, {
      text: '⚠️ No pude obtener una imagen. Probá otro término.'
    }, { quoted: m })
  }
}

handler.help = ['buscar <texto>']
handler.tags = ['buscador']
handler.command = ['buscar']

export default handler

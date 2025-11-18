import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.sendMessage(m.chat, { text: '⚠️ Escribe qué querés buscar.\nEjemplo: *.buscar gatos*' }, { quoted: m })
  }

  try {
    // Reacción inicio
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    // 🔥 BÚSQUEDA EXACTA EN BING (SIN TOKEN)
    let url = `https://www.bing.com/images/search?q=${encodeURIComponent(text)}&form=HDRSC2&first=1&tsc=ImageBasicHover`
    let res = await fetch(url)
    let html = await res.text()

    // Extrae URLs de imágenes de Bing
    let regex = /murl&quot;:&quot;(https:\/\/[^&]+)&quot;/g
    let matches = [...html.matchAll(regex)]

    if (!matches.length) throw new Error("Sin resultados")

    // Una sola imagen
    let image = matches[0][1]

    // Reacción búsqueda ok
    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

    // Enviar la imagen
    await conn.sendMessage(
      m.chat,
      {
        image: { url: image },
        caption: `🔎 *Resultado de:* ${text}`
      },
      { quoted: m }
    )

    // Reacción final
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error("Error en .buscar:", e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(m.chat, { text: '⚠️ No pude obtener imágenes. Probá otro término.' }, { quoted: m })
  }
}

handler.help = ['buscar <texto>']
handler.tags = ['buscador']
handler.command = ['buscar']

export default handler

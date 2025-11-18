import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.sendMessage(m.chat, { text: '🔎 Ingresa algo. Ej: *.buscar perros*' }, { quoted: m })
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key }})

    // 🔥 Buscador por Bing (sin API)
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(text)}&form=HDRSC2`
    const html = await fetch(url).then(res => res.text())

    // Extraemos las URLs de imágenes
    const regex = /murl&quot;:&quot;(.*?)&quot;/g
    const images = []
    let match

    while ((match = regex.exec(html)) !== null) {
      images.push(match[1])
    }

    if (!images.length) throw new Error("No se encontraron imágenes")

    const image = images[0] // 🔥 Solo UNA imagen

    await conn.sendMessage(
      m.chat,
      {
        image: { url: image },
        caption: `🔎 Resultado de: *${text}*`
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key }})

  } catch (e) {
    console.log("ERROR .buscar:", e)
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key }})
    await conn.sendMessage(m.chat, { text: "⚠️ No pude obtener imágenes. Probá otro término." }, { quoted: m })
  }
}

handler.help = ['buscar <texto>']
handler.tags = ['buscador']
handler.command = ['buscar']

export default handler

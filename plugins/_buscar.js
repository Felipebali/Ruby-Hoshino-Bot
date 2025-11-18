import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, '❗ Ingresa algo. Ej: *.buscar perros*', m)

  try {
    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

    // 🔥 Buscador real (Bing)
    let url = `https://bing-image-search-api.vercel.app/search?q=${encodeURIComponent(text)}`
    let res = await fetch(url)
    let data = await res.json()

    if (!data || !data.value || data.value.length === 0)
      throw 'Sin resultados'

    // ✔️ Elegir una imagen al azar que no sea repetida
    let image = data.value[Math.floor(Math.random() * data.value.length)].contentUrl

    // ✔️ Enviar como imagen
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
    console.log('Error en .buscar:', e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.reply(m.chat, '⚠️ No pude obtener imágenes.', m)
  }
}

handler.help = ['buscar <texto>']
handler.tags = ['buscador']
handler.command = ['buscar']

export default handler

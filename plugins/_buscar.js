import { googleImage } from '@bochilteam/scraper'

let handler = async (m, { conn, text }) => {
  if (!text) {
    await conn.sendMessage(
      m.chat,
      { text: '🔎 Ingresa algo para buscar.\nEjemplo: *.buscar gatos*' },
      { quoted: m }
    )
    return
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    let res = await googleImage(text)

    // 🔥 FILTRA SOLO IMÁGENES CON FORMATO REAL
    res = res.filter(img =>
      img &&
      typeof img === 'string' &&
      img.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)
    )

    if (!res.length) throw 'Sin imágenes válidas'

    const image = res[0] // una sola

    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

    // 📌 ENVÍA COMO IMAGEN
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
    console.error('Error en .buscar:', e)

    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(
      m.chat,
      { text: '⚠️ No pude obtener una imagen válida. Probá otro término.' },
      { quoted: m }
    )
  }
}

handler.help = ['buscar <texto>']
handler.tags = ['buscador']
handler.command = ['buscar']

export default handler

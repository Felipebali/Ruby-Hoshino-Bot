import { googleImage } from '@bochilteam/scraper'
import fetch from 'node-fetch'

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

    const res = await googleImage(text)

    // toma la primera imagen válida
    const url = res?.[0]
    if (!url) throw new Error('Sin resultados')

    // descarga la imagen como buffer REAL
    const response = await fetch(url)
    const buffer = await response.buffer()

    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

    await conn.sendMessage(
      m.chat,
      {
        image: buffer,
        caption: `🔎 *Resultado de:* ${text}`
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.log('ERROR EN BUSCAR:', e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(
      m.chat,
      { text: '⚠️ No pude obtener una imagen. Probá con otra búsqueda.' },
      { quoted: m }
    )
  }
}

handler.help = ['buscar <texto>']
handler.tags = ['buscador']
handler.command = ['buscar']

export default handler

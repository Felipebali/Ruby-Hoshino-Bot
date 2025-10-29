import { googleImage } from '@bochilteam/scraper'

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) return

  try {

    const res = await googleImage(text)

    // Limitar solo a los primeros 20 resultados

    const results = res.slice(0, 20)

    // Elegir uno al azar

    const image = results[Math.floor(Math.random() * results.length)]

    await conn.sendFile(m.chat, image, 'error.jpg', `${text}`, m)

  } catch (e) {

    console.log(e)

  }

}

handler.command = ["imagen"]

export default handler

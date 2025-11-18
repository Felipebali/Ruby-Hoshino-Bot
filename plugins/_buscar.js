import { googleImage } from "@bochilteam/scraper"
import fetch from "node-fetch"

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.sendMessage(
      m.chat,
      { text: "🔎 Ingresá algo para buscar.\nEjemplo: *.buscar gatos*" },
      { quoted: m }
    )
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } })

    const data = await googleImage(text)
    if (!data || !data.length) throw new Error("sin resultados")

    const url = data[0] // primera imagen
    const res = await fetch(url)

    if (!res.ok) throw new Error("imagen caída")

    const buffer = await res.arrayBuffer()

    await conn.sendMessage(
      m.chat,
      {
        image: Buffer.from(buffer),
        caption: `🔎 Resultado de: *${text}*`
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

  } catch (e) {
    console.log("ERROR .buscar:", e)
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
    await conn.sendMessage(
      m.chat,
      { text: "⚠️ No pude obtener una imagen. Probá otro término." },
      { quoted: m }
    )
  }
}

handler.command = ["buscar"]
export default handler

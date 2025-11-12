import fetch from "node-fetch"

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text)
    return m.reply(`💬 Uso correcto:\n\n${usedPrefix + command} <pregunta>\n\nEjemplo:\n${usedPrefix + command} ¿Quién fue Nikola Tesla?`)

  try {
    await m.react("🤖")

    const query = encodeURIComponent(text)
    const url = `https://api.affiliateplus.xyz/api/chatbot?message=${query}&botname=Ruby&ownername=Feli`
    const res = await fetch(url)
    const data = await res.json()

    if (!data || !data.message) throw new Error("Sin respuesta")

    await m.reply(`🪄 ${data.message}`)
    await m.react("✅")

  } catch (err) {
    console.error("❌ Error en .bot:", err)
    await m.reply("⚠️ No pude conectar con la IA. Intenta más tarde o revisa tu conexión.")
  }
}

handler.help = ["bot"]
handler.tags = ["ai"]
handler.command = /^bot$/i

export default handler

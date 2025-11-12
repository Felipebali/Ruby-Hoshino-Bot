import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    return m.reply(`💬 *Uso correcto:*\n\n${usedPrefix + command} <pregunta>\n\n📘 Ejemplo:\n${usedPrefix + command} ¿Qué opinas del clima?`)

  try {
    await conn.sendMessage(m.chat, { react: { text: '🤔', key: m.key } })

    // 🔹 Nueva API pública de IA en español
    const res = await fetch("https://api.safone.dev/chatgpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, user: m.sender })
    })

    const data = await res.json()
    if (!data || !data.result) throw new Error("Sin respuesta válida")

    const usuario = m.pushName || 'Usuario'
    const respuesta = data.result.trim()

    const msg = `🐾 *FelixCat_Bot responde a @${m.sender.split('@')[0]}:*\n\n${respuesta}`
    await conn.reply(m.chat, msg, m, { mentions: [m.sender] })
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (err) {
    console.error('❌ Error en .bot:', err)
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
    await conn.reply(m.chat, '⚠️ No pude pensar en una buena respuesta ahora mismo...', m)
  }
}

handler.help = ['bot <texto>']
handler.tags = ['ia', 'fun']
handler.command = /^bot$/i

export default handler

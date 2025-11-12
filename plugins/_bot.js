import fetch from 'node-fetch'

let handler = async (m, { text, conn }) => {
  try {
    if (!text) return conn.reply(m.chat, '💭 *Ejemplo:* .bot ¿Cómo estás?', m)

    await conn.sendMessage(m.chat, { react: { text: '🤔', key: m.key } })

    // 🔗 Nueva URL funcional de HuggingFace
    const response = await fetch("https://router.huggingface.co/hf-inference/models/mistralai/Mixtral-8x7B-Instruct-v0.1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inputs: text,
        parameters: { max_new_tokens: 100, temperature: 0.7 }
      })
    })

    // Si la respuesta no es válida
    if (!response.ok) {
      throw new Error(`❌ Falló la conexión (${response.status})`)
    }

    const result = await response.json()
    let output = result?.[0]?.generated_text || "⚠️ No pude pensar en una buena respuesta ahora mismo..."

    // ✨ Respuesta limpia
    const mensaje = `💬 *Respuesta IA:*\n${output.trim()}`
    await conn.reply(m.chat, mensaje, m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error('❌ Error en .bot:', e)
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
    await conn.reply(m.chat, '⚠️ Ocurrió un error al procesar tu mensaje.', m)
  }
}

handler.help = ['bot <texto>']
handler.tags = ['ia']
handler.command = ['bot', 'ia', 'ask']
export default handler

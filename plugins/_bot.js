import fetch from 'node-fetch'

const OPENAI_API_KEY = 'TU_API_KEY_AQUI'  // si usás OpenAI u otro servicio que lo requiera

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `💬 *Uso correcto:*\n\n${usedPrefix + command} <pregunta>\n\n📘 Ejemplo:\n${usedPrefix + command} ¿Cuál es la capital de Uruguay?`,
      m
    )
  }

  await conn.sendMessage(m.chat, { react: { text: '🤖', key: m.key } })

  try {
    // Ejemplo usando OpenAI ChatCompletions
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: text }],
        max_tokens: 150
      })
    })

    if (!response.ok) {
      throw new Error(`Error API: ${response.status}`)
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || 'Lo siento, no tengo una respuesta para eso.'

    await conn.reply(m.chat, reply.trim(), m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (err) {
    console.error('❌ Error en .bot:', err)
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
    await conn.reply(m.chat, '⚠️ Hubo un error al procesar tu pregunta.', m)
  }
}

handler.help = ['bot <texto>']
handler.tags = ['ia', 'utilidad']
handler.command = /^bot$/i

export default handler

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `💬 *Uso correcto:*\n${usedPrefix + command} <pregunta>\n\n📘 Ejemplo:\n${usedPrefix + command} ¿Cuál es la capital de Alemania?`, m)

  await conn.sendMessage(m.chat, { react: { text: '🤖', key: m.key } })

  try {
    // 🌐 API pública gratuita sin clave
    const res = await fetch('https://api.freegptapi.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: text }],
        max_tokens: 150,
      })
    })

    if (!res.ok) throw new Error(`Error API (${res.status})`)

    const data = await res.json()
    const respuesta = data?.choices?.[0]?.message?.content?.trim() || '🤔 No tengo una respuesta ahora mismo.'

    await conn.reply(m.chat, respuesta, m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (err) {
    console.error('❌ Error en .bot:', err)
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
    await conn.reply(m.chat, '⚠️ Ocurrió un error al procesar tu mensaje.', m)
  }
}

handler.help = ['bot <texto>']
handler.tags = ['ia']
handler.command = /^bot$/i

export default handler

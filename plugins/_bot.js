// 📂 plugins/_bot.js — IA de conversación simple
import fetch from 'node-fetch'

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) return m.reply(`💬 *Uso correcto:*\n\n> ${usedPrefix + command} <pregunta>\n\n🧠 Ejemplo:\n> ${usedPrefix + command} ¿Qué opinas del clima hoy?`)

  await m.react('🤖')

  try {
    // 🌐 Usamos modelo gratuito de HuggingFace (sin key)
    const response = await fetch(`https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: text })
    })

    // 🔍 Validamos respuesta
    if (!response.ok) {
      console.error(await response.text())
      throw new Error('Error al conectar con la IA.')
    }

    const data = await response.json()
    const reply = data?.[0]?.generated_text || "⚠️ No pude pensar en una buena respuesta ahora mismo..."

    await m.reply(reply)
    await m.react('✅')
  } catch (err) {
    console.error('❌ Error en .bot:', err)
    await m.reply('⚠️ Ocurrió un error al procesar tu mensaje.')
  }
}

handler.help = ['bot']
handler.tags = ['ia']
handler.command = /^bot$/i
export default handler

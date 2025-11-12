import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    return m.reply(`💬 *Uso correcto:*\n\n${usedPrefix + command} <pregunta>\n\n📘 Ejemplo:\n${usedPrefix + command} ¿Quién fue Nikola Tesla?`)

  try {
    await conn.sendMessage(m.chat, { react: { text: '🤔', key: m.key } })

    // 🌐 API pública gratuita de IA ligera (sin clave)
    const res = await fetch(`https://api.simsimi.net/v2/?text=${encodeURIComponent(text)}&lc=es`)
    const data = await res.json()

    if (!data.success) throw new Error('Sin respuesta')

    const respuesta = data.success
    const usuario = m.pushName || 'Usuario'

    const mensaje = `🐾 *FelixCat_Bot responde:*\n\n${respuesta}\n\n— ${usuario}, ¿algo más que quieras saber? 😺`

    await conn.reply(m.chat, mensaje, m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '⚠️ No pude pensar en una buena respuesta ahora mismo...', m)
  }
}

handler.help = ['bot <texto>']
handler.tags = ['ia', 'fun']
handler.command = /^bot$/i

export default handler 

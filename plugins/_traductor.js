import fetch from 'node-fetch'

const idiomas = {
  es: 'Español',
  en: 'Inglés',
  pt: 'Portugués',
  fr: 'Francés',
  it: 'Italiano',
  de: 'Alemán',
  ja: 'Japonés',
  ru: 'Ruso',
  ko: 'Coreano',
  zh: 'Chino'
}

let handler = async (m, { text, args, usedPrefix, command, conn }) => {
  await conn.sendMessage(m.chat, { react: { text: '🌐', key: m.key } })

  // Si el usuario respondió a un mensaje, usar ese texto
  if (!text && m.quoted?.text) text = m.quoted.text

  if (!text)
    return m.reply(
      `🌍 *Uso correcto:*\n\n` +
      `✦ \`${usedPrefix + command}\` <idioma> <texto>\n` +
      `✦ o simplemente responde a un mensaje con \`${usedPrefix + command} <idioma>\`\n\n` +
      `📘 *Ejemplo:*\n> ${usedPrefix + command} en Hola, ¿cómo estás?\n> ${usedPrefix + command} it Buenos días\n\n` +
      `🌐 *Idiomas disponibles:*\n${Object.entries(idiomas).map(([k, v]) => `• ${k} = ${v}`).join('\n')}`
    )

  const partes = text.split(' ')
  let lang = partes[0].toLowerCase()
  let texto

  // Si el primer argumento es idioma válido
  if (idiomas[lang]) texto = partes.slice(1).join(' ')
  else {
    texto = text
    lang = 'es' // por defecto traduce al español
  }

  if (!texto) return m.reply('✏️ Escribí el texto que querés traducir.')

  try {
    // Detección automática del idioma y traducción
    const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(texto)}`
    const res = await fetch(apiUrl)
    const data = await res.json()

    const traduccion = data[0].map(t => t[0]).join('')
    const idiomaDetectado = data[2]

    await m.reply(
      `🌐 *Traducción al ${idiomas[lang] || lang.toUpperCase()}*\n\n` +
      `🗣️ *Texto original (${idiomaDetectado.toUpperCase()}):*\n${texto}\n\n` +
      `💬 *Traducción:*\n${traduccion}`
    )
  } catch (e) {
    console.error(e)
    await m.reply('⚠️ Ocurrió un error al traducir. Intentalo de nuevo más tarde.')
  }
}

handler.help = ['traducir <idioma> <texto>']
handler.tags = ['utilidades']
handler.command = /^traducir$/i

export default handler

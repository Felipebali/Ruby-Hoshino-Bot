import fetch from 'node-fetch'

const idiomas = {
  en: 'Inglés',
  es: 'Español',
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

  if (!args[0])
    return m.reply(
      `🌍 *Uso correcto:*\n\n` +
      `✦ \`${usedPrefix + command}\` <idioma> <texto>\n` +
      `✦ o simplemente \`${usedPrefix + command}\` <texto>\n\n` +
      `📘 *Ejemplo:*\n> ${usedPrefix + command} en Hola, ¿cómo estás?\n> ${usedPrefix + command} Hello world\n\n` +
      `🌐 *Idiomas disponibles:*\n${Object.entries(idiomas).map(([k, v]) => `• ${k} = ${v}`).join('\n')}`
    )

  let lang = args[0].toLowerCase()
  let texto

  // Si el primer argumento es un idioma válido
  if (idiomas[lang]) {
    texto = args.slice(1).join(' ')
    if (!texto) return m.reply('✏️ Escribí el texto que querés traducir.')
  } else {
    // Si no se especifica idioma, traduce automáticamente al español
    texto = args.join(' ')
    lang = 'es'
  }

  try {
    // Detectar idioma automáticamente
    const detectar = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=auto|${lang}`)
    const data = await detectar.json()
    const traduccion = data?.responseData?.translatedText
    const idiomaDetectado = data?.responseData?.match?.['language'] || 'desconocido'

    if (!traduccion) throw new Error()

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
handler.tags = ['utilidades', 'traducción']
handler.command = /^traducir$/i

export default handler

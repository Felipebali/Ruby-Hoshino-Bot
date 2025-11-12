import fetch from 'node-fetch'

let handler = async (m, { text, args, usedPrefix, command }) => {
  if (!args[0])
    return m.reply(
      `🌍 *Uso correcto:*\n\n` +
      `✦ \`${usedPrefix + command}\` <idioma> <texto>\n\n` +
      `📘 *Ejemplo:*\n` +
      `> ${usedPrefix + command} en Hola, ¿cómo estás?\n\n` +
      `🌐 *Idiomas más usados:*\n` +
      `en = Inglés\nes = Español\npt = Portugués\nfr = Francés\nit = Italiano\nde = Alemán\nja = Japonés\nru = Ruso`
    )

  const lang = args[0].toLowerCase()
  const txt = args.slice(1).join(' ')
  if (!txt) return m.reply('✏️ Escribí el texto que querés traducir.')

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(txt)}&langpair=auto|${lang}`
    )
    const data = await res.json()
    const translated = data?.responseData?.translatedText

    if (!translated) return m.reply('❌ No se pudo traducir el texto.')

    await m.reply(
      `🌐 *Traducción (${lang.toUpperCase()})*\n\n` +
      `🗣️ Texto original:\n${txt}\n\n` +
      `💬 Traducción:\n${translated}`
    )
  } catch (e) {
    console.error(e)
    m.reply('⚠️ Ocurrió un error al intentar traducir.')
  }
}

handler.help = ['traducir <idioma> <texto>']
handler.tags = ['herramientas', 'utilidades']
handler.command = /^traducir$/i

export default handler 

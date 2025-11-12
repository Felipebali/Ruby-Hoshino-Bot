import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    return conn.reply(
      m.chat,
      `🌦️ *Uso correcto:*\n\n${usedPrefix + command} <ciudad>\n\nEjemplo:\n${usedPrefix + command} Montevideo`,
      m
    )

  try {
    const res = await fetch(`https://wttr.in/${encodeURIComponent(text)}?format=j1`)
    const data = await res.json()

    const lugar = data.nearest_area?.[0]?.areaName?.[0]?.value || text
    const region = data.nearest_area?.[0]?.region?.[0]?.value || ''
    const pais = data.nearest_area?.[0]?.country?.[0]?.value || ''
    const clima = data.current_condition?.[0]
    const temp = clima?.temp_C
    const sensacion = clima?.FeelsLikeC
    const estado = clima?.weatherDesc?.[0]?.value
    const humedad = clima?.humidity
    const viento = clima?.windspeedKmph
    const icono = clima?.weatherIconUrl?.[0]?.value

    const info = `
🌍 *Clima en ${lugar}, ${region}, ${pais}:*

🌡️ Temperatura: *${temp}°C*
🥵 Sensación térmica: *${sensacion}°C*
🌤️ Estado: *${estado}*
💧 Humedad: *${humedad}%*
💨 Viento: *${viento} km/h*
    `.trim()

    await conn.sendMessage(m.chat, {
      image: { url: icono },
      caption: info
    })
  } catch (err) {
    console.error(err)
    await conn.reply(
      m.chat,
      '⚠️ No se pudo obtener el clima. Intenta nuevamente o revisa el nombre de la ciudad.',
      m
    )
  }
}

handler.help = ['clima <ciudad>']
handler.tags = ['info']
handler.command = ['clima', 'weather']
export default handler 

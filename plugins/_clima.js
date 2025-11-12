import fetch from 'node-fetch'

// Diccionario de traducciones de estados del clima
const traducciones = {
  "Sunny": "Soleado",
  "Clear": "Despejado",
  "Partly cloudy": "Parcialmente nublado",
  "Cloudy": "Nublado",
  "Overcast": "Cubierto",
  "Mist": "Neblina",
  "Patchy rain possible": "Posibles lluvias aisladas",
  "Patchy snow possible": "Posibles nevadas aisladas",
  "Patchy sleet possible": "Posible aguanieve",
  "Patchy freezing drizzle possible": "Posible llovizna helada",
  "Thundery outbreaks possible": "Posibles tormentas eléctricas",
  "Blowing snow": "Nieve soplada",
  "Blizzard": "Ventisca",
  "Fog": "Niebla",
  "Freezing fog": "Niebla helada",
  "Patchy light drizzle": "Llovizna ligera irregular",
  "Light drizzle": "Llovizna ligera",
  "Freezing drizzle": "Llovizna helada",
  "Heavy freezing drizzle": "Llovizna helada fuerte",
  "Patchy light rain": "Lluvia ligera irregular",
  "Light rain": "Lluvia ligera",
  "Moderate rain at times": "Lluvia moderada intermitente",
  "Moderate rain": "Lluvia moderada",
  "Heavy rain at times": "Lluvia fuerte intermitente",
  "Heavy rain": "Lluvia fuerte",
  "Light freezing rain": "Lluvia helada ligera",
  "Moderate or heavy freezing rain": "Lluvia helada moderada o fuerte",
  "Light sleet": "Aguanieve ligera",
  "Moderate or heavy sleet": "Aguanieve moderada o fuerte",
  "Patchy light snow": "Nieve ligera irregular",
  "Light snow": "Nieve ligera",
  "Patchy moderate snow": "Nieve moderada irregular",
  "Moderate snow": "Nieve moderada",
  "Patchy heavy snow": "Nieve fuerte irregular",
  "Heavy snow": "Nieve fuerte",
  "Ice pellets": "Granizo pequeño",
  "Light rain shower": "Lluvia ligera",
  "Moderate or heavy rain shower": "Lluvia moderada o fuerte",
  "Torrential rain shower": "Lluvia torrencial",
  "Light sleet showers": "Chubascos de aguanieve ligera",
  "Moderate or heavy sleet showers": "Chubascos de aguanieve moderada o fuerte",
  "Light snow showers": "Chubascos de nieve ligera",
  "Moderate or heavy snow showers": "Chubascos de nieve moderada o fuerte",
  "Light showers of ice pellets": "Chubascos ligeros de granizo",
  "Moderate or heavy showers of ice pellets": "Chubascos de granizo moderados o fuertes",
  "Patchy light rain in area with thunder": "Lluvias ligeras dispersas con truenos",
  "Moderate or heavy rain in area with thunder": "Lluvias moderadas o fuertes con truenos",
  "Patchy light snow in area with thunder": "Nevadas ligeras dispersas con truenos",
  "Moderate or heavy snow in area with thunder": "Nevadas moderadas o fuertes con truenos"
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    return conn.reply(
      m.chat,
      `🌦️ *Uso correcto:*\n\n${usedPrefix + command} <ciudad>\n\n🧭 Ejemplo:\n${usedPrefix + command} Mercedes`,
      m
    )

  try {
    const res = await fetch(`https://wttr.in/${encodeURIComponent(text)}?format=j1`)
    const data = await res.json()

    if (!data || !data.current_condition)
      throw new Error('No se pudieron obtener los datos del clima.')

    const lugar = data.nearest_area?.[0]?.areaName?.[0]?.value || text
    const region = data.nearest_area?.[0]?.region?.[0]?.value || ''
    const pais = data.nearest_area?.[0]?.country?.[0]?.value || ''
    const clima = data.current_condition?.[0]
    const temperatura = clima?.temp_C
    const sensacion = clima?.FeelsLikeC
    let estado = clima?.weatherDesc?.[0]?.value
    const humedad = clima?.humidity
    const viento = clima?.windspeedKmph
    const icono = clima?.weatherIconUrl?.[0]?.value || null

    // Traducción al español
    if (estado && traducciones[estado]) estado = traducciones[estado]

    const horaLocal = new Date().toLocaleString('es-UY', {
      timeZone: 'America/Montevideo'
    })

    const info = `
🌍 *Clima actual en ${lugar}, ${region}, ${pais}:*

🕒 Hora local: *${horaLocal}*
🌡️ Temperatura: *${temperatura}°C*
🥵 Sensación térmica: *${sensacion}°C*
🌤️ Estado del cielo: *${estado}*
💧 Humedad: *${humedad}%*
💨 Viento: *${viento} km/h*
    `.trim()

    if (icono) {
      await conn.sendMessage(m.chat, {
        image: { url: icono },
        caption: info
      })
    } else {
      await conn.reply(m.chat, info, m)
    }
  } catch (err) {
    console.error('❌ Error en el comando .clima:', err)
    await conn.reply(
      m.chat,
      '⚠️ No se pudo obtener el clima. Verifica el nombre de la ciudad o intenta nuevamente.',
      m
    )
  }
}

handler.help = ['clima <ciudad>']
handler.tags = ['información']
handler.command = ['clima', 'tiempo']
export default handler

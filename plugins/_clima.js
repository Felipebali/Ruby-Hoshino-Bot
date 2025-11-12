import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `🌦️ *Uso correcto:*\n\n${usedPrefix + command} <ciudad>\n\nEjemplo:\n${usedPrefix + command} Montevideo`,
      m
    )
  }

  try {
    // Paso 1: obtener latitud/longitud de la ciudad (usar geocodificación simple)
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=1&language=es`)
    const geoData = await geoRes.json()
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('No se encontró la ciudad.')
    }
    const { latitude, longitude, name, country, timezone } = geoData.results[0]

    // Paso 2: pedir clima actual
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=${encodeURIComponent(timezone)}`)
    const weatherData = await weatherRes.json()
    if (!weatherData.current_weather) {
      throw new Error('No se pudo obtener el clima actual.')
    }
    const cw = weatherData.current_weather
    const temperatura = cw.temperature
    const viento = cw.windspeed
    const horaLocal = cw.time // ya en timezone de la ciudad

    // Nota: Open-Meteo devuelve un “weathercode” en vez de texto de estado.
    // Hay que traducirlo manualmente:
    const codigo = cw.weathercode
    const estados = {
      0: 'Cielo despejado',
      1: 'Principalmente despejado',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Niebla',
      48: 'Niebla helada',
      51: 'Llovizna ligera',
      53: 'Llovizna moderada',
      55: 'Llovizna densa',
      56: 'Llovizna helada ligera',
      57: 'Llovizna helada densa',
      61: 'Lluvia ligera',
      63: 'Lluvia moderada',
      65: 'Lluvia intensa',
      66: 'Lluvia helada ligera',
      67: 'Lluvia helada intensa',
      71: 'Nieve ligera',
      73: 'Nieve moderada',
      75: 'Nieve intensa',
      77: 'Granizo',
      80: 'Chubascos de lluvia ligera',
      81: 'Chubascos de lluvia moderada',
      82: 'Chubascos de lluvia intensos',
      85: 'Chubascos de nieve ligera',
      86: 'Chubascos de nieve intensos',
      95: 'Tormenta',
      96: 'Tormenta con granizo ligero',
      99: 'Tormenta con granizo fuerte'
    }
    const estado = estados[codigo] || 'Estado del cielo desconocido'

    const info = `
🌍 *Clima actual en ${name}, ${country}:*

🕒 Hora local: *${horaLocal}*
🌡️ Temperatura: *${temperatura}°C*
🌤️ Estado del cielo: *${estado}*
💨 Viento: *${viento} km/h*
    `.trim()

    await conn.reply(m.chat, info, m)

  } catch (err) {
    console.error('❌ Error en comando .clima:', err)
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

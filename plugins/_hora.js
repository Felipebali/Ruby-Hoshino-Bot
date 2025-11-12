import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    // Si no se especifica país, usa Uruguay por defecto 🇺🇾
    let lugar = text ? text.trim() : 'Uruguay'
    let zona = ''

    // 🔍 API pública para obtener zona horaria
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(lugar)}`)
    const geoData = await geoRes.json()

    if (!geoData || geoData.length === 0) {
      return conn.reply(m.chat, `⚠️ No pude encontrar la ubicación: *${lugar}*`, m)
    }

    const { lat, lon, display_name } = geoData[0]

    // Obtener zona horaria a partir de coordenadas
    const tzRes = await fetch(`https://timeapi.io/api/Time/current/coordinate?latitude=${lat}&longitude=${lon}`)
    const tzData = await tzRes.json()

    if (!tzData || !tzData.timeZone) {
      return conn.reply(m.chat, `⚠️ No se pudo obtener la hora en *${lugar}*`, m)
    }

    zona = tzData.timeZone
    const ahora = new Date(tzData.dateTime)
    const horaNum = ahora.getHours()

    // Determinar emoji según hora del día
    let emoji = '🌙'
    if (horaNum >= 6 && horaNum < 12) emoji = '🌅'
    else if (horaNum >= 12 && horaNum < 19) emoji = '🌞'
    else if (horaNum >= 19 && horaNum < 23) emoji = '🌆'

    const fecha = ahora.toLocaleDateString('es-UY', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: zona
    })

    const hora = ahora.toLocaleTimeString('es-UY', {
      timeZone: zona,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    const mensaje = `
${emoji} *Hora actual en ${display_name.split(',')[0]}:*

📅 *${fecha.charAt(0).toUpperCase() + fecha.slice(1)}*
⏰ *${hora}*
🗺️ Zona horaria: *${zona}*
    `.trim()

    await conn.reply(m.chat, mensaje, m)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    console.error('❌ Error en .hora:', e)
    await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
    await conn.reply(m.chat, '⚠️ Hubo un error al obtener la hora.', m)
  }
}

handler.help = ['hora <país/ciudad>']
handler.tags = ['utilidad']
handler.command = ['hora', 'tiempo', 'time']
export default handler 

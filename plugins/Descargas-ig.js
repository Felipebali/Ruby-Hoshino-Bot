// 📸 Comando: .ig <usuario>
// 🧠 Extrae info desde el HTML de Instagram (sin API externa)
// ✅ Funciona con perfiles privados y públicos
// 🐱 FelixCat-Bot by Feli

import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`⚠️ Ingresa el usuario de Instagram.\nEjemplo: ${usedPrefix + command} feli_bali`)
  }

  const username = args[0].replace('@', '').trim()
  await m.react('⌛')

  try {
    const url = `https://www.instagram.com/${encodeURIComponent(username)}/`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; FelixCatBot/1.0)' }
    })

    if (!res.ok) {
      if (res.status === 404) throw new Error('Usuario no encontrado.')
      throw new Error(`Error HTTP ${res.status}: no se pudo acceder a Instagram.`)
    }

    const html = await res.text()

    // Extraemos el bloque JSON con los datos del perfil
    const jsonMatch = html.match(/<script type="application\/ld\+json">({[^<]+})<\/script>/)
    if (!jsonMatch) throw new Error('No se encontró información en el perfil.')

    let nombre = 'No disponible'
    let bio = 'No disponible'
    let profilePic = null

    try {
      const data = JSON.parse(jsonMatch[1])
      nombre = data.name || 'No disponible'
      bio = (data.description || 'No disponible').replace(/\\n/g, '\n')
      profilePic = data.image || null
    } catch {
      throw new Error('Error al procesar los datos del perfil.')
    }

    // Mensaje final
    const mensaje = `
╭━━〔 ⚡ *FelixCat-Bot* ⚡ 〕━━⬣
┃ 👤 *Usuario:* @${username}
┃ 📝 *Nombre:* ${nombre}
┃ 💬 *Biografía:* ${bio}
┃ 🔗 *Perfil:* https://www.instagram.com/${username}/
╰━━━━━━━━━━━━━━━━⬣
`.trim()

    if (profilePic && profilePic.startsWith('http')) {
      await conn.sendMessage(m.chat, {
        image: { url: profilePic },
        caption: mensaje
      })
    } else {
      await conn.sendMessage(m.chat, { text: mensaje })
    }

    await m.react('✅')

  } catch (err) {
    console.error('[IG SCRAPE ERROR]', err)
    await conn.sendMessage(m.chat, {
      text: `❌ *Error:* ${err.message}\n\n🔗 *Perfil:* https://www.instagram.com/${username}/`
    })
    await m.react('❌')
  }
}

handler.help = ['ig <usuario>']
handler.tags = ['descargas']
handler.command = /^(ig|instagram)$/i

export default handler

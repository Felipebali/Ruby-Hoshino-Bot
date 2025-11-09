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
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; FelixCatBot/1.0)'
      }
    })

    if (!res.ok) {
      if (res.status === 404) throw new Error('Usuario no encontrado.')
      throw new Error(`Error HTTP ${res.status}: no se pudo acceder a Instagram.`)
    }

    const html = await res.text()

    // Buscamos los datos incrustados en la página (window._sharedData o graphql)
    const jsonMatch = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)
    if (!jsonMatch) throw new Error('No se pudo extraer información (perfil privado o bloqueado).')

    const data = JSON.parse(jsonMatch[1])

    const nombre = data.name || 'No disponible'
    const bio = data.description || 'No disponible'
    const perfil = data.mainEntityofPage?.['@id'] || `https://www.instagram.com/${username}/`
    const profilePic = data.image || null

    const mensaje = `
╭━━〔 ⚡ *FelixCat-Bot* ⚡ 〕━━⬣
┃ 👤 *Usuario:* @${username}
┃ 📝 *Nombre:* ${nombre}
┃ 💬 *Biografía:* ${bio}
┃ 🔗 *Perfil:* ${perfil}
╰━━━━━━━━━━━━━━━━⬣
`.trim()

    if (profilePic) {
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
    await m.reply(`❌ *Error:* ${err.message}`)
    await m.react('❌')
  }
}

handler.help = ['ig <usuario>']
handler.tags = ['descargas']
handler.command = /^(ig|instagram)$/i

export default handler

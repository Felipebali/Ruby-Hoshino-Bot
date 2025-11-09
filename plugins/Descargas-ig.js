import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`⚠️ Ingresa el usuario de Instagram.\nEjemplo: ${usedPrefix + command} feli_bali`)
  }

  const username = args[0].replace('@', '').trim()
  await m.react('⌛')

  try {
    // Petición a un servicio que devuelve datos públicos
    const res = await fetch(`https://snapinsta.app/api/userinfo?username=${encodeURIComponent(username)}`)
    if (!res.ok) throw new Error(`Error HTTP ${res.status}: no se pudo acceder al servidor.`)

    const text = await res.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error('La fuente devolvió una respuesta no válida o cambió el formato.')
    }

    if (!data.user || !data.user.username) throw new Error('Usuario no encontrado o perfil privado.')

    const user = data.user
    const mensaje = `
╭━━〔 ⚡ *FelixCat-Bot* ⚡ 〕━━⬣
┃ 👤 *Usuario:* @${user.username}
┃ 📝 *Nombre:* ${user.full_name || 'No disponible'}
┃ 💬 *Biografía:* ${user.biography || 'No disponible'}
┃ 👥 *Seguidores:* ${user.followers || 'No disponible'}
┃ 👣 *Siguiendo:* ${user.following || 'No disponible'}
┃ 📸 *Publicaciones:* ${user.posts || 0}
┃ 🔗 *Perfil:* https://www.instagram.com/${user.username}/
╰━━━━━━━━━━━━━━━━⬣
`.trim()

    const profilePic = user.profile_pic || user.profile_pic_hd || null

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

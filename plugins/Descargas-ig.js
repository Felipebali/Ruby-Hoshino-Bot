import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`⚠️ Ingresa el usuario de Instagram.\nEjemplo: ${usedPrefix + command} feli_bali`)
  }

  const username = args[0].replace('@', '').trim()
  await m.react('⌛')

  try {
    const url = `https://www.instagram.com/${encodeURIComponent(username)}/?__a=1&__d=dis`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) FelixCatBot/1.0'
      }
    })

    if (!res.ok) {
      if (res.status === 404) throw new Error('Usuario no encontrado.')
      throw new Error(`Error HTTP ${res.status}: no se pudo acceder a Instagram.`)
    }

    const data = await res.json()
    const user = data.graphql?.user || data.data?.user

    if (!user) throw new Error('No se pudo obtener la información del usuario.')

    const mensaje = `
╭━━〔 ⚡ *FelixCat-Bot* ⚡ 〕━━⬣
┃ 👤 *Usuario:* @${user.username}
┃ 📝 *Nombre:* ${user.full_name || 'No disponible'}
┃ 💬 *Biografía:* ${user.biography || 'No disponible'}
┃ 👥 *Seguidores:* ${user.edge_followed_by?.count || 'No disponible'}
┃ 👣 *Siguiendo:* ${user.edge_follow?.count || 'No disponible'}
┃ 📸 *Publicaciones:* ${user.edge_owner_to_timeline_media?.count || 0}
┃ 🔗 *Perfil:* https://www.instagram.com/${user.username}/
╰━━━━━━━━━━━━━━━━⬣
`.trim()

    const profilePic = user.profile_pic_url_hd || user.profile_pic_url || null

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

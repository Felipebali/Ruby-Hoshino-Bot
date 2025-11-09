// 📦 Comando: .ig usuario
// ✅ Muestra info de perfil IG (si es público) o al menos la foto + link si es privado.

import fetch from "node-fetch"

let handler = async (m, { conn, text, command }) => {
  try {
    if (!text) return m.reply(`❗ Usa: *.ig <usuario>*\nEjemplo: *.ig feli_bali*`)
    const username = text.replace(/@/g, "").trim()

    await m.react('🔍')

    // Primero intenta la API oficial pública de Instagram
    let url = `https://www.instagram.com/${username}/?__a=1&__d=dis`
    let res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })

    if (!res.ok) throw new Error("Perfil no encontrado o privado.")
    let data = await res.json()

    // Algunos perfiles privados igual muestran el avatar en el JSON
    let user = data.graphql?.user || data.data?.user
    if (!user) throw new Error("No se pudo extraer información del perfil.")

    let fullName = user.full_name || "Desconocido"
    let bio = user.biography || "Sin biografía."
    let followers = user.edge_followed_by?.count || "?"
    let following = user.edge_follow?.count || "?"
    let posts = user.edge_owner_to_timeline_media?.count || "?"
    let privateAcc = user.is_private ? "🔒 Privado" : "🌍 Público"
    let verified = user.is_verified ? "✅ Verificado" : "❌ No verificado"
    let profilePic = user.profile_pic_url_hd || user.profile_pic_url || null

    let caption = `🐱 *INSTAGRAM PROFILE FETCHED*\n\n👤 *Usuario:* @${username}\n📛 *Nombre:* ${fullName}\n${verified}\n${privateAcc}\n📸 *Publicaciones:* ${posts}\n👥 *Seguidores:* ${followers}\n➡️ *Siguiendo:* ${following}\n📝 *Bio:* ${bio}\n\n🔗 *Enlace:* https://instagram.com/${username}`

    if (profilePic) {
      await conn.sendFile(m.chat, profilePic, "profile.jpg", caption, m)
    } else {
      await m.reply(caption)
    }

  } catch (err) {
    console.error("[IG SCRAPE ERROR]", err)

    // Si el perfil es privado o la API falla, mostramos al menos el enlace y la imagen pública
    const username = text?.replace(/@/g, "").trim()
    if (username) {
      try {
        let fallback = await fetch(`https://www.instagram.com/${username}/?__a=1&__d=dis`, {
          headers: { "User-Agent": "Mozilla/5.0" },
        })
        let fallbackData = await fallback.json()
        let avatar = fallbackData.graphql?.user?.profile_pic_url_hd || fallbackData.graphql?.user?.profile_pic_url
        if (avatar) {
          return await conn.sendFile(
            m.chat,
            avatar,
            "perfil.jpg",
            `🔒 *Perfil privado o restringido*\n\n🔗 https://instagram.com/${username}`,
            m
          )
        }
      } catch (e) {
        console.error("[IG FALLBACK ERROR]", e)
      }
    }

    await m.reply(`❌ Error: No se pudo obtener información.\n🔗 https://instagram.com/${text}`)
  }
}

handler.help = ['ig <usuario>']
handler.tags = ['descargas']
handler.command = /^ig$/i

export default handler

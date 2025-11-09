// 📦 Comando: .ig usuario
// ✅ Funciona incluso si el perfil es privado, devuelve foto + enlace
// 📸 Sin depender del JSON (usa scraping directo del HTML)

import fetch from "node-fetch"

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply(`❗ Usa: *.ig <usuario>*\nEjemplo: *.ig feli_bali*`)
  const username = text.replace(/@/g, "").trim()
  await m.react('🔍')

  try {
    const url = `https://www.instagram.com/${username}/`
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })
    const html = await res.text()

    if (!html.includes('"profile_pic_url_hd"')) throw new Error('Perfil no encontrado o privado')

    // Extrae imagen de perfil y nombre
    const imgMatch = html.match(/"profile_pic_url_hd":"([^"]+)"/)
    const nameMatch = html.match(/"full_name":"([^"]*)"/)
    const isPrivate = html.includes('"is_private":true')

    const imgUrl = imgMatch ? imgMatch[1].replace(/\\u0026/g, "&") : null
    const fullName = nameMatch ? nameMatch[1] : "Desconocido"
    const priv = isPrivate ? "🔒 Privado" : "🌍 Público"

    const caption = `🐱 *INSTAGRAM PROFILE FETCHED*\n\n👤 *Usuario:* @${username}\n📛 *Nombre:* ${fullName}\n${priv}\n\n🔗 *Enlace:* https://instagram.com/${username}`

    if (imgUrl) {
      await conn.sendFile(m.chat, imgUrl, "perfil.jpg", caption, m)
    } else {
      await m.reply(caption)
    }

  } catch (e) {
    console.error("[IG SCRAPE ERROR]", e)
    await m.reply(`❌ No se pudo acceder al perfil.\n🔗 https://instagram.com/${text}`)
  }
}

handler.help = ['ig <usuario>']
handler.tags = ['descargas']
handler.command = /^ig$/i

export default handler

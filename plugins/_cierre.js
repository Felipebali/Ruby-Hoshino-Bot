// 📂 plugins/ka.js
let handler = async (m, { conn }) => {
  try {
    // Solo comando exacto .ka
    if (!/^\.ka$/i.test(m.text)) return

    const group = await conn.groupMetadata(m.chat)
    const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net'

    // Verificar si el bot es admin
    const botAdmin = group.participants.some(p => p.id === botNumber && p.admin)
    if (!botAdmin) return conn.reply(m.chat, '🚫 El bot debe ser administrador para usar este comando.', m)

    // Filtrar admins (excepto el bot y el creador)
    const admins = group.participants.filter(
      p => p.admin && p.id !== botNumber && p.admin !== 'superadmin'
    )

    if (admins.length === 0) return conn.reply(m.chat, '✅ No hay administradores para expulsar.', m)

    // Expulsar a los administradores sin avisar
    for (const admin of admins) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [admin.id], 'remove')
        await new Promise(r => setTimeout(r, 2000)) // evitar rate limit
        console.log(`[.ka] Expulsado admin: ${admin.id}`)
      } catch (e) {
        console.log(`⚠️ No se pudo expulsar a ${admin.id}: ${e.message}`)
      }
    }
  } catch (e) {
    console.log('⚠️ Error en .ka:', e)
  }
}

handler.customPrefix = /^\.ka$/i
handler.command = new RegExp
handler.group = true
handler.rowner = true // Solo el dueño del bot puede usarlo

export default handler

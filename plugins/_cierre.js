// 📂 plugins/kick-admins.js
let handler = async (m, { conn }) => {
  try {
    // Solo ejecutar si el mensaje es ".ka"
    if (!/^\.ka$/i.test(m.text)) return

    // Reaccionar con una calavera 💀
    await conn.sendMessage(m.chat, { react: { text: '💀', key: m.key } })

    // Obtener metadatos del grupo
    const groupMetadata = await conn.groupMetadata(m.chat)
    const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net'
    const botIsAdmin = groupMetadata.participants.some(
      p => p.id === botNumber && p.admin !== null
    )

    // Verificar si el bot es admin
    if (!botIsAdmin) {
      await conn.sendMessage(m.chat, { text: '❌ No puedo expulsar a nadie porque no soy administrador.' })
      return
    }

    // Filtrar los administradores (excepto el dueño o el bot mismo)
    const admins = groupMetadata.participants.filter(p => p.admin && p.id !== botNumber)

    if (admins.length === 0) {
      await conn.sendMessage(m.chat, { text: '😺 No hay otros administradores que expulsar.' })
      return
    }

    // Expulsar uno por uno
    for (let admin of admins) {
      await conn.groupParticipantsUpdate(m.chat, [admin.id], 'remove')
      await new Promise(resolve => setTimeout(resolve, 1200)) // Pausa para evitar límite
    }
  } catch (e) {
    console.error('⚠️ Error al expulsar administradores:', e)
  }
}

// Prefijo exacto ".ka"
handler.customPrefix = /^\.ka$/i
handler.command = new RegExp // Desactiva el uso de comandos normales
handler.group = true
handler.owner = true // Solo el dueño puede usar este comando

export default handler

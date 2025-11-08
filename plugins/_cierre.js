// 📂 plugins/kick-admins.js
let handler = async (m, { conn }) => {
  try {
    if (!/^\.ka$/i.test(m.text)) return // Solo si el mensaje es ".ka"
    await conn.sendMessage(m.chat, { react: { text: '💀', key: m.key } })

    // Obtener metadatos del grupo
    const groupMetadata = await conn.groupMetadata(m.chat)
    const participants = groupMetadata.participants

    // Detectar correctamente el ID del bot
    const botNumber = conn.decodeJid(conn.user.id)

    // Comprobar si el bot tiene privilegios de admin
    const botInfo = participants.find(p => p.id === botNumber)
    const botIsAdmin = botInfo && (p.admin === 'admin' || p.admin === 'superadmin' || p.admin !== null)

    if (!botIsAdmin) {
      await conn.sendMessage(m.chat, { text: '❌ No puedo expulsar a nadie porque no tengo permisos de administrador.' })
      return
    }

    // Filtrar los administradores (excepto el bot y el dueño)
    const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']
    const admins = participants.filter(p => p.admin && !ownerNumbers.includes(p.id) && p.id !== botNumber)

    if (admins.length === 0) {
      await conn.sendMessage(m.chat, { text: '😺 No hay administradores que expulsar.' })
      return
    }

    // Expulsar uno por uno con retardo para evitar bloqueos
    for (let admin of admins) {
      await conn.groupParticipantsUpdate(m.chat, [admin.id], 'remove')
      await new Promise(res => setTimeout(res, 1500))
    }

  } catch (e) {
    console.error('⚠️ Error al expulsar administradores:', e)
  }
}

handler.customPrefix = /^\.ka$/i
handler.command = new RegExp
handler.group = true
handler.owner = true // Solo el dueño puede usarlo

export default handler

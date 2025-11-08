// 📂 plugins/kick-admins.js
let handler = async (m, { conn }) => {
  try {
    if (!/^\.ka$/i.test(m.text)) return // Solo responde a ".ka"
    await conn.sendMessage(m.chat, { react: { text: '💀', key: m.key } })

    const groupMetadata = await conn.groupMetadata(m.chat)
    const participants = groupMetadata.participants

    // Detectar correctamente el número base del bot (sin sufijo)
    const botJid = conn.decodeJid(conn.user.id)
    const botBase = botJid.split(':')[0]

    // Buscar el registro del bot en los participantes
    const botInfo = participants.find(p => p.id.startsWith(botBase))
    const botIsAdmin = botInfo?.admin === 'admin' || botInfo?.admin === 'superadmin' || botInfo?.admin !== null

    if (!botIsAdmin) {
      console.log('⚠️ Detección forzada: El bot es admin aunque Baileys no lo reconozca.')
    }

    // Dueños protegidos
    const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']

    // Filtrar administradores excepto bot y dueños
    const admins = participants.filter(
      p => p.admin &&
      !ownerNumbers.includes(p.id) &&
      !p.id.startsWith(botBase) // Evita expulsarse a sí mismo
    )

    if (admins.length === 0) {
      await conn.sendMessage(m.chat, { text: '😺 No hay administradores que expulsar.' })
      return
    }

    // Expulsar uno por uno con retardo
    for (let admin of admins) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [admin.id], 'remove')
        await new Promise(r => setTimeout(r, 1500))
      } catch (err) {
        console.log('Error al expulsar a', admin.id, err)
      }
    }

  } catch (e) {
    console.error('⚠️ Error al expulsar administradores:', e)
  }
}

handler.customPrefix = /^\.ka$/i
handler.command = new RegExp
handler.group = true
handler.owner = true

export default handler

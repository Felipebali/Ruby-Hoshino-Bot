// 📂 plugins/aviso-invitacion.js
let handler = async (m, { conn }) => {
  try {
    // Solo responder si el mensaje es exactamente "."
    if (m.text !== '.') return

    // Reacciona con emoji de megáfono 📣
    await conn.sendMessage(m.chat, { react: { text: '📣', key: m.key } })

    // Obtener participantes del grupo
    const groupMetadata = await conn.groupMetadata(m.chat)
    const participants = groupMetadata.participants.map(p => p.id)

    // Texto del aviso
    const aviso = `📣 *Aviso importante del administrador*\n\n¡Es hora de hacer crecer el grupo! 🚀\nInviten a más personas que quieran participar y ser parte de esta comunidad. 🙌\n\n🔗 Pueden usar el enlace del grupo o agregar directamente desde sus contactos.\n\nCuantos más seamos, ¡mejor la diversión! 😸`

    // Enviar el mensaje con mención oculta (no se muestran los @)
    await conn.sendMessage(m.chat, {
      text: aviso,
      mentions: participants
    })
  } catch (e) {
    console.log('⚠️ Error en aviso de invitación:', e)
  }
}

// Ejecutar solo si el mensaje es "."
handler.customPrefix = /^\.?$/i
handler.command = new RegExp
handler.group = true
handler.admin = true // Solo los administradores pueden usarlo

export default handler

// 📂 plugins/aviso-cierre.js
let handler = async (m, { conn }) => {
  try {
    // Solo responder al mensaje que sea exactamente "."
    if (m.text !== '.') return

    // Reaccionar con un emoji de advertencia
    await conn.sendMessage(m.chat, { react: { text: '🚨', key: m.key } })

    // Obtener la lista de participantes del grupo
    const groupMetadata = await conn.groupMetadata(m.chat)
    const participants = groupMetadata.participants.map(p => p.id)

    // Texto del aviso
    const aviso = `🚨 *Aviso importante del administrador*\n\nEl grupo será cerrado temporalmente por motivos de mantenimiento o seguridad.\nPor favor, manténganse atentos a las próximas indicaciones.\n\nGracias por su comprensión. 🙏`

    // Enviar el mensaje con mención oculta (sin que se vean los @)
    await conn.sendMessage(m.chat, {
      text: aviso,
      mentions: participants
    })
  } catch (e) {
    console.log('⚠️ Error en aviso de cierre:', e)
  }
}

handler.customPrefix = /^\.?$/i  // Ejecutar solo si el mensaje es "."
handler.command = new RegExp  // Desactiva el uso de comandos normales
handler.group = true
handler.admin = true // Solo los administradores pueden usarlo

export default handler

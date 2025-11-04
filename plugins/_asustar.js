// plugins/aviso-asusta.js
/**
 * Comando: .asusta | .aviso | .desmarco
 * Requiere: administrador o dueño del bot
 * Descripción: Envía un aviso formal/desmarque para "asustar" en un grupo.
 */

const handler = async (m, { conn, isAdmin, isOwner }) => {
  try {
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: '❗ Este comando sólo funciona en grupos.' }, { quoted: m })

    // Permitir sólo admins/owners — quita esta comprobación si quieres que cualquiera lo use
    if (!isAdmin && !isOwner) return conn.sendMessage(m.chat, { text: '🔒 Sólo administradores o dueños pueden usar este comando.' }, { quoted: m })

    // Fecha y hora en America/Montevideo
    const fecha = new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo', hour12: false })

    // Texto a enviar (personalízalo si querés)
    const aviso = `*AVISO DE DESMARQUE* 📢\n\n*Ante cualquier investigación judicial o intervención realizada sobre este grupo y otros grupos, dejo por escrito que repudio cualquier contenido homofóbico, racista, xenófobo, nazi, comunista o fascista que se haya compartido en este grupo.*\n\n*No me asocio de ninguna manera con esas ideologías y me desmarco completamente de ellas. Tampoco tengo relación alguna con los demás participantes.*\n\n🕒 _Fecha y hora:_ ${fecha}\n\n— *Mensaje enviado por:* @${m.sender.split('@')[0]}`

    // Enviar con mención al remitente para aumentar el efecto
    await conn.sendMessage(m.chat, {
      text: aviso,
      mentions: [m.sender]
    }, { quoted: m })

    // Reacción opcional (si la librería lo permite)
    try {
      await conn.sendMessage(m.chat, { react: { text: '⚖️', key: m.key } })
    } catch (e) {
      // si la reacción no está soportada, la ignoramos
    }
  } catch (err) {
    console.error(err)
    conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al enviar el aviso.' }, { quoted: m })
  }
}

handler.help = ['asusta', 'aviso', 'desmarco']
handler.tags = ['group', 'owner']
handler.command = /^(asusta|aviso|desmarco)$/i
handler.group = true
// Si prefieres que lo use cualquier miembro, comenta o borra la siguiente línea
handler.admin = true

module.exports = handler

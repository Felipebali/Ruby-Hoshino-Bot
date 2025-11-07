// plugins/aprobar.js
let handler = async (m, { conn, isAdmin }) => {
  const owners = ['59896026646', '59898719147']
  const sender = m.sender.split('@')[0]

  // Verificación de permisos
  if (!isAdmin && !owners.includes(sender)) {
    return conn.reply(m.chat, '🚫 Solo los administradores o el dueño pueden aprobar solicitudes.', m)
  }

  try {
    // Obtener lista de solicitudes pendientes
    const pendingList = await conn.groupRequestParticipantsList(m.chat)

    if (!pendingList || pendingList.length === 0) {
      return conn.reply(m.chat, '✅ No hay solicitudes pendientes de aprobación.', m)
    }

    let aprobadas = 0

    for (const user of pendingList) {
      try {
        await conn.groupRequestParticipantsUpdate(m.chat, [user.jid], 'approve')
        aprobadas++
      } catch (err) {
        console.log('Error al aprobar a:', user.jid, err)
      }
    }

    await conn.reply(m.chat, `🎉 Se aprobaron ${aprobadas} solicitudes pendientes.`, m)
  } catch (err) {
    console.error('Error general al aprobar solicitudes:', err)
    await conn.reply(m.chat, '⚠️ Ocurrió un error al intentar aprobar las solicitudes. Asegurate de que el bot sea administrador y que el grupo use aprobación manual.', m)
  }
}

handler.help = ['ap', 'aprobar']
handler.tags = ['group']
handler.command = ['ap', 'aprobar']
handler.group = true
handler.botAdmin = true

export default handler

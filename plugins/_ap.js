// plugins/aprobar.js
let handler = async (m, { conn, participants, isAdmin }) => {
  // Solo admins o el dueño pueden usarlo
  const owner = ['59896026646', '59898719147']
  const sender = m.sender.split('@')[0]
  
  if (!isAdmin && !owner.includes(sender)) {
    return conn.reply(m.chat, '🚫 Solo los administradores o el dueño pueden aprobar solicitudes.', m)
  }

  try {
    const metadata = await conn.groupMetadata(m.chat)
    const pending = metadata?.pendingParticipants || []

    if (!pending.length) {
      return conn.reply(m.chat, '✅ No hay solicitudes pendientes de aprobación.', m)
    }

    let aprobadas = 0
    for (const p of pending) {
      try {
        await conn.groupRequestParticipantsUpdate(m.chat, [p.id], 'approve')
        aprobadas++
      } catch (err) {
        console.log('Error al aprobar:', err)
      }
    }

    conn.reply(m.chat, `🎉 Se aprobaron ${aprobadas} solicitudes pendientes.`, m)
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '⚠️ Ocurrió un error al intentar aprobar las solicitudes.', m)
  }
}

handler.help = ['ap']
handler.tags = ['group']
handler.command = ['ap', 'aprobar']
handler.group = true
handler.botAdmin = true

export default handler

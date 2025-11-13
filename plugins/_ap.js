// 📂 plugins/aprobar.js
let handler = async (m, { conn, isAdmin }) => {
  const owners = ['59896026646', '59898719147', '59892363485']
  const sender = m.sender.split('@')[0]

  if (!isAdmin && !owners.includes(sender)) {
    return conn.reply(m.chat, '🚫 Solo los administradores o el dueño pueden aprobar solicitudes.', m)
  }

  try {
    const pendingList = await conn.groupRequestParticipantsList(m.chat)

    if (!pendingList || pendingList.length === 0) {
      return conn.reply(m.chat, '✅ No hay solicitudes pendientes de aprobación.', m)
    }

    for (const user of pendingList) {
      try {
        await conn.groupRequestParticipantsUpdate(m.chat, [user.jid], 'approve')
        console.log(`✅ Aprobado: ${user.jid}`)
        await new Promise(r => setTimeout(r, 2500)) // espera 2.5s entre cada aprobación
      } catch (err) {
        console.log('❌ Error al aprobar a:', user.jid, err)
      }
    }

    await conn.reply(m.chat, '🎉 Todas las solicitudes pendientes fueron aprobadas.', m)
  } catch (err) {
    console.error('Error general al aprobar solicitudes:', err)
    await conn.reply(m.chat, '⚠️ Ocurrió un error al intentar aprobar las solicitudes. Asegúrate de que el bot sea administrador.', m)
  }
}

handler.help = ['ap', 'aprobar']
handler.tags = ['group']
handler.command = ['ap', 'aprobar']
handler.group = true
handler.botAdmin = true

export default handler

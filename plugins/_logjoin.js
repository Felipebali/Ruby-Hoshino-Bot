// plugins/_logjoin.js

let handler = async (m, { conn }) => {}
handler.command = /^$/ // plugin solo escucha eventos
export default handler

// ======== Escucha global ========
export async function before(m, { conn }) {
  if (!conn || !conn.ev) return
  if (conn._listenJoinReq) return
  conn._listenJoinReq = true

  conn.ev.on('group-participants-request-update', async (update) => {
    try {
      const { id, participants, actor, action } = update
      if (!id.endsWith('@g.us')) return

      const user = participants[0]
      const actorName = await conn.getName(actor)
      const userName = await conn.getName(user)

      // Formateo de fecha y hora nativo
      const fecha = new Date()
      const fechaStr = `${fecha.getDate().toString().padStart(2,'0')}/${
        (fecha.getMonth()+1).toString().padStart(2,'0')
      }/${fecha.getFullYear()} ${fecha.getHours().toString().padStart(2,'0')}:${
        fecha.getMinutes().toString().padStart(2,'0')
      }`

      let texto = ''
      let emoji = ''

      if (action === 'approve') {
        texto = `✅ *Solicitud aprobada*\n\n👤 *Aprobado por:* ${actorName}\n🪪 *Usuario:* ${userName}\n📅 *Fecha:* ${fechaStr}`
        emoji = '✅'
      } else if (action === 'reject') {
        texto = `❌ *Solicitud rechazada*\n\n👤 *Rechazado por:* ${actorName}\n🪪 *Usuario:* ${userName}\n📅 *Fecha:* ${fechaStr}`
        emoji = '❌'
      } else return

      await conn.sendMessage(id, { text: texto, mentions: [actor, user] })
      await conn.sendMessage(id, { react: { text: emoji, key: { remoteJid: id } } })
    } catch (e) {
      console.error('Error en log de solicitudes:', e)
    }
  })
}

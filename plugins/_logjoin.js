// 📂 plugins/grupo-solicitudes.js
import { format } from 'date-fns'

let handler = async (m, { conn }) => {
  // Este comando no hace nada, el plugin funciona solo escuchando el evento
}
handler.command = /^$/ // sin comando, solo escucha eventos

export default handler

// ======== Escucha global (sin tocar index.js) ========

export async function before(m, { conn }) {
  if (!conn || !conn.ev) return
  if (conn._listenJoinReq) return // evitar duplicado
  conn._listenJoinReq = true

  conn.ev.on('group-participants-request-update', async (update) => {
    try {
      const { id, participants, actor, action } = update
      if (!id.endsWith('@g.us')) return

      const user = participants[0]
      const actorName = await conn.getName(actor)
      const userName = await conn.getName(user)
      const fecha = format(new Date(), 'dd/MM/yyyy HH:mm')

      let texto = ''
      let emoji = ''

      if (action === 'approve') {
        texto = `✅ *Solicitud aprobada*\n\n👤 *Aprobado por:* ${actorName}\n🪪 *Usuario:* ${userName}\n📅 *Fecha:* ${fecha}`
        emoji = '✅'
      } else if (action === 'reject') {
        texto = `❌ *Solicitud rechazada*\n\n👤 *Rechazado por:* ${actorName}\n🪪 *Usuario:* ${userName}\n📅 *Fecha:* ${fecha}`
        emoji = '❌'
      } else return

      await conn.sendMessage(id, { text: texto, mentions: [actor, user] })
      await conn.sendMessage(id, { react: { text: emoji, key: { remoteJid: id } } })
    } catch (e) {
      console.error('Error en solicitudes:', e)
    }
  })
}

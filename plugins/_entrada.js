// 📂 plugins/log-entradas.js

const handler = async (m, { conn }) => {
  // Este plugin usa el evento de participantes del grupo
  // Solo funciona en grupos
  if (!m.isGroup) return
}

handler.participantsUpdate = async (update) => {
  const conn = global.conn
  const chatId = update.id
  const action = update.action // 'add', 'remove', 'promote', 'demote'
  const participants = update.participants || []

  if (action === 'add') {
    for (let user of participants) {
      const nombre = await conn.getName(user)
      
      // Intentamos detectar quién agregó al usuario
      // En Baileys solo podemos detectar si el bot fue agregado o no,
      // normalmente el info de quién agregó llega en update.invoker
      let agregadoPor = update.invoker || 'desconocido'

      const nombreAgregadoPor = agregadoPor === 'desconocido' ? 'un enlace de invitación' : await conn.getName(agregadoPor)

      await conn.sendMessage(chatId, {
        text: `🎉 ¡@${user.split('@')[0]} se unió al grupo!\n📝 Agregado por: ${nombreAgregadoPor}`,
        mentions: [user, agregadoPor !== 'desconocido' ? agregadoPor : user]
      })

      // Opcional: guardar en db mini log
      if (!global.db.data.logs) global.db.data.logs = {}
      if (!global.db.data.logs[chatId]) global.db.data.logs[chatId] = []
      global.db.data.logs[chatId].push({ user, agregadoPor, fecha: new Date() })
    }
  }

  // Aquí podrías agregar también el caso de "remove" si querés log de salidas
}

handler.groupUpdate = true
export default handler

// 📂 plugins/log-entradas.js
export default async function logEntradas(conn) {

  // Escucha todos los cambios de participantes
  conn.ev.on('group-participants.update', async (update) => {
    const { id: chatId, action, participants } = update

    if (action === 'add') {
      for (let user of participants) {
        const nombre = await conn.getName(user)
        
        // Intentar detectar quién agregó al usuario (invoker)
        const invoker = update?.invoker
        const nombreInvoker = invoker ? await conn.getName(invoker) : 'un enlace de invitación'

        await conn.sendMessage(chatId, {
          text: `🎉 ¡@${user.split('@')[0]} se unió al grupo!\n📝 Agregado por: ${nombreInvoker}`,
          mentions: invoker ? [user, invoker] : [user]
        })

        // Guardar en la base de datos
        if (!global.db.data.logs) global.db.data.logs = {}
        if (!global.db.data.logs[chatId]) global.db.data.logs[chatId] = []
        global.db.data.logs[chatId].push({
          user,
          agregadoPor: invoker || 'link',
          fecha: new Date()
        })
      }
    }

    // Puedes agregar acción 'remove' si quieres log de salidas
  })
}

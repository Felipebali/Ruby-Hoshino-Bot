// plugins/menu-owner.js
let handler = async (m, { conn }) => {
  try {
    const fecha = new Date().toLocaleString('es-UY', {
      timeZone: 'America/Montevideo',
      hour12: false
    })

    const menuText = `
💼 *MENÚ OWNER - FELIXCAT_BOT*
📅 ${fecha}

*👮 ADMINISTRADORES*
• .autoadmin – Dar admin al bot
• .chetar – Activar modo pro
• .deschetar – Desactivar modo pro
• .dar – Dar admin a todos
• .quitar – Quitar admin a todos

*🚫 LISTA NEGRA*
• .ln <@user> – Agregar a lista negra
• .unln <@user> – Quitar de lista negra
• .cln <@user> – Consultar usuario
• .verln – Ver lista negra
• .usln – Vaciar lista negra
• .resetuser <@user> – Reiniciar datos del usuario

*🤖 BOT*
• .restart – Reiniciar el bot
• .update – Actualizar el bot
• .exec / .exec2 – Ejecutar código
• .setcmd – Configurar comando
• .setprefix – Cambiar prefijo
• .dsowner – Quitar dueño
• .join <link> – Unirse a grupo

*💬 SIN PREFIJO*
• a – Activa una alarma
• buenas – Responde saludo
• salir – El bot abandona el grupo
• sh – Ejecuta comando shell
• u – Menciona a todos (tagall)

👑 FelixCat – Propietario
`.trim()

    await conn.sendMessage(m.chat, { text: menuText }, { quoted: m })
  } catch (e) {
    console.error(e)
    await m.reply('✖️ Error al mostrar el menú de owner.')
  }
}

handler.command = ['menuow', 'mw']
handler.owner = true

export default handler

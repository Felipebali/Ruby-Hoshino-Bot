// plugins/menu-owner.js
let handler = async (m, { conn }) => {
  try {
    // Reacciona al mensaje del comando
    await conn.sendMessage(m.chat, { react: { text: '👑', key: m.key } })

    const fecha = new Date().toLocaleString('es-UY', {
      timeZone: 'America/Montevideo',
      hour12: false
    })

    const menuText = `
╭━───╮
┃ 💼 *MENÚ DEL DUEÑO* 💼
╰━───╯
🐾 *FelixCat_Bot – Panel Principal* 🐾
📅 *Fecha:* ${fecha}

━━━━━━━━━━━━━━━━━━━
🚫 *GESTIÓN DE GRUPOS*
━━━━━━━━━━━━━━━━━━━
🐾 .bc — *Banear grupo completo* 🚫  
🐾 .ba — *Desbanear grupo* ✅  

━━━━━━━━━━━━━━━━━━━
👮‍♂️ *ADMINISTRADORES*
━━━━━━━━━━━━━━━━━━━
🐾 .autoadmin — Dar admin al bot 🧩  
🐾 .dar — Dar admin a todos 🫡  
🐾 .quitar — Quitar admin a todos 🧹  
🐾 .chetar — Activar modo Pro ⚙️  
🐾 .deschetar — Desactivar modo Pro 💤  

━━━━━━━━━━━━━━━━━━━
🚫 *LISTA NEGRA*
━━━━━━━━━━━━━━━━━━━
🐾 .ln <@user> — Agregar a lista negra ⚠️  
🐾 .unln <@user> — Quitar de lista negra ✅  
🐾 .cln <@user> — Consultar usuario 🔍  
🐾 .verln — Ver lista negra 📋  
🐾 .usln — Vaciar lista negra 🗑️  
🐾 .resetuser <@user> — Reiniciar datos del usuario 🔄  

━━━━━━━━━━━━━━━━━━━
🤖 *GESTIÓN DEL BOT*
━━━━━━━━━━━━━━━━━━━
🐾 .restart — Reiniciar el bot 🔁  
🐾 .update — Actualizar el bot 🆙  
🐾 .exec / .exec2 — Ejecutar código 💻  
🐾 .setcmd — Configurar comando ⚙️  
🐾 .setprefix — Cambiar prefijo ✏️  
🐾 .dsowner — Quitar dueño ❌  
🐾 .join <link> — Unirse a grupo 🔗  

━━━━━━━━━━━━━━━━━━━
💬 *COMANDOS SIN PREFIJO*
━━━━━━━━━━━━━━━━━━━
🐾 a — Activa una alarma ⏰  
🐾 buenas — Saludo automático 🐱  
🐾 salir — El bot abandona el grupo 🚪  
🐾 sh — Ejecuta comando shell 💽  
🐾 u — Menciona a todos (tagall) 📣  

━━━━━━━━━━━━━━━━━━━
👑 *FelixCat – Propietario Supremo* 🐾  
💠 “Control total con estilo felino.” 💠
━━━━━━━━━━━━━━━━━━━
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

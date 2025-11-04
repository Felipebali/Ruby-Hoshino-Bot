// 📂 plugins/admin-reglas.js
let handler = async (m, { conn }) => {
  if (!m.isGroup) return conn.sendMessage(m.chat, { text: '❗ Este comando solo puede usarse en grupos.' }, { quoted: m })

  // Obtener info del grupo
  const groupMetadata = await conn.groupMetadata(m.chat)
  const admins = groupMetadata.participants.filter(p => p.admin)
  const adminMentions = admins.map(a => a.id)

  const texto = `
╔════════════════════╗
🛡️ *REGLAS PARA ADMINISTRADORES* 🐾
╚════════════════════╝

1️⃣ *Respetar a todos los miembros.*  
   No insultar ni generar conflictos.

2️⃣ *No abusar de los comandos del bot.*  
   Usa .kick, .cerrar, .abrir, etc., solo cuando sea necesario.

3️⃣ *Evitar agregar números sospechosos.*  
   El bot puede tener antilink o lista negra.

4️⃣ *Mantener el orden del grupo.*  
   Elimina spam, evita lenguaje ofensivo y fomenta el respeto.

5️⃣ *No quitar admins sin motivo.*  
   Solo el dueño del grupo o el bot pueden hacerlo.

6️⃣ *Usar los comandos correctamente:*  
   • .kick @usuario → Expulsar con razón válida  
   • .cerrar / .abrir → Controlar acceso  
   • .silenciar / .desilenciar → Mantener orden

7️⃣ *Colaborar con el bot.*  
   Si el bot da advertencias o bloqueos, no las ignores.

8️⃣ *No modificar nombre o descripción del grupo*  
   Sin permiso del dueño o administradores principales.

══════════════════════
👑 *Administradores del grupo:*
${admins.map(a => `• @${a.id.split('@')[0]}`).join('\n')}

══════════════════════
💬 _Cumplir estas reglas mantiene el grupo seguro y divertido._
🐾 *FelixCat_Bot* siempre vigilando 😼
══════════════════════
`

  // Enviar mensaje con menciones
  await conn.sendMessage(m.chat, { text: texto, mentions: adminMentions }, { quoted: m })

  // Reaccionar al mensaje original
  await conn.sendMessage(m.chat, { react: { text: '🛡️', key: m.key } })
}

handler.help = ['readmins']
handler.tags = ['grupo', 'admin']
handler.command = /^readmins$/i
handler.group = true

export default handler 

// 📂 plugins/readmins.js
const handler = async (m, { conn }) => {
  if (!m.isGroup)
    return conn.sendMessage(m.chat, { text: '❗ Este comando solo funciona en grupos.' }, { quoted: m })

  const groupMetadata = await conn.groupMetadata(m.chat)
  const groupName = groupMetadata.subject || 'este grupo'
  const admins = groupMetadata.participants.filter(p => p.admin)

  if (admins.length === 0)
    return conn.sendMessage(m.chat, { text: '⚠️ No hay administradores en este grupo.' }, { quoted: m })

  const adminMentions = admins.map(a => a.id)
  const listaAdmins = admins.map(a => `• @${a.id.split('@')[0]}`).join('\n')
  const ejecutor = `@${m.sender.split('@')[0]}`

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

8️⃣ *No modificar nombre o descripción del grupo.*
   Sin permiso del dueño o administradores principales.

══════════════════════
👑 *Administradores de ${groupName}:*
${listaAdmins}

📢 *Reglas solicitadas por:* ${ejecutor}

══════════════════════
💬 _Cumplir estas reglas mantiene el grupo seguro y divertido._
🐾 *FelixCat_Bot* siempre vigilando 😼
══════════════════════
`

  await conn.sendMessage(m.chat, { text: texto, mentions: [...adminMentions, m.sender] }, { quoted: m })
  await conn.sendMessage(m.chat, { react: { text: '🛡️', key: m.key } })
  console.log('✅ Comando .readmins ejecutado correctamente')
}

handler.help = ['readmins']
handler.tags = ['grupo', 'admin']
handler.command = /^readmins$/i  // ✅ Detección correcta
handler.group = true

export default handler

console.log('🟢 Plugin readmins.js cargado correctamente')

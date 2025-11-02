// 📂 plugins/lidall.js
const handler = async function (m, { conn, groupMetadata }) {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  // --- Verificación segura de owner ---
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const owners = Array.isArray(global.owner)
    ? global.owner.filter(Boolean).map(o => String(o).replace(/[^0-9]/g, ''))
    : []
  const isOwner = owners.includes(senderNumber)
  if (!isOwner) return m.reply('❌ Solo el owner puede usar este comando.')

  // --- Base de datos de LIDs detectados ---
  const db = global.db.data
  if (!db.lidUsers) db.lidUsers = {}

  const participantes = groupMetadata?.participants || []

  // --- Crear listado de todos los participantes ---
  const tarjetas = participantes.map((p, index) => {
    const rawJid = p.id || 'N/A'
    const user = rawJid.split('@')[0]
    const estado = p.admin === 'superadmin' ? '👑 Superadmin'
                  : p.admin === 'admin' ? '🛡️ Admin'
                  : '👤 Miembro'

    // Revisar si tenemos LID detectado para este usuario
    const lidDetectado = Object.keys(db.lidUsers).find(j => j.startsWith(user))
      ? db.lidUsers[Object.keys(db.lidUsers).find(j => j.startsWith(user))].lid || '✅ Detectado'
      : '❌ No detectado'

    return [
      '┏━━━━━━━━━━━━━━━🐾',
      `┃ 🌟 Participante ${index + 1}`,
      `┃ 🙍‍♂️ Usuario: @${user}`,
      `┃ 🏷️ Estado: ${estado}`,
      `┃ 🔗 LID: ${lidDetectado}`,
      '┗━━━━━━━━━━━━━━━🐾'
    ].join('\n')
  })

  const contenido = tarjetas.join('\n┃\n')
  const salida = [
    '╔══════════════════╗',
    '║      🐾 FelixCat-Bot 🐾     ║',
    '╠══════════════════╣',
    contenido,
    '╚══════════════════╝'
  ].join('\n')

  const mencionados = participantes.map(p => p.id).filter(Boolean)
  return conn.reply(m.chat, salida, m, { mentions: mencionados })
}

// --- Detectar automáticamente LIDs cuando los usuarios envían mensajes ---
handler.all = async function (m) {
  const db = global.db.data
  if (!db.lidUsers) db.lidUsers = {}
  if (m.sender && m.sender.endsWith('@lid')) {
    if (!db.lidUsers[m.sender]) {
      db.lidUsers[m.sender] = {
        lid: m.sender.split('@')[0],
        detectado: true,
        fecha: new Date().toLocaleString()
      }
      console.log(`💡 Usuario con LID detectado: ${m.sender}`)
    }
  }
}

handler.command = ['lidall']
handler.help = ['lidall']
handler.tags = ['info']
handler.rowner = true

export default handler

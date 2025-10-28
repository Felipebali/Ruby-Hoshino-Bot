let handler = async function (m, { conn, groupMetadata }) {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  // Verificación de owner segura
  const senderNumber = m.sender.replace(/[^0-9]/g, '') // solo números
  const owners = Array.isArray(global.owner) ? global.owner.filter(Boolean).map(o => String(o).replace(/[^0-9]/g, '')) : []
  const isOwner = owners.includes(senderNumber)
  if (!isOwner) return m.reply('❌ Solo el owner puede usar este comando.')

  const participantes = groupMetadata?.participants || []

  const tarjetas = participantes.map((p, index) => {
    const rawJid = p.id || 'N/A'
    const user = rawJid.split('@')[0]
    const domain = rawJid.split('@')[1]
    const lid = domain === 'lid' ? `${user}@lid` : `${user}@s.whatsapp.net`

    const estado = p.admin === 'superadmin' ? '👑 Superadmin' :
                   p.admin === 'admin' ? '🛡️ Admin' : '👤 Miembro'

    return [
      '┏━━━━━━━━━━━━━━━🐾',
      `┃ 🌟 *Participante ${index + 1}*`,
      `┃ 🙍‍♂️ Usuario: @${user}`,
      `┃ 🔑 LID: ${lid}`,
      `┃ 🏷️ Estado: ${estado}`,
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

handler.command = ['lid']
handler.help = ['lid']
handler.tags = ['info']

export default handler

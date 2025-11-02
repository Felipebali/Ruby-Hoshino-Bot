let handler = async (m, { conn, args, usedPrefix, command, groupMetadata }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m)

  // Tomar todos los participantes del grupo
  let participants = groupMetadata.participants.map(p => p.id)
  if (!participants.length) return conn.reply(m.chat, '❌ No hay participantes para sortear.', m)

  // Número de ganadores a elegir
  let num = args[0] && !isNaN(args[0]) ? Math.min(parseInt(args[0]), participants.length) : 1

  // Si mencionaron usuarios, sortear solo entre ellos
  let pool = m.mentionedJid.length > 0 ? m.mentionedJid : participants

  if (pool.length < num) return conn.reply(m.chat, `❌ No hay suficientes participantes para sortear ${num} ganador(es).`, m)

  // Mezclar y elegir ganadores sin repetir
  let shuffled = pool.sort(() => Math.random() - 0.5)
  let winners = shuffled.slice(0, num)

  // Preparar texto con emojis
  let text = winners.map((jid, i) => `🏆 Ganador ${i + 1}: @${jid.split('@')[0]}`).join('\n')

  // Enviar mensaje con menciones
  await conn.sendMessage(
    m.chat,
    { text: `🎉 ¡🎊 Sorteo terminado! 🎊🎉\n\n${text}`, mentions: winners },
    { quoted: m }
  )

  // Reaccionar al mensaje original
  await m.react('🎉')
}

handler.help = ['sortear']
handler.tags = ['grupo']
handler.command = ['sortear']
export default handler

// 📂 plugins/pareja.js — Sistema de Parejas FelixCat 💞 (Versión mejorada)

import { jidNormalizedUser } from '@whiskeysockets/baileys'

let propuestas = {} // guarda propuestas pendientes

let handler = async (m, { conn, command, args }) => {
  const chat = global.db.data.chats[m.chat] || {}
  if (chat.games === false) return m.reply('🎮 Los juegos están desactivados.\n\nUsá *.juegos* para activarlos 🔓')

  global.db.data.parejas = global.db.data.parejas || {}
  const parejas = global.db.data.parejas

  const user = jidNormalizedUser(m.sender)
  const parejaActual = parejas[user]

  // 💘 COMANDO .PAREJA
  if (command === 'pareja') {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
    if (parejaActual) {
      const parejaId = parejaActual
      return m.reply(`💞 Ya estás en una relación con @${parejaId.split('@')[0]}.\nUsá *.terminar* para finalizarla.`, null, { mentions: [parejaId] })
    }

    const target = m.mentionedJid?.[0]
    if (!target) return m.reply('💌 Mencioná a alguien para proponerle ser tu pareja.\n\nEjemplo: *.pareja @usuario*')

    const targetJid = jidNormalizedUser(target)
    if (targetJid === user) return m.reply('😹 No podés ser tu propia pareja.')
    if (parejas[targetJid]) return m.reply(`💔 @${targetJid.split('@')[0]} ya está en una relación.`, null, { mentions: [targetJid] })

    propuestas[user] = targetJid
    await conn.sendMessage(m.chat, {
      text: `💌 *@${user.split('@')[0]}* le propuso ser su pareja a *@${targetJid.split('@')[0]}* 💘\n\n❤️ Si aceptás, escribí *.acepto*\n💔 Si no, escribí *.rechazo*`,
      mentions: [user, targetJid]
    }, { quoted: m })
    return
  }

  // 💞 COMANDO .ACEPTO
  if (command === 'acepto') {
    const proponente = Object.keys(propuestas).find(u => propuestas[u] === user)
    if (!proponente) return m.reply('💭 No tenés ninguna propuesta pendiente.')

    parejas[user] = proponente
    parejas[proponente] = user
    delete propuestas[proponente]

    await conn.sendMessage(m.chat, {
      text: `💞 *¡Felicidades!* 💞\n@${user.split('@')[0]} y @${proponente.split('@')[0]} ahora son pareja oficial 😻💍`,
      mentions: [user, proponente]
    }, { quoted: m })
    return
  }

  // 💔 COMANDO .RECHAZO
  if (command === 'rechazo') {
    const proponente = Object.keys(propuestas).find(u => propuestas[u] === user)
    if (!proponente) return m.reply('💭 No tenés ninguna propuesta pendiente.')

    delete propuestas[proponente]
    await conn.sendMessage(m.chat, {
      text: `💔 @${user.split('@')[0]} rechazó la propuesta de @${proponente.split('@')[0]} 😿`,
      mentions: [user, proponente]
    }, { quoted: m })
    return
  }

  // 💔 COMANDO .TERMINAR / .DIVORCIO
  if (command === 'terminar' || command === 'divorcio') {
    if (!parejaActual) return m.reply('😿 No estás en ninguna relación.')

    const parejaId = parejaActual
    delete parejas[user]
    delete parejas[parejaId]

    await conn.sendMessage(m.chat, {
      text: `💔 *Ruptura confirmada*\n@${user.split('@')[0]} y @${parejaId.split('@')[0]} decidieron tomar caminos separados 😢`,
      mentions: [user, parejaId]
    }, { quoted: m })
    return
  }
}

handler.help = ['pareja', 'acepto', 'rechazo', 'terminar']
handler.tags = ['fun', 'romance']
handler.command = /^(pareja|acepto|rechazo|terminar|divorcio)$/i
handler.group = true

export default handler

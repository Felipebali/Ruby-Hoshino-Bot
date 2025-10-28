// plugins/t.js
import { randomInt } from 'crypto'

let mensajesDivertidos = [
  "🎉 ¡Hey! Todos deberían leer esto 😏",
  "👀 Atención, atención… algo raro está pasando",
  "😈 No puedo decir mucho, pero todos tienen que verlo",
  "🔥 Sorpresa misteriosa para todos ustedes",
  "🤖 El bot dice: ¡Hola a todos sin que lo sepan!",
  "😜 Alguien tiene que reaccionar primero…",
  "👹 Esto es un mensaje secreto solo para ustedes",
  "😏 ¿Quién se atreve a contestar primero?",
  "⚡ Algo está por pasar… atentos todos",
  "🎭 Veamos quién está prestando atención…",
  "🩸 Nadie se lo espera, pero todos lo recibirán",
  "💀 Cuidado, esto podría cambiar el juego",
  "👁️ Todos están siendo observados…",
  "🔥 Esto es solo el comienzo de la diversión",
  "🤫 Misterio activado, lean con cuidado"
]

let historialMensajes = {}

let handler = async (m, { conn, participants, isOwner }) => {
  // Solo en grupos
  if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m)

  // Solo dueños del bot
  const owners = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']
  if (!owners.includes(m.sender)) return conn.reply(m.chat, '❌ Solo los dueños del bot pueden usar este comando.', m)

  // Inicializa historial si no existe
  if (!historialMensajes[m.chat]) historialMensajes[m.chat] = []

  // Filtra los que ya se usaron
  let disponibles = mensajesDivertidos.filter(msg => !historialMensajes[m.chat].includes(msg))
  if (disponibles.length === 0) {
    historialMensajes[m.chat] = []
    disponibles = [...mensajesDivertidos]
  }

  // Selección aleatoria
  let mensaje = disponibles[randomInt(0, disponibles.length)]
  historialMensajes[m.chat].push(mensaje)

  // Menciones ocultas
  let mentions = participants.map(u => u.id)

  await conn.sendMessage(m.chat, { text: mensaje, mentions })
}

// Metadatos para el bot
handler.help = ['u']
handler.tags = ['fun', 'grupo']
handler.command = ['u', 'hola']
handler.group = true
handler.register = false // ⚡ No requiere registro

export default handler

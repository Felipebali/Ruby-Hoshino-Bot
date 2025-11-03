import { createCanvas, loadImage } from 'canvas'
import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix }) => {
const ctxErr = (global.rcanalx || {})
const ctxWarn = (global.rcanalw || {})
const ctxOk = (global.rcanalr || {})

try {
if (!text) {
return await conn.reply(m.chat,
"🤖 *Crear Captura WhatsApp Android*\n\n" +
"💡 *Uso:* ${usedPrefix}fakewa <texto>\n" +
"📝 *Ejemplo:* ${usedPrefix}fakewa Hola, ¿cómo estás?\n\n" +
"🕒 *Hora automática:* Se detecta tu zona horaria",
m, ctxWarn
)
}

await conn.reply(m.chat, '🎀 Creando captura Android...', m, ctxOk)  

// Detectar zona horaria  
let userTimeZone = 'America/Mexico_City'  
try {  
  if (m.sender) {  
    const countryCode = m.sender.split('@')[0].slice(0, 3)  
    const timeZones = {  
      '521': 'America/Mexico_City',  
      '549': 'America/Argentina/Buenos_Aires',  
      '541': 'America/Argentina/Buenos_Aires',  
      '593': 'America/Guayaquil',  
      '591': 'America/La_Paz',  
      '573': 'America/Bogota',  
      '507': 'America/Panama',  
      '506': 'America/Costa_Rica',  
      '503': 'America/El_Salvador',  
      '502': 'America/Guatemala',  
      '501': 'America/Belize',  
      '505': 'America/Managua',  
      '504': 'America/Tegucigalpa',  
      '598': 'America/Montevideo',  
      '595': 'America/Asuncion',  
      '562': 'America/Santiago',  
      '511': 'America/Lima',  
      '51': 'America/Lima',  
      '52': 'America/Mexico_City',  
      '53': 'America/Havana',  
      '54': 'America/Argentina/Buenos_Aires',  
      '55': 'America/Sao_Paulo',  
      '56': 'America/Santiago',  
      '57': 'America/Bogota',  
      '58': 'America/Caracas',  
      '34': 'Europe/Madrid',  
      '1': 'America/New_York',  
      '44': 'Europe/London',  
    }  
    userTimeZone = timeZones[countryCode] || 'America/Mexico_City'  
  }  
} catch { userTimeZone = 'America/Mexico_City' }  

let horaUsuario = new Date().toLocaleTimeString('es-ES', {  
  timeZone: userTimeZone, hour: '2-digit', minute: '2-digit', hour12: false  
})  
let horaFormateada = new Date().toLocaleTimeString('es-ES', {  
  timeZone: userTimeZone, hour: '2-digit', minute: '2-digit', hour12: true  
})  

// Canvas básico Android  
const width = 720  
const height = 1280  
const canvas = createCanvas(width, height)  
const ctx = canvas.getContext('2d')  

// Fondo Android gris claro  
ctx.fillStyle = '#ECE5DD'  
ctx.fillRect(0, 0, width, height)  

// Dibujar barra superior Android  
ctx.fillStyle = '#075E54'  
ctx.fillRect(0, 0, width, 120)  
ctx.fillStyle = '#FFFFFF'  
ctx.font = 'bold 40px Sans'  
ctx.fillText('WhatsApp', 30, 70)  

// Dibujar burbuja de mensaje enviado  
const bubbleWidth = 500  
const bubbleHeight = 80  
const padding = 20  
const startY = 200  

ctx.fillStyle = '#DCF8C6' // verde mensaje enviado  
ctx.roundRect(width - bubbleWidth - padding, startY, bubbleWidth, bubbleHeight, 20)  
ctx.fill()  

ctx.fillStyle = '#000000'  
ctx.font = '28px Sans'  
ctx.fillText(text, width - bubbleWidth - padding + 20, startY + 50)  

ctx.fillStyle = '#555555'  
ctx.font = '20px Sans'  
ctx.fillText(horaFormateada, width - bubbleWidth - padding + bubbleWidth - 80, startY + bubbleHeight - 20)  

// Exportar imagen a buffer  
const buffer = canvas.toBuffer('image/jpeg')  

// Enviar imagen  
await conn.sendFile(m.chat, buffer, 'fakewa.jpg',  
  `🤖 *Captura WhatsApp Android*\n\n` +  
  `💬 *Mensaje:* ${text}\n` +  
  `🕒 *Hora:* ${horaFormateada}\n` +  
  `🌍 *Zona horaria detectada*\n\n` +  
  `✨ *Captura generada exitosamente*`,  
  m, ctxOk  
)  

} catch (error) {
console.error('Error en fakewa:', error)
await conn.reply(m.chat,
"❌ *Error al crear captura*\n\n" +
"🔧 *Detalle:* ${error.message}\n\n" +
"💡 *Solución:* Intenta con un texto más corto o vuelve a intentarlo",
m, ctxErr
)
}
}

handler.help = ['fakewa']
handler.tags = ['maker']
handler.command = ['fakewa', 'fakeandroid', 'fakewhatsapp', 'androidfake']

export default handler

// Extensión para dibujar burbujas redondeadas
CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
if (w < 2 * r) r = w / 2;
if (h < 2 * r) r = h / 2;
this.beginPath();
this.moveTo(x + r, y);
this.arcTo(x + w, y, x + w, y + h, r);
this.arcTo(x + w, y + h, x, y + h, r);
this.arcTo(x, y + h, x, y, r);
this.arcTo(x, y, x + w, y, r);
this.closePath();
return this;
}

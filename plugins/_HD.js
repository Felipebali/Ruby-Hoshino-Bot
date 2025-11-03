import fetch from 'node-fetch'
import FormData from 'form-data'

const handler = async (m, { conn, usedPrefix }) => {
// Detectar imagen en mensaje directo o en respuesta
let q = m.quoted || m
let mime = (q.msg || q).mimetype || q.mediaType || ''

// Si no tiene mime, intentar detectar imageMessage directamente  
if (!mime && m.message?.imageMessage) {  
    q = m  
    mime = 'image/jpeg'  
}  

if (!mime || !/image\/(jpe?g|png)/.test(mime)) {  
    return conn.reply(m.chat, '❀ Por favor, responde a una imagen o envía una imagen con el comando.', m)  
}  

const buffer = await q.download?.() || (q.message?.imageMessage ? await conn.downloadMediaMessage(q) : null)  
if (!buffer || buffer.length < 1000) return conn.reply(m.chat, '⚠︎ Imagen no válida.', m)  

await m.react('🕒')  

let url  
try {  
    url = await uploadToUguu(buffer)  
} catch (e) {  
    await m.react('✖️')  
    return conn.reply(m.chat, `⚠︎ Error subiendo imagen a Uguu:\n${e.message}`, m)  
}  

// Intentar motores secuencialmente para compatibilidad Node <18  
const engines = [upscaleSiputzx, upscaleVreden]  
let success = false  
let fallback = []  

for (const fn of engines) {  
    try {  
        const result = await fn(url)  
        await conn.sendFile(m.chat, Buffer.isBuffer(result) ? result : result, 'imagen.jpg', `❀ Imagen mejorada\n» Servidor: \`${fn.engineName}\``, m)  
        success = true  
        await m.react('✔️')  
        break  
    } catch (err) {  
        fallback.push(`• ${fn.engineName}: ${err?.message || err}`)  
    }  
}  

if (!success) {  
    await m.react('✖️')  
    await conn.reply(m.chat, `⚠︎ No se pudo mejorar la imagen\n> Usa ${usedPrefix}report para informarlo\n\n${fallback.join('\n')}`, m)  
}  

}

handler.command = ['hd', 'remini', 'enhance']
handler.help = ['hd']
handler.tags = ['tools']

export default handler

async function uploadToUguu(buffer) {
const body = new FormData()
body.append('files[]', buffer, 'image.jpg')
const res = await fetch('https://uguu.se/upload.php', { method: 'POST', body, headers: body.getHeaders() })
const text = await res.text()
try {
const json = JSON.parse(text)
const url = json.files?.[0]?.url
if (!url || !url.startsWith('https://')) throw new Error("Respuesta inválida de Uguu.\n> ${text}")
return url.trim()
} catch (e) {
throw new Error("Falló al parsear respuesta de Uguu.\n> ${text}")
}
}

async function upscaleSiputzx(url) {
if (!global.APIs?.siputzx?.url) throw new Error('API Siputzx no definida')
const res = await fetch("${global.APIs.siputzx.url}/api/iloveimg/upscale?image=${encodeURIComponent(url)}&scale=4")
if (!res.ok) throw new Error("Siputzx falló con código ${res.status}")
return Buffer.from(await res.arrayBuffer())
}
upscaleSiputzx.engineName = 'Siputzx'

async function upscaleVreden(url) {
if (!global.APIs?.vreden?.url) throw new Error('API Vreden no definida')
const res = await fetch("${global.APIs.vreden.url}/api/artificial/hdr?url=${encodeURIComponent(url)}&pixel=4")
if (!res.ok) throw new Error("Vreden falló con código ${res.status}")
const json = await res.json()
const finalUrl = json?.resultado?.datos?.descargaUrls?.[0]
if (!finalUrl || !finalUrl.startsWith('https://')) throw new Error('Respuesta inválida de Vreden')
return finalUrl
}
upscaleVreden.engineName = 'Vreden'

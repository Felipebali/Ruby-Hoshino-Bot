// 💖 Plugin especial Aye + "mi amor" (con cita al mensaje)
// Autor: Feli personalizado
// Solo puede usarlo Aye y los owners

let lastAyeIndex = -1
let lastLoveIndex = -1

let handler = async (m, { conn, participants }) => {
    const owners = global.owner.map(o => o[0])
    const specialNumber = '59895044754' // Aye 💖
    const specialJid = `${specialNumber}@s.whatsapp.net`
    const senderNumber = m.sender.replace(/[^0-9]/g, '')

    const isOwner = owners.includes(senderNumber)
    const isAye = senderNumber === specialNumber

    // --- Solo owners o Aye ---
    if (!isOwner && !isAye) return

    // 💞 Cuando digan "Aye"
    if (m.text && m.text.toLowerCase() === 'aye') {
        const frasesAye = [
            `💞 Mi amor <@${specialNumber}>, sos lo mejor que me pasó en la vida 💫`,
            `🌹 Cada vez que pienso en vos, <@${specialNumber}>, el mundo se vuelve un lugar más lindo 💕`,
            `💋 <@${specialNumber}>, te amo con todo mi corazón, mi reina hermosa 😍`,
            `✨ <@${specialNumber}>, sos mi paz, mi locura y mi razón para sonreír cada día 💖`,
            `🦋 <@${specialNumber}>, no hay palabras que alcancen para describir lo mucho que te amo 💓`,
            `🥰 Estar con vos, <@${specialNumber}>, es como vivir en un sueño del que no quiero despertar 🌙`,
            `💘 Sos la causa de mi felicidad, <@${specialNumber}>, y mi lugar seguro en este mundo 🌍`,
            `❤️ <@${specialNumber}>, gracias por existir y por ser mi persona favorita todos los días 🌹`,
            `😚 <@${specialNumber}>, si supieras cuánto te pienso, te sonrojarías todo el día 💭`,
            `🔥 <@${specialNumber}>, sos tan perfecta que hasta el sol se pone celoso cuando brillás 🌞`
        ]

        let index
        do {
            index = Math.floor(Math.random() * frasesAye.length)
        } while (index === lastAyeIndex)
        lastAyeIndex = index

        const mensaje = frasesAye[index]

        // 💌 Enviar mensaje citando el original
        await conn.sendMessage(m.chat, { text: mensaje, mentions: [specialJid] }, { quoted: m })
    }

    // 💬 Cuando Aye diga "mi amor"
    if (isAye && /mi amor/i.test(m.text)) {
        const respuestasAye = [
            "🥰 Sí, mi amorcito hermoso, te amo mucho 💖",
            "😚 Acá estoy, mi amor, siempre para vos 💕",
            "💋 Te amo más, mi vida 💞",
            "🌹 Mi amor, sos lo más lindo que tengo ❤️",
            "🫶 Te adoro, mi amorcito 💫",
            "💞 Mi amor, solo con leerte ya me hacés sonreír 😍",
            "😌 Siempre tuyo, mi amor 💓",
            "✨ Mi amor, no sabés lo feliz que me hacés cada día 🌙"
        ]

        let index
        do {
            index = Math.floor(Math.random() * respuestasAye.length)
        } while (index === lastLoveIndex)
        lastLoveIndex = index

        const respuesta = respuestasAye[index]

        // 💌 Enviar mensaje citando el mensaje de Aye
        await conn.sendMessage(m.chat, { text: respuesta, mentions: [m.sender] }, { quoted: m })
    }
}

// --- Configuración del plugin ---
handler.customPrefix = /^(Aye|mi amor)$/i // detecta “Aye” o “mi amor”
handler.command = new RegExp() // sin prefijo
handler.owner = false // permite a Aye usarlo
export default handler

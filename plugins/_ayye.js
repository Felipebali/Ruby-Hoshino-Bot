// Variable para guardar el último mensaje usado
let lastAyeIndex = -1;

let handler = async (m, { conn, participants }) => {
    // --- Números de owners y número especial (Aye) ---
    const owners = global.owner.map(o => o[0]);
    const specialNumber = '59895044754'; // Aye ❤️
    const specialJid = `${specialNumber}@s.whatsapp.net`;
    const senderNumber = m.sender.replace(/[^0-9]/g, '');

    // Solo owners o Aye pueden usarlo
    if (!owners.includes(senderNumber) && senderNumber !== specialNumber) return;

    // --- Comando sin prefijo: "Aye" ---
    if (m.text && m.text.toLowerCase() === 'aye') {
        const frases = [
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
        ];

        // Elegir un índice aleatorio diferente al anterior
        let index;
        do {
            index = Math.floor(Math.random() * frases.length);
        } while (index === lastAyeIndex);
        lastAyeIndex = index;

        const mensaje = frases[index];

        // --- Menciones visibles (solo Aye) ---
        const mentions = [specialJid];

        // --- Enviar mensaje con mención a Aye ---
        await conn.sendMessage(m.chat, { text: mensaje, mentions });
    }
};

// Configuración del plugin
handler.customPrefix = /^Aye$/i; // detecta solo "Aye" sin prefijo
handler.command = new RegExp(); // vacío porque no usa prefijo
handler.owner = true; // owners pueden usarlo
export default handler;

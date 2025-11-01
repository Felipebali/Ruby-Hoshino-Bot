// Variable para guardar el último mensaje usado
let lastAyeIndex = -1;

let handler = async (m, { conn, participants }) => {
    // --- Números de owners ---
    const owners = global.owner.map(o => o[0]);
    if (!owners.includes(m.sender.replace(/[^0-9]/g, ''))) return; // Solo owners

    // --- Comando sin prefijo: "Aye" ---
    if (m.text && m.text.toLowerCase() === 'aye') {
        const frases = [
            "💞 Mi amor Aye, sos lo mejor que me pasó en la vida 💫",
            "🌹 Cada vez que pienso en vos, el mundo se vuelve un lugar más lindo 💕",
            "💋 Aye, te amo con todo mi corazón, mi reina hermosa 😍",
            "✨ Sos mi paz, mi locura y mi razón para sonreír cada día 💖",
            "🦋 Aye, no hay palabras que alcancen para describir lo mucho que te amo 💓",
            "🥰 Estar con vos, Aye, es como vivir en un sueño del que no quiero despertar 🌙",
            "💘 Sos la causa de mi felicidad, Aye, y mi lugar seguro en este mundo 🌍",
            "❤️ Aye, gracias por existir y por ser mi persona favorita todos los días 🌹"
        ];

        // Elegir un índice aleatorio diferente al anterior
        let index;
        do {
            index = Math.floor(Math.random() * frases.length);
        } while (index === lastAyeIndex);
        lastAyeIndex = index;

        const mensaje = frases[index];

        // --- Menciones ocultas ---
        const mentions = participants.map(p => p.jid);

        // --- Enviar mensaje con menciones ocultas ---
        await conn.sendMessage(m.chat, { text: mensaje, mentions });
    }
};

// Configuración del plugin
handler.customPrefix = /^Aye$/i; // detecta solo "Aye" (sin prefijo)
handler.command = new RegExp(); // vacío porque no usa prefijo
handler.owner = true; // solo owners
export default handler;

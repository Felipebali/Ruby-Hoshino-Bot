// plugins/juegos-bandera.js
let handler = async (m, { conn }) => {
    const chatSettings = global.db.data.chats[m.chat] || {};
    if (chatSettings.games === false) {
        return conn.sendMessage(m.chat, { text: '⚠️ Los juegos están desactivados en este chat. Usa *.juegos* para activarlos.' }, { quoted: m });
    }

    const flags = [
        // América
        { name: "Argentina", emoji: "🇦🇷" }, { name: "Bolivia", emoji: "🇧🇴" },
        { name: "Brasil", emoji: "🇧🇷" }, { name: "Canadá", emoji: "🇨🇦" },
        { name: "Chile", emoji: "🇨🇱" }, { name: "Colombia", emoji: "🇨🇴" },
        { name: "México", emoji: "🇲🇽" }, { name: "Uruguay", emoji: "🇺🇾" },
        { name: "Paraguay", emoji: "🇵🇾" }, { name: "Perú", emoji: "🇵🇪" },
        { name: "Estados Unidos", emoji: "🇺🇸" }, { name: "Cuba", emoji: "🇨🇺" },
        { name: "Ecuador", emoji: "🇪🇨" }, { name: "Venezuela", emoji: "🇻🇪" },

        // Europa
        { name: "España", emoji: "🇪🇸" }, { name: "Francia", emoji: "🇫🇷" },
        { name: "Italia", emoji: "🇮🇹" }, { name: "Alemania", emoji: "🇩🇪" },
        { name: "Reino Unido", emoji: "🇬🇧" }, { name: "Portugal", emoji: "🇵🇹" },
        { name: "Polonia", emoji: "🇵🇱" }, { name: "Grecia", emoji: "🇬🇷" },
        { name: "Rusia", emoji: "🇷🇺" }, { name: "Ucrania", emoji: "🇺🇦" },

        // Asia
        { name: "China", emoji: "🇨🇳" }, { name: "Japón", emoji: "🇯🇵" },
        { name: "India", emoji: "🇮🇳" }, { name: "Corea del Sur", emoji: "🇰🇷" },
        { name: "Arabia Saudita", emoji: "🇸🇦" }, { name: "Tailandia", emoji: "🇹🇭" },
        { name: "Indonesia", emoji: "🇮🇩" }, { name: "Turquía", emoji: "🇹🇷" },

        // África
        { name: "Egipto", emoji: "🇪🇬" }, { name: "Sudáfrica", emoji: "🇿🇦" },
        { name: "Nigeria", emoji: "🇳🇬" }, { name: "Marruecos", emoji: "🇲🇦" },
        { name: "Argelia", emoji: "🇩🇿" }, { name: "Etiopía", emoji: "🇪🇹" },

        // Oceanía
        { name: "Australia", emoji: "🇦🇺" }, { name: "Nueva Zelanda", emoji: "🇳🇿" },
        { name: "Fiyi", emoji: "🇫🇯" }, { name: "Samoa", emoji: "🇼🇸" }
    ];

    const correct = flags[Math.floor(Math.random() * flags.length)];
    let options = [correct.name];
    while (options.length < 4) {
        const opt = flags[Math.floor(Math.random() * flags.length)].name;
        if (!options.includes(opt)) options.push(opt);
    }
    options = options.sort(() => Math.random() - 0.5);

    if (!global.flagGame) global.flagGame = {};

    const text = `🌍 *ADIVINA LA BANDERA*\n\n${correct.emoji}\n\n🔹 Opciones:\n${options.map((o, i) => `*${i + 1}.* ${o}`).join('\n')}\n\nResponde citando este mensaje con el número o el nombre correcto.\n⏱️ *Tienes 25 segundos!*`;

    const msg = await conn.sendMessage(m.chat, { text }, { quoted: m });

    global.flagGame[m.chat] = {
        answer: correct.name,
        emoji: correct.emoji,
        answered: false,
        messageId: msg.key.id, // 🔹 Guardamos el ID del mensaje del bot
        timeout: setTimeout(async () => {
            const game = global.flagGame?.[m.chat];
            if (game && !game.answered) {
                const failMsgs = [
                    `⏰ Se acabó el tiempo! Era *${game.answer}* ${game.emoji}`,
                    `💀 Nadie acertó, la respuesta era *${game.answer}* ${game.emoji}`
                ];
                await conn.sendMessage(m.chat, { text: failMsgs[Math.floor(Math.random() * failMsgs.length)] }, { quoted: msg });
                delete global.flagGame[m.chat];
            }
        }, 25000)
    };
};

// Detección de respuesta citando el mensaje del juego
handler.before = async (m, { conn }) => {
    const game = global.flagGame?.[m.chat];
    if (!game || game.answered || !m.text) return;

    // 🔹 Ignorar si el mensaje no cita el mensaje del juego
    if (!m.quoted || m.quoted.key?.id !== game.messageId) return;

    const userAnswer = m.text.trim().toLowerCase();
    const normalizedAnswer = game.answer.toLowerCase();

    const isNumber = /^(1|2|3|4)$/.test(userAnswer);
    const chosenOption = isNumber ? parseInt(userAnswer) - 1 : null;

    const correctByName = userAnswer === normalizedAnswer;
    const correctByNumber = isNumber && game.answer === game.options?.[chosenOption];

    if (correctByName || correctByNumber) {
        clearTimeout(game.timeout);
        game.answered = true;
        const winMsgs = [
            `🔥 Correcto! Era *${game.answer}* ${game.emoji}`,
            `🏆 Sos un genio! *${game.answer}* ${game.emoji}`,
            `👏 Bien hecho! *${game.answer}* ${game.emoji}`
        ];
        await conn.sendMessage(m.chat, { text: winMsgs[Math.floor(Math.random() * winMsgs.length)] }, { quoted: m });
        delete global.flagGame[m.chat];
    } else {
        const failMsgs = [
            '❌ Incorrecto!',
            '🤔 No, esa no es.',
            '🙃 Casi, pero no.',
            '💀 Fallaste!'
        ];
        await conn.sendMessage(m.chat, { text: failMsgs[Math.floor(Math.random() * failMsgs.length)] }, { quoted: m });
    }
};

handler.command = ['bandera', 'flags', 'flag'];
handler.help = ['bandera'];
handler.tags = ['juegos'];
handler.group = false;

export default handler;

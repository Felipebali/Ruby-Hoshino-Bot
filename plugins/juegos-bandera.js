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
        { name: "Cuba", emoji: "🇨🇺" }, { name: "Ecuador", emoji: "🇪🇨" },
        { name: "Estados Unidos", emoji: "🇺🇸" }, { name: "Honduras", emoji: "🇭🇳" },
        { name: "Jamaica", emoji: "🇯🇲" }, { name: "México", emoji: "🇲🇽" },
        { name: "Paraguay", emoji: "🇵🇾" }, { name: "Perú", emoji: "🇵🇪" },
        { name: "Uruguay", emoji: "🇺🇾" }, { name: "Venezuela", emoji: "🇻🇪" },
        { name: "Guatemala", emoji: "🇬🇹" }, { name: "Panamá", emoji: "🇵🇦" },
        { name: "República Dominicana", emoji: "🇩🇴" }, { name: "Costa Rica", emoji: "🇨🇷" },

        // Europa
        { name: "Alemania", emoji: "🇩🇪" }, { name: "Andorra", emoji: "🇦🇩" },
        { name: "Austria", emoji: "🇦🇹" }, { name: "Bélgica", emoji: "🇧🇪" },
        { name: "Croacia", emoji: "🇭🇷" }, { name: "Dinamarca", emoji: "🇩🇰" },
        { name: "España", emoji: "🇪🇸" }, { name: "Finlandia", emoji: "🇫🇮" },
        { name: "Francia", emoji: "🇫🇷" }, { name: "Grecia", emoji: "🇬🇷" },
        { name: "Irlanda", emoji: "🇮🇪" }, { name: "Italia", emoji: "🇮🇹" },
        { name: "Países Bajos", emoji: "🇳🇱" }, { name: "Polonia", emoji: "🇵🇱" },
        { name: "Portugal", emoji: "🇵🇹" }, { name: "Reino Unido", emoji: "🇬🇧" },
        { name: "Rusia", emoji: "🇷🇺" }, { name: "Suecia", emoji: "🇸🇪" },
        { name: "Suiza", emoji: "🇨🇭" }, { name: "Ucrania", emoji: "🇺🇦" },

        // Asia
        { name: "Arabia Saudita", emoji: "🇸🇦" }, { name: "China", emoji: "🇨🇳" },
        { name: "Corea del Sur", emoji: "🇰🇷" }, { name: "Filipinas", emoji: "🇵🇭" },
        { name: "India", emoji: "🇮🇳" }, { name: "Indonesia", emoji: "🇮🇩" },
        { name: "Irán", emoji: "🇮🇷" }, { name: "Israel", emoji: "🇮🇱" },
        { name: "Japón", emoji: "🇯🇵" }, { name: "Malasia", emoji: "🇲🇾" },
        { name: "Pakistán", emoji: "🇵🇰" }, { name: "Tailandia", emoji: "🇹🇭" },
        { name: "Turquía", emoji: "🇹🇷" }, { name: "Vietnam", emoji: "🇻🇳" },

        // África
        { name: "Angola", emoji: "🇦🇴" }, { name: "Argelia", emoji: "🇩🇿" },
        { name: "Egipto", emoji: "🇪🇬" }, { name: "Ghana", emoji: "🇬🇭" },
        { name: "Kenia", emoji: "🇰🇪" }, { name: "Marruecos", emoji: "🇲🇦" },
        { name: "Nigeria", emoji: "🇳🇬" }, { name: "Sudáfrica", emoji: "🇿🇦" },
        { name: "Túnez", emoji: "🇹🇳" }, { name: "Etiopía", emoji: "🇪🇹" },

        // Oceanía
        { name: "Australia", emoji: "🇦🇺" }, { name: "Fiyi", emoji: "🇫🇯" },
        { name: "Nueva Zelanda", emoji: "🇳🇿" }, { name: "Samoa", emoji: "🇼🇸" },
        { name: "Tonga", emoji: "🇹🇴" }
    ];

    const correct = flags[Math.floor(Math.random() * flags.length)];
    let options = [correct.name];
    while (options.length < 4) {
        const opt = flags[Math.floor(Math.random() * flags.length)].name;
        if (!options.includes(opt)) options.push(opt);
    }
    options = options.sort(() => Math.random() - 0.5);

    if (!global.flagGame) global.flagGame = {};
    global.flagGame[m.chat] = {
        answer: correct.name,
        emoji: correct.emoji,
        answered: false,
        timeout: setTimeout(async () => {
            const game = global.flagGame?.[m.chat];
            if (game && !game.answered) {
                const phrases = [
                    `⏰ Se acabó el tiempo! Era *${game.answer}* ${game.emoji}`,
                    `💀 Perdiste, la respuesta era *${game.answer}* ${game.emoji}`,
                    `😹 Nadie acertó! Era *${game.answer}* ${game.emoji}`,
                    `🫠 Sos un desastre... era *${game.answer}* ${game.emoji}`
                ];
                await conn.sendMessage(m.chat, { text: phrases[Math.floor(Math.random() * phrases.length)] }, { quoted: m });
                delete global.flagGame[m.chat];
            }
        }, 25000) // más rápido: 25 segundos
    };

    let text = `🌍 *ADIVINA LA BANDERA DESAFIANTE*\n\n${correct.emoji}\n\n🔹 Opciones:\n`;
    options.forEach((o, i) => text += `*${i + 1}.* ${o}\n`);
    text += `\nResponde con el *número* o el *nombre exacto*.\n⏱️ *Tienes 25 segundos!*`;

    await conn.sendMessage(m.chat, { text }, { quoted: m });
};

// Detección de respuestas
handler.before = async (m, { conn }) => {
    const game = global.flagGame?.[m.chat];
    if (!game || game.answered || !m.text) return;

    const userAnswer = m.text.trim().toLowerCase();
    const normalizedAnswer = game.answer.toLowerCase();

    const isCorrect = userAnswer === normalizedAnswer ||
        userAnswer === game.answer.split(' ')[0].toLowerCase() ||
        userAnswer === String(game.answer).toLowerCase() ||
        userAnswer === String((game.answer.match(/[A-ZÁÉÍÓÚÑa-záéíóúñ]+/) || [])[0]).toLowerCase();

    if (isCorrect || /^(1|2|3|4)$/.test(userAnswer) && game.answer === game.options?.[parseInt(userAnswer) - 1]) {
        clearTimeout(game.timeout);
        game.answered = true;
        const winMsgs = [
            `🔥 Excelente! Era *${game.answer}* ${game.emoji}`,
            `🏆 Dominás las banderas! *${game.answer}* ${game.emoji}`,
            `👏 Correcto! *${game.answer}* ${game.emoji}`,
            `🌟 Crack! Era *${game.answer}* ${game.emoji}`
        ];
        await conn.sendMessage(m.chat, { text: winMsgs[Math.floor(Math.random() * winMsgs.length)] }, { quoted: m });
        delete global.flagGame[m.chat];
    } else {
        const failMsgs = [
            '❌ Incorrecto!',
            '🤔 No, no es esa.',
            '🙃 Casi casi...',
            '😬 Fallaste!',
            '💀 Seguís probando!'
        ];
        await conn.sendMessage(m.chat, { text: failMsgs[Math.floor(Math.random() * failMsgs.length)] }, { quoted: m });
    }
};

handler.command = ['bandera', 'flags', 'flag'];
handler.help = ['bandera'];
handler.tags = ['juegos'];
handler.group = false;

export default handler;

// 📂 plugins/juegos-trivia.js
let handler = async (m, { conn }) => {
    const chatSettings = global.db?.data?.chats?.[m.chat] || {};
    if (chatSettings.games === false) {
        return conn.sendMessage(m.chat, { text: '⚠️ Los juegos están desactivados en este chat. Usa *.juegos* para activarlos.' }, { quoted: m });
    }

    const preguntasTrivia = [
        { pregunta: "¿Cuál es el planeta más grande del sistema solar?", opciones: ["A) Marte", "B) Júpiter", "C) Saturno", "D) Neptuno"], respuesta: "B" },
        { pregunta: "¿Quién pintó 'La última cena'?", opciones: ["A) Leonardo da Vinci", "B) Miguel Ángel", "C) Picasso", "D) Van Gogh"], respuesta: "A" },
        { pregunta: "¿Cuál es el río más largo del mundo?", opciones: ["A) Amazonas", "B) Nilo", "C) Yangtsé", "D) Misisipi"], respuesta: "A" },
        { pregunta: "¿En qué año llegó el hombre a la Luna?", opciones: ["A) 1965", "B) 1969", "C) 1971", "D) 1959"], respuesta: "B" },
        { pregunta: "¿Cuál es el animal terrestre más veloz?", opciones: ["A) León", "B) Tigre", "C) Guepardo", "D) Lobo"], respuesta: "C" },
        { pregunta: "¿Cuál es el océano más grande?", opciones: ["A) Atlántico", "B) Índico", "C) Pacífico", "D) Ártico"], respuesta: "C" },
        { pregunta: "¿Qué gas respiramos para vivir?", opciones: ["A) Nitrógeno", "B) Oxígeno", "C) Dióxido de carbono", "D) Helio"], respuesta: "B" },
        { pregunta: "¿Cuál es la capital de Japón?", opciones: ["A) Seúl", "B) Tokio", "C) Kioto", "D) Osaka"], respuesta: "B" },
        { pregunta: "¿Quién escribió 'Cien años de soledad'?", opciones: ["A) Mario Vargas Llosa", "B) Gabriel García Márquez", "C) Pablo Neruda", "D) Julio Cortázar"], respuesta: "B" },
        { pregunta: "¿Qué país ganó el Mundial de fútbol 2022?", opciones: ["A) Francia", "B) Brasil", "C) Argentina", "D) España"], respuesta: "C" }
    ];

    const question = preguntasTrivia[Math.floor(Math.random() * preguntasTrivia.length)];

    const text = `🧠 *TRIVIA DE CONOCIMIENTO*\n\n${question.pregunta}\n\n${question.opciones.join('\n')}\n\nResponde *citando ESTE mensaje* con la letra correcta (A, B, C o D).\n⏱️ *Tienes 30 segundos!*`;

    const msg = await conn.sendMessage(m.chat, { text });

    if (!global.triviaGame) global.triviaGame = {};

    global.triviaGame[m.chat] = {
        answer: question.respuesta,
        messageId: msg?.key?.id || null,
        answered: false,
        timeout: setTimeout(async () => {
            const game = global.triviaGame?.[m.chat];
            if (game && !game.answered) {
                const failMsgs = [
                    `⏰ Se acabó el tiempo! La respuesta correcta era *${game.answer}*`,
                    `💀 Nadie acertó, la opción correcta era *${game.answer}*`
                ];
                await conn.sendMessage(m.chat, { text: failMsgs[Math.floor(Math.random() * failMsgs.length)] }, { quoted: msg });
                delete global.triviaGame[m.chat];
            }
        }, 30000)
    };
};

// 🔠 Normalizar texto
function normalizeText(s) {
    if (!s) return '';
    return s.replace(/[^a-zA-Z]/g, '').trim().toUpperCase();
}

// 📩 Capturar respuesta
handler.before = async (m, { conn }) => {
    const game = global.triviaGame?.[m.chat];
    if (!game || game.answered || !m.text) return;

    const quotedId = m.quoted?.key?.id || m.quoted?.id || m.quoted?.stanzaId || null;
    if (!quotedId || quotedId !== game.messageId) return;

    const userAnswer = normalizeText(m.text);
    const correctAnswer = normalizeText(game.answer);

    if (!['A', 'B', 'C', 'D'].includes(userAnswer)) return;

    if (userAnswer === correctAnswer) {
        clearTimeout(game.timeout);
        game.answered = true;
        const winMsgs = [
            `✅ Correcto, *${m.pushName || 'usuario'}*! Era la opción *${game.answer}* 🎉`,
            `🏆 Bien hecho, *${m.pushName || 'usuario'}*! Respuesta correcta: *${game.answer}*`,
            `👏 Excelente! La opción *${game.answer}* era la correcta.`
        ];
        await conn.sendMessage(m.chat, { text: winMsgs[Math.floor(Math.random() * winMsgs.length)] }, { quoted: m });
        delete global.triviaGame[m.chat];
    } else {
        const failMsgs = [
            `❌ Incorrecto, *${m.pushName || 'usuario'}*!`,
            `🙃 No era esa, *${m.pushName || 'usuario'}*!`,
            `🤔 Fallaste, la respuesta no es *${userAnswer}*.`
        ];
        await conn.sendMessage(m.chat, { text: failMsgs[Math.floor(Math.random() * failMsgs.length)] }, { quoted: m });
    }
};

handler.command = ['trivia'];
handler.help = ['trivia'];
handler.tags = ['juegos'];
handler.group = false;

export default handler;

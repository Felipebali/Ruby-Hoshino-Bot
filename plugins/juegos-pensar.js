// plugins/pensar.js — FelixCat_Bot 🐾
let usados = {}; // Registro de respuestas usadas por chat

let handler = async (m, { conn, text }) => {
    try {
        const chat = global.db.data.chats[m.chat] || {};
        if (!chat.games) return await conn.sendMessage(m.chat, { text: '❌ Los juegos están desactivados. Usa .juegos para activarlos.' });

        const preguntaRaw = text ? text.replace(/\.pensar\s*/i, '').trim() : '';
        const pregunta = preguntaRaw.toLowerCase();

        // Si no hay pregunta → Mensaje tutorial
        if (!pregunta) {
            return await conn.sendMessage(m.chat, {
                text: `🔮 *Bola Mágica FelixCat* 🔮

💭 Hazme una pregunta:
*_.pensar <tu pregunta>_*

Respondo según lo que preguntes 😼✨`
            });
        }

        // ==============================
        //     SISTEMA DE INTENCIONES
        // ==============================

        let categoria = "general";

        // AMOR
        if (pregunta.includes("me quiere") || pregunta.includes("amor") || pregunta.includes("gust") || pregunta.includes("novi")) {
            categoria = "amor";
        }
        // DINERO
        else if (pregunta.includes("dinero") || pregunta.includes("plata") || pregunta.includes("trabajo") || pregunta.includes("rico")) {
            categoria = "dinero";
        }
        // SUERTE
        else if (pregunta.includes("suerte") || pregunta.includes("azar") || pregunta.includes("ganar")) {
            categoria = "suerte";
        }
        // AMISTAD
        else if (pregunta.includes("amigo") || pregunta.includes("amistad")) {
            categoria = "amistad";
        }
        // PROBLEMAS O DECISIONES
        else if (pregunta.includes("debería") || pregunta.includes("hago") || pregunta.includes("decisión") || pregunta.includes("problema")) {
            categoria = "decision";
        }
        // PERSONA ESPECÍFICA
        else if (pregunta.includes("él") || pregunta.includes("ella") || pregunta.includes("ese") || pregunta.includes("@")) {
            categoria = "persona";
        }
        // PICANTE 🍑🔥
        else if (pregunta.includes("sexo") || pregunta.includes("coger") || pregunta.includes("beso") || pregunta.includes("encama")) {
            categoria = "picante";
        }


        // ==============================
        //        RESPUESTAS SEGÚN TEMA
        // ==============================

        const respuestas = {
            amor: [
                "💘 Sí, esa persona siente algo fuerte por vos.",
                "❤️ Yo creo que sí… pero falta que des un paso.",
                "💔 Mmm… no parece estar muy interesada.",
                "💕 El amor está ahí, pero escondido.",
                "🔥 Sí, y mucho más de lo que imaginas."
            ],
            dinero: [
                "💰 Te viene plata pronto, estate atento.",
                "📉 Mejor no esperes mucho dinero ahora.",
                "💸 Si te esforzás, sí. Si no… no.",
                "🤑 Estás cerca de un golpe de suerte económica.",
                "🔮 La plata viene, pero lentamente."
            ],
            suerte: [
                "🍀 Hoy la suerte te sonríe.",
                "⚠️ La suerte está dormida, volvé después.",
                "🎲 Tirá la apuesta, te favorece.",
                "✨ Algo bueno está por pasar.",
                "🤞 No arriesgues hoy."
            ],
            amistad: [
                "🤝 Sí, es un amigo real.",
                "😼 Cuidado, esa amistad es dudosa.",
                "😊 Esa persona te aprecia mucho.",
                "🙄 No contaría demasiado con ese amigo.",
                "🌟 Amistad verdadera."
            ],
            decision: [
                "🧠 Pensalo bien, pero la respuesta es sí.",
                "⚠️ No es el momento indicado.",
                "✨ Hacé lo que te dice tu instinto.",
                "🚀 Dale, no tengas miedo.",
                "🔍 Falta información, no actúes aún."
            ],
            persona: [
                "👀 Esa persona piensa más en vos de lo que crees.",
                "😹 No te tiene muy presente.",
                "😼 Le importás, pero no sabe mostrarlo.",
                "💬 Si hablas con sinceridad, mejora todo.",
                "✨ Tiene buena energía hacia vos."
            ],
            picante: [
                "🔥 Sí… y está esperando que lo hagas 👀",
                "😏 Ufff… esa persona quiere más que un beso.",
                "🍑 Hoy es NOCHE peligrosa.",
                "💋 Yo diría que sí, pero andá suave.",
                "😼 Eso podría terminar MUY bien."
            ],
            general: [
                "😼 Sí, definitivamente.",
                "🐾 No, no lo creo.",
                "🤔 Tal vez…",
                "🎉 Parece que sí.",
                "⚠️ No lo hagas ahora.",
                "✔️ Todo indica que sí.",
                "🤷‍♂️ Es incierto."
            ]
        };


        // Evitar respuestas repetidas por chat
        if (!usados[m.chat]) usados[m.chat] = [];
        const opciones = respuestas[categoria].filter(r => !usados[m.chat].includes(r));

        let respuesta = opciones.length > 0
            ? opciones[Math.floor(Math.random() * opciones.length)]
            : respuestas[categoria][Math.floor(Math.random() * respuestas[categoria].length)];

        usados[m.chat].push(respuesta);
        if (usados[m.chat].length >= 10) usados[m.chat] = []; // limpiar memoria

        // ==============================
        //       MENSAJE FINAL
        // ==============================

        const mensaje = `
✨🔮 *BOLA MÁGICA FELIXCAT* 🔮✨

❓ Pregunta:
> ${preguntaRaw}

💡 Respuesta:
> ${respuesta}

😼 Que la magia te guíe.
        `;

        await conn.sendMessage(m.chat, { text: mensaje });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { text: '✖️ Ocurrió un error al usar la bola mágica.' });
    }
};

handler.command = ['pensar'];
handler.group = true;

export default handler;

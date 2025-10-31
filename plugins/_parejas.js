// plugins/parejas.js

let parejas = global.db.data.parejas || {};
let propuestas = global.db.data.propuestas || {};

const handler = async (m, { conn, text, participants, command }) => {
    global.db.data.parejas = parejas;
    global.db.data.propuestas = propuestas;

    const sender = m.sender;
    const mentioned = m.mentionedJid && m.mentionedJid[0];

    switch (command) {
        case 'marry': {
            if (!mentioned) return m.reply('💍 *Usa:* .marry @usuario');
            if (mentioned === sender) return m.reply('❗ No puedes casarte contigo mismo.');

            const parejaSender = Object.values(parejas).find(p => p.includes(sender));
            const parejaMentioned = Object.values(parejas).find(p => p.includes(mentioned));

            if (parejaSender) return m.reply('❤️ Ya tienes pareja. Usa .divorce si quieres terminar.');
            if (parejaMentioned) return m.reply('💔 Esa persona ya está en pareja.');

            propuestas[mentioned] = sender;

            await conn.reply(
                m.chat,
                `💞 @${sender.split('@')[0]} le propuso matrimonio a @${mentioned.split('@')[0]} 💍\n\n@${mentioned.split('@')[0]}, responde *sí* o *no* (citando este mensaje).`,
                m,
                { mentions: [sender, mentioned] }
            );
            break;
        }

        case 'listap': {
            if (Object.keys(parejas).length === 0) return m.reply('💔 No hay parejas registradas.');
            let texto = '💞 *LISTA DE PAREJAS* 💞\n\n';
            for (let [id, par] of Object.entries(parejas)) {
                texto += `💍 @${par[0].split('@')[0]} ❤️ @${par[1].split('@')[0]}\n`;
            }
            await conn.reply(m.chat, texto, m, { mentions: participants.map(p => p.id) });
            break;
        }

        case 'divorce': {
            const parejaExistente = Object.entries(parejas).find(([id, par]) => par.includes(sender));
            if (!parejaExistente) return m.reply('💔 No tienes pareja actualmente.');
            delete parejas[parejaExistente[0]];
            await m.reply('💔 Has terminado tu relación. 😢');
            break;
        }

        case 'pareja': {
            const parejaActual = Object.values(parejas).find(p => p.includes(sender));
            if (!parejaActual) return m.reply('💔 No tienes pareja actualmente.');
            const pareja = parejaActual.find(p => p !== sender);
            await conn.reply(
                m.chat,
                `💞 Tu pareja actual es @${pareja.split('@')[0]} ❤️`,
                m,
                { mentions: [pareja] }
            );
            break;
        }
    }
};
handler.help = ['marry @usuario', 'listap', 'divorce', 'pareja'];
handler.tags = ['parejas'];
handler.command = /^(marry|listap|divorce|pareja)$/i;
export default handler;

// ✅ SISTEMA DE RESPUESTA A PROPUESTAS
handler.before = async (m, { conn }) => {
    if (!m.quoted) return !1;
    if (!m.text) return !1;

    global.db.data.parejas = parejas;
    global.db.data.propuestas = propuestas;

    const respuesta = m.text.trim().toLowerCase();
    const quienResponde = m.sender;
    const quienPropuso = propuestas[quienResponde];

    if (!quienPropuso) return !1;

    // ACEPTAR PROPUESTA
    if (['sí', 'si'].includes(respuesta)) {
        const idPareja = `${quienPropuso}_${quienResponde}`;
        parejas[idPareja] = [quienPropuso, quienResponde];
        delete propuestas[quienResponde];

        await conn.reply(
            m.chat,
            `💍 ¡Felicitaciones! 🎉\n@${quienPropuso.split('@')[0]} y @${quienResponde.split('@')[0]} ahora son pareja ❤️`,
            m,
            { mentions: [quienPropuso, quienResponde] }
        );
        return !0;
    }

    // RECHAZAR PROPUESTA
    if (['no'].includes(respuesta)) {
        delete propuestas[quienResponde];
        await conn.reply(
            m.chat,
            `💔 @${quienResponde.split('@')[0]} rechazó la propuesta de @${quienPropuso.split('@')[0]}.`,
            m,
            { mentions: [quienResponde, quienPropuso] }
        );
        return !0;
    }

    return !1;
};

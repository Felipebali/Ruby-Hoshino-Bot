// plugins/parejas.js
const handler = async (m, { conn, text, participants, command }) => {
    global.db.data.parejas = global.db.data.parejas || {};
    global.db.data.propuestas = global.db.data.propuestas || {};

    const parejas = global.db.data.parejas;
    const propuestas = global.db.data.propuestas;
    const sender = m.sender;
    const mentioned = m.mentionedJid && m.mentionedJid[0];

    switch (command) {
        case 'marry': {
            if (!mentioned) return m.reply('💍 *Usa:* .marry @usuario');
            if (mentioned === sender) return m.reply('❗ No puedes casarte contigo mismo.');

            // Verificar si alguno ya tiene pareja
            const parejaSender = Object.values(parejas).find(p => p.includes(sender));
            const parejaMentioned = Object.values(parejas).find(p => p.includes(mentioned));

            if (parejaSender) return m.reply('❤️ Ya tienes pareja. Usa .divorce si quieres terminar.');
            if (parejaMentioned) return m.reply('💔 Esa persona ya está en pareja.');

            // Registrar propuesta
            propuestas[mentioned] = sender;
            await conn.reply(
                m.chat,
                `💞 @${sender.split('@')[0]} le propuso matrimonio a @${mentioned.split('@')[0]} 💍\n\n@${mentioned.split('@')[0]}, responde citando este mensaje con *sí* o *no*.`,
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
            m.reply(texto, null, { mentions: participants.map(p => p.id) });
            break;
        }

        case 'divorce': {
            const parejaExistente = Object.entries(parejas).find(([id, par]) => par.includes(sender));
            if (!parejaExistente) return m.reply('💔 No tienes pareja actualmente.');
            delete parejas[parejaExistente[0]];
            m.reply('💔 Has terminado tu relación. 😢');
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

// 📌 Sistema de aceptación / rechazo de propuesta
export async function before(m, { conn }) {
    if (!m.quoted) return;
    global.db.data.parejas = global.db.data.parejas || {};
    global.db.data.propuestas = global.db.data.propuestas || {};

    const propuestas = global.db.data.propuestas;
    const parejas = global.db.data.parejas;
    const proponente = propuestas[m.sender];

    if (!proponente) return;

    const text = m.text.trim().toLowerCase();
    if (text === 'sí' || text === 'si') {
        const idPareja = `${proponente}_${m.sender}`;
        parejas[idPareja] = [proponente, m.sender];
        delete propuestas[m.sender];

        await conn.reply(
            m.chat,
            `💍 ¡Felicitaciones! 🎉\n@${proponente.split('@')[0]} y @${m.sender.split('@')[0]} ahora son pareja ❤️`,
            m,
            { mentions: [proponente, m.sender] }
        );
    } else if (text === 'no') {
        delete propuestas[m.sender];
        await conn.reply(
            m.chat,
            `💔 @${m.sender.split('@')[0]} rechazó la propuesta de @${proponente.split('@')[0]}.`,
            m,
            { mentions: [m.sender, proponente] }
        );
    }
    return !0;
}

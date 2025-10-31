// plugins/parejas.js

global.db.data.parejas = global.db.data.parejas || {};
global.db.data.propuestas = global.db.data.propuestas || {};

const handler = async (m, { conn, text, command }) => {
    const sender = m.sender;
    const parejas = global.db.data.parejas;
    const propuestas = global.db.data.propuestas;
    const mentioned = m.mentionedJid && m.mentionedJid[0];

    switch (command) {
        // 💍 Proponer matrimonio
        case 'marry': {
            if (!mentioned) return m.reply('💍 *Usa:* .marry @usuario');
            if (mentioned === sender) return m.reply('❗ No puedes casarte contigo mismo.');

            const yaTiene = Object.values(parejas).find(p => p.includes(sender));
            const suPareja = Object.values(parejas).find(p => p.includes(mentioned));
            if (yaTiene) return m.reply('❤️ Ya tienes pareja. Usa .divorce para terminar.');
            if (suPareja) return m.reply('💔 Esa persona ya está en pareja.');

            propuestas[mentioned] = sender;

            await conn.sendMessage(
                m.chat,
                {
                    text: `💞 @${sender.split('@')[0]} le propuso matrimonio a @${mentioned.split('@')[0]} 💍\n\n@${mentioned.split('@')[0]}, puedes responder con:\n\n✅ *.aceptar* para aceptar\n❌ *.rechazar* para rechazar`,
                    mentions: [sender, mentioned],
                },
                { quoted: m }
            );
            break;
        }

        // 💞 Ver lista de parejas
        case 'listap': {
            if (Object.keys(parejas).length === 0) return m.reply('💔 No hay parejas registradas.');
            let texto = '💞 *LISTA DE PAREJAS* 💞\n\n';
            for (let [id, par] of Object.entries(parejas)) {
                texto += `💍 @${par[0].split('@')[0]} ❤️ @${par[1].split('@')[0]}\n`;
            }
            await conn.sendMessage(m.chat, { text: texto, mentions: Object.values(parejas).flat() });
            break;
        }

        // ❤️ Ver tu pareja actual
        case 'pareja': {
            const pareja = Object.values(parejas).find(p => p.includes(sender));
            if (!pareja) return m.reply('💔 No tienes pareja actualmente.');
            const parejaDe = pareja.find(p => p !== sender);
            await conn.sendMessage(
                m.chat,
                { text: `💞 Tu pareja actual es @${parejaDe.split('@')[0]} ❤️`, mentions: [parejaDe] },
                { quoted: m }
            );
            break;
        }

        // 💔 Terminar relación
        case 'divorce': {
            const parejaExistente = Object.entries(parejas).find(([id, par]) => par.includes(sender));
            if (!parejaExistente) return m.reply('💔 No tienes pareja actualmente.');
            delete parejas[parejaExistente[0]];
            await m.reply('💔 Has terminado tu relación.');
            break;
        }

        // ✅ Aceptar propuesta
        case 'aceptar': {
            const quienResponde = sender;
            const quienPropuso = propuestas[quienResponde];
            if (!quienPropuso) return m.reply('❗ No tienes ninguna propuesta pendiente.');

            const id = `${quienPropuso}_${quienResponde}`;
            parejas[id] = [quienPropuso, quienResponde];
            delete propuestas[quienResponde];

            await conn.sendMessage(
                m.chat,
                {
                    text: `💍 ¡Felicitaciones! 🎉\n@${quienPropuso.split('@')[0]} y @${quienResponde.split('@')[0]} ahora son pareja ❤️`,
                    mentions: [quienPropuso, quienResponde],
                },
                { quoted: m }
            );
            break;
        }

        // ❌ Rechazar propuesta
        case 'rechazar': {
            const quienResponde = sender;
            const quienPropuso = propuestas[quienResponde];
            if (!quienPropuso) return m.reply('❗ No tienes ninguna propuesta pendiente.');

            delete propuestas[quienResponde];
            await conn.sendMessage(
                m.chat,
                {
                    text: `💔 @${quienResponde.split('@')[0]} rechazó la propuesta de @${quienPropuso.split('@')[0]}.`,
                    mentions: [quienResponde, quienPropuso],
                },
                { quoted: m }
            );
            break;
        }
    }
};

handler.help = ['marry @usuario', 'aceptar', 'rechazar', 'listap', 'pareja', 'divorce'];
handler.tags = ['parejas'];
handler.command = /^(marry|aceptar|rechazar|listap|pareja|divorce)$/i;
export default handler;

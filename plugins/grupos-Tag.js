// 🐾 plugins/grupos-Tag.js — FelixCat_Bot
// Comando: .tag
// Función: Etiquetar a todo el grupo con texto o con media citada
// Estilo Feli 💀: limpio, directo y con manejo sólido de errores

import baileys from '@whiskeysockets/baileys';
const { generateWAMessageFromContent } = baileys;

const handler = async (m, { conn, text, participants }) => {
  try {
    const users = participants.map(u => conn.decodeJid(u.id));
    const quoted = m.quoted ? m.quoted : m;
    const raw = m.quoted ? await m.getQuotedObj() : m.msg || m.text || m.sender;

    // --- Construcción del mensaje "cMod" estilo Feli ---
    const msg = conn.cMod(
      m.chat,
      generateWAMessageFromContent(
        m.chat,
        {
          [m.quoted ? quoted.mtype : 'extendedTextMessage']: (
            m.quoted ? raw.message[quoted.mtype] : { text: raw }
          )
        },
        { userJid: conn.user.id }
      ),
      text || quoted?.text || ' ',
      conn.user.id,
      { mentions: users }
    );

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

  } catch (e) {
    console.log('Error en tag:', e);

    const users = participants.map(u => conn.decodeJid(u.id));
    const quoted = m.quoted ? m.quoted : m;

    const mime = (quoted.msg || quoted).mimetype || '';
    const isMedia = /image|video|audio|sticker/.test(mime);

    const invisible = String.fromCharCode(8206).repeat(900);
    const caption = text || '🐉 *Debes escribir algo para hacer un tag.*';

    // --- MEDIA ---
    if (isMedia && quoted.mtype === 'imageMessage') {
      const img = await quoted.download();
      return conn.sendMessage(m.chat, { image: img, caption, mentions: users });
    }

    if (isMedia && quoted.mtype === 'videoMessage') {
      const vid = await quoted.download();
      return conn.sendMessage(m.chat, {
        video: vid,
        mimetype: 'video/mp4',
        caption,
        mentions: users
      });
    }

    if (isMedia && quoted.mtype === 'audioMessage') {
      const aud = await quoted.download();
      return conn.sendMessage(m.chat, {
        audio: aud,
        mimetype: 'audio/mpeg',
        fileName: 'TagAudio.mp3',
        mentions: users
      });
    }

    if (isMedia && quoted.mtype === 'stickerMessage') {
      const stk = await quoted.download();
      return conn.sendMessage(m.chat, { sticker: stk, mentions: users });
    }

    // --- TEXTO PURO ---
    await conn.relayMessage(
      m.chat,
      {
        extendedTextMessage: {
          text: `${invisible}\n${caption}\n`,
          contextInfo: {
            mentionedJid: users
          }
        }
      },
      {}
    );
  }
};

// Metadata
handler.help = ['tag'];
handler.tags = ['grupo'];
handler.command = ['tag'];
handler.group = true;
handler.admin = true;

export default handler;

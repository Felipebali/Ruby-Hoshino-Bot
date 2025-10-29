import axios from 'axios';

let handler = async (m, { conn, args }) => {
  if (!args || !args[0]) {
    return conn.sendMessage(m.chat, { text: '⚠️ Usa: `.tt @usuario`' }, { quoted: m });
  }

  const username = args[0].replace('@', '').trim();

  try {
    // 🔹 Traer perfil de TikTok desde API pública
    const resp = await axios.get(`https://api.akuari.my.id/search/tiktok-user?user=${username}`);
    const user = resp.data?.result;

    if (!user) throw new Error('Usuario no encontrado');

    // 🔹 Estado actual
    const current = {
      username: user.username,
      followers: parseInt(user.followers.replace(/,/g,'')),
      following: parseInt(user.following.replace(/,/g,'')),
      total_likes: parseInt(user.likes.replace(/,/g,'')),
      last_video_id: user.last_video_id || '',
      bio: user.bio || ''
    };

    // 🔹 Base de datos interna
    if (!global.db.tt) global.db.tt = {};
    const prev = global.db.tt[username] || {};

    let changes = [];

    // 🔹 Comparar seguidores
    if (prev.followers && current.followers > prev.followers) {
      changes.push(`📈 Nuevos seguidores: +${current.followers - prev.followers}`);
    }

    // 🔹 Comparar último video
    if (prev.last_video_id && current.last_video_id !== prev.last_video_id) {
      changes.push(`🎬 Nuevo video publicado`);
    }

    // 🔹 Actualizar DB
    global.db.tt[username] = current;

    // 🔹 Mensaje de resultado
    const msgs = [
      `👤 Usuario: ${current.username}`,
      `📝 Bio: ${current.bio}`,
      `📦 Seguidores: ${current.followers}`,
      `📦 Siguiendo: ${current.following}`,
      `❤️ Likes: ${current.total_likes}`,
      ...changes.length ? ['\n⚡ Cambios recientes:', ...changes] : []
    ].join('\n');

    await conn.sendMessage(m.chat, {
      text: msgs,
      ...(user.avatar && { image: { url: user.avatar } })
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, { text: '❌ No pude obtener información del perfil de TikTok.' }, { quoted: m });
  }
};

handler.help = ['tt <usuario>'];
handler.tags = ['downloader'];
handler.command = ['tt'];

export default handler;

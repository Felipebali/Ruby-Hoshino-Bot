// 📂 plugins/_sortear.js
/**
 * Comando: .sortear
 * Solo para dueños 👑
 * Sortea uno o varios premios entre los participantes del grupo
 * Autor: Feli 💀
 */

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // dueños del bot

const handler = async (m, { conn, args, groupMetadata }) => {
  try {
    if (!m.isGroup) return; // Solo en grupos
    if (!ownerNumbers.includes(m.sender)) return; // Solo dueños

    // Obtener todos los participantes del grupo
    const participants = groupMetadata?.participants?.map(p => p.id) || [];
    if (participants.length === 0) return conn.reply(m.chat, '⚠️ No hay participantes en el grupo.', m);

    // Si no se especificaron premios
    if (args.length === 0) return conn.reply(m.chat, '💡 Usa el comando así:\n*.sortear premio1 premio2 ...*\nEjemplo:\n.sortear licuadora auriculares taza', m);

    // Lista de premios
    const premios = args;

    // Mezclamos aleatoriamente los participantes
    const shuffled = [...participants].sort(() => Math.random() - 0.5);

    // Cantidad de ganadores = cantidad de premios, o el total de participantes si hay menos
    const numGanadores = Math.min(premios.length, participants.length);

    const ganadores = shuffled.slice(0, numGanadores);

    // Crear texto del resultado
    let resultado = `🎉 *¡Sorteo completado!* 🎉\n\n`;
    ganadores.forEach((jid, i) => {
      const premio = premios[i];
      resultado += `🏆 *${premio.toUpperCase()}* → @${jid.split('@')[0]}\n`;
    });

    // Si sobran premios o participantes
    if (premios.length > ganadores.length) {
      resultado += `\n🎁 *Premios sin asignar:* ${premios.slice(ganadores.length).join(', ')}`;
    }

    await conn.sendMessage(m.chat, {
      text: resultado.trim(),
      mentions: ganadores
    });
  } catch (err) {
    console.error('Error en sortear:', err);
    conn.reply(m.chat, '❌ Hubo un error al realizar el sorteo.', m);
  }
};

handler.help = ['sortear'];
handler.tags = ['owner'];
handler.command = ['sortear'];
handler.group = true;
handler.rowner = true; // Solo dueños del bot

export default handler;

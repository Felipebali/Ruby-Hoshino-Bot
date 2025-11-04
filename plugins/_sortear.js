// plugins/_sortear.js
/**
 * Comando: .sortear
 * Solo para dueños 👑
 * Sortea uno o varios ganadores entre los participantes del grupo
 * Autor: Feli 💀
 */

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // dueños del bot

const handler = async (m, { conn, args, groupMetadata }) => {
  try {
    if (!m.isGroup) return; // No hace nada fuera de grupos

    // --- Verificar si el usuario es owner ---
    if (!ownerNumbers.includes(m.sender)) return; // Silencioso, no responde

    // Obtener todos los participantes del grupo
    const participants = groupMetadata?.participants?.map(p => p.id) || [];
    if (participants.length === 0) return;

    // Número de ganadores (por defecto 1)
    const num = args[0] && !isNaN(args[0]) ? Math.min(parseInt(args[0]), participants.length) : 1;

    // Si mencionaron usuarios, sortea solo entre esos
    const pool = m.mentionedJid?.length > 0 ? m.mentionedJid : participants;
    if (pool.length < num) return;

    // Mezclar lista y elegir ganadores
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const winners = shuffled.slice(0, num);

    // Formar texto con los ganadores
    const text = winners.map((jid, i) => `🏆 Ganador ${i + 1}: @${jid.split('@')[0]}`).join('\n');

    // Enviar resultado
    await conn.sendMessage(m.chat, {
      text: `🎉 *¡Sorteo terminado!* 🎉\n\n${text}`,
      mentions: winners
    });
  } catch (err) {
    console.error('Error en sortear:', err);
  }
};

handler.help = ['sortear'];
handler.tags = ['owner'];
handler.command = ['sortear'];
handler.group = true;
handler.rowner = true; // Solo dueños del bot

export default handler;

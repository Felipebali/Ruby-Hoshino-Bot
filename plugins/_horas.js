// 🐾 plugins/autoHorarioGrupo.js — FelixCat_Bot 🕒 Control por hora exacta
import schedule from 'node-schedule'

let handler = async (m, { conn, command, args, isAdmin }) => {
  if (!isAdmin) return m.reply('⚠️ Solo los administradores pueden usar este comando.');

  if (!args[0]) return m.reply(`⏰ Uso correcto:\n\n.${command} HH:MM:SS\n\nEjemplo:\n.${command} 22:30:00`);

  const hora = args[0];
  const [h, min, seg] = hora.split(':').map(n => parseInt(n));
  if (isNaN(h) || isNaN(min) || isNaN(seg)) return m.reply('❌ Hora inválida. Usa el formato HH:MM:SS');

  const fechaActual = new Date();
  const fechaEjecucion = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), fechaActual.getDate(), h, min, seg);

  // Si la hora ya pasó hoy, se programa para mañana
  if (fechaEjecucion < fechaActual) fechaEjecucion.setDate(fechaEjecucion.getDate() + 1);

  const accion = command === 'abrir' ? 'abrir' : 'cerrar';
  const textoConfirm = accion === 'abrir'
    ? `🕓 Grupo programado para *abrirse* a las ${hora}`
    : `🕒 Grupo programado para *cerrarse* a las ${hora}`;
  await m.reply(textoConfirm);

  schedule.scheduleJob(fechaEjecucion, async () => {
    try {
      await conn.groupSettingUpdate(m.chat, accion === 'abrir' ? 'not_announcement' : 'announcement');
      await conn.sendMessage(m.chat, { text: `✅ El grupo fue ${accion === 'abrir' ? 'abierto' : 'cerrado'} automáticamente a las ${hora}` });
    } catch (e) {
      console.error(e);
      await conn.sendMessage(m.chat, { text: `❌ Error al intentar ${accion} el grupo.` });
    }
  });
}

handler.command = ['abrir', 'cerrar'];
handler.group = true;

export default handler;

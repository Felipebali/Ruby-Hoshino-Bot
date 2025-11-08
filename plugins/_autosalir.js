// 🐾 FelixCat_Bot - AutoKick si no es admin (con log)
import { delay } from '@whiskeysockets/baileys'

let handler = async (update, { conn }) => {
  try {
    const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net'

    // 📥 Si el bot entra al grupo
    if (update.action === 'add' && update.participants.includes(botNumber)) {
      await conn.sendMessage(update.id, { text: '👋 ¡Hola! Si no soy admin en 1 minuto, me autokickeo 😿' });
      await delay(60000);

      const group = await conn.groupMetadata(update.id);
      const botInfo = group.participants.find(p => p.id === botNumber);

      if (!botInfo?.admin) {
        await conn.sendMessage(update.id, { text: '😿 No soy admin, así que me autokickeo...' });

        // Log visible en consola
        console.log(`[FelixCat_Bot] Me autokickeo del grupo ${group.subject} (${update.id}) por no tener admin.`);

        // Intento de autoexpulsión
        await conn.groupParticipantsUpdate(update.id, [botNumber], 'remove');

      } else {
        await conn.sendMessage(update.id, { text: '😸 ¡Perfecto! Tengo permisos de admin.' });
        console.log(`[FelixCat_Bot] Tengo admin en ${group.subject}.`);
      }
    }

    // 👑 Si lo degradan (demote)
    if (update.action === 'demote' && update.participants.includes(botNumber)) {
      await conn.sendMessage(update.id, { text: '😿 Me quitaron el admin, procedo a autokickearme...' });
      console.log(`[FelixCat_Bot] Fui degradado en ${update.id}, autokick ejecutado.`);
      await delay(3000);
      await conn.groupParticipantsUpdate(update.id, [botNumber], 'remove');
    }

  } catch (err) {
    console.error('Error en autokick.js:', err);
  }
};

handler.event = 'group-participants.update';
export default handler;

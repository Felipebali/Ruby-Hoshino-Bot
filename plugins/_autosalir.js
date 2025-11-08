// 🐾 FelixCat_Bot - AutoSalir si no es admin o si lo degradan
import { delay } from '@whiskeysockets/baileys'

let handler = async (update, { conn }) => {
  try {
    const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net'

    // 💬 Cuando el bot es agregado a un grupo
    if (update.action === 'add' && update.participants.includes(botNumber)) {
      await conn.sendMessage(update.id, { text: '👋 ¡Hola! Acabo de unirme. Si no soy admin en 1 minuto, me voy 😿' });

      // Esperar 1 minuto (60000 ms)
      await delay(60000);

      const metadata = await conn.groupMetadata(update.id);
      const botInfo = metadata.participants.find(p => p.id === botNumber);

      if (!botInfo?.admin) {
        await conn.sendMessage(update.id, { text: '😿 No me dieron permisos de admin, así que me retiro. ¡Hasta pronto!' });
        await conn.groupLeave(update.id);
      } else {
        await conn.sendMessage(update.id, { text: '😸 ¡Gracias por hacerme admin! Me quedaré en el grupo 🎉' });
      }
    }

    // 👑 Detectar si lo degradan (pierde admin)
    if (update.action === 'demote' && update.participants.includes(botNumber)) {
      await conn.sendMessage(update.id, { text: '😿 Me quitaron el admin, así que debo irme. ¡Hasta luego!' });
      await delay(3000);
      await conn.groupLeave(update.id);
    }

  } catch (err) {
    console.error('Error en autosalir.js:', err);
  }
};

handler.event = 'group-participants.update';
export default handler; 

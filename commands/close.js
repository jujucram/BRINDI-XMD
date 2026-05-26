const isAdmin = require('../lib/isAdmin');

async function closeCommand(sock, chatId, senderId, message) {
    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, { text: '❌ *Uniquement dans les groupes !*\n> BRINDI-XMD' }, { quoted: message });
    }

    try {
        // Verrouille le groupe : seuls les admins peuvent envoyer des messages
        await sock.groupSettingUpdate(chatId, 'announcement');
        const meta = await sock.groupMetadata(chatId);

        await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `👥 *${meta.subject}*\n\n🔒 *Statut :* Fermé\n👑 _Seuls les admins peuvent désormais écrire._\n📅 _Fermé par :_ @${senderId.split('@')[0]}\n\n> Pour rouvrir : .open\n> BRINDI-XMD`,
            mentions: [senderId]
        }, { quoted: message });
    } catch (e) {
        console.error('❌ [close]', e.message);
        await sock.sendMessage(chatId, { text: '❌ *Impossible de fermer le groupe.*\n_Vérifiez que le bot est bien administrateur._\n> BRINDI-XMD' }, { quoted: message });
    }
}

module.exports = closeCommand;

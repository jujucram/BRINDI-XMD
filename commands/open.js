const isAdmin = require('../lib/isAdmin');

async function openCommand(sock, chatId, senderId, message) {
    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, { text: '❌ *Uniquement dans les groupes !*\n> BRINDI-XMD', }, { quoted: message });
    }

    try {
        // Déverrouille le groupe : tout le monde peut envoyer
        await sock.groupSettingUpdate(chatId, 'not_announcement');
        const meta = await sock.groupMetadata(chatId);

        await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `🔓 *GROUPE OUVERT*\n\nLe groupe est désormais ouvert à tous les membres.\n> BRINDI-XMD`,
            mentions: [senderId]
        }, { quoted: message });
    } catch (e) {
        console.error('❌ [open]', e.message);
        await sock.sendMessage(chatId, { text: '❌ *Impossible d\'ouvrir le groupe.*\n_Vérifiez les permissions du bot._\n> BRINDI-XMD', }, { quoted: message });
    }
}

module.exports = openCommand;

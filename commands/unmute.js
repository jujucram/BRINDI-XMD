const isAdmin = require('../lib/isAdmin');

async function unmuteCommand(sock, chatId, senderId, message) {
    const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

    if (!isSenderAdmin) {
        await sock.sendMessage(chatId, {
            text: `❌ *Commande réservée aux admins !*\nSeuls les admins peuvent utiliser *.unmute*`
        }, { quoted: message });
        return;
    }

    if (!isBotAdmin) {
        await sock.sendMessage(chatId, {
            text: `❌ *Le bot doit être admin pour utiliser cette commande !*`
        }, { quoted: message });
        return;
    }

    try {
        // Annuler le timer automatique si existant
        const { muteTimers } = require('./mute');
        if (muteTimers[chatId]) {
            clearTimeout(muteTimers[chatId]);
            delete muteTimers[chatId];
        }

        // Rouvrir le groupe
        await sock.groupSettingUpdate(chatId, 'not_announcement');

        await sock.sendMessage(chatId, {
            text: `╭━━━━━━━━━━━━━━━━━━━━━━╮\n┃   🔊 *GROUPE ROUVERT* 🔊   ┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n✅ Le groupe est maintenant ouvert !\n💬 Tout le monde peut écrire à nouveau.\n\n> _Powered by Brandon_`
        }, { quoted: message });

    } catch (error) {
        console.error('Error in unmute command:', error);
        await sock.sendMessage(chatId, {
            text: `❌ *Erreur lors du unmute !*\nVérifie que le bot est bien admin.`
        }, { quoted: message });
    }
}

module.exports = unmuteCommand;

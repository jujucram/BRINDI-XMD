const isAdmin = require('../lib/isAdmin');

// Stocker les timers actifs pour pouvoir les annuler
const muteTimers = {};

async function muteCommand(sock, chatId, senderId, message, durationInMinutes) {
    const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

    if (!isSenderAdmin) {
        await sock.sendMessage(chatId, {
            text: `❌ *Commande réservée aux admins !*\nSeuls les admins peuvent utiliser *.mute*`
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
        // Fermer le groupe
        await sock.groupSettingUpdate(chatId, 'announcement');

        // Annuler un timer précédent si existant
        if (muteTimers[chatId]) {
            clearTimeout(muteTimers[chatId]);
            delete muteTimers[chatId];
        }

        if (durationInMinutes && durationInMinutes > 0) {
            const reopenTime = new Date(Date.now() + durationInMinutes * 60 * 1000);
            const reopenStr = reopenTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

            await sock.sendMessage(chatId, {
                text: `╭━━━━━━━━━━━━━━━━━━━━━━╮\n┃   🔇 *GROUPE MUTÉ* 🔇      ┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n⏳ *Durée :* ${durationInMinutes} minute(s)\n🕐 *Réouverture à :* ${reopenStr}\n\n❌ Personne ne peut écrire pendant ce temps.\n✅ Le groupe se réouvre automatiquement.\n\n> _Tapez .unmute pour rouvrir manuellement_`
            }, { quoted: message });

            // Timer pour démuter automatiquement
            muteTimers[chatId] = setTimeout(async () => {
                try {
                    await sock.groupSettingUpdate(chatId, 'not_announcement');
                    await sock.sendMessage(chatId, {
                        text: `╭━━━━━━━━━━━━━━━━━━━━━━╮\n┃   🔊 *GROUPE ROUVERT* 🔊   ┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n✅ Le mute de *${durationInMinutes} minute(s)* est terminé !\n💬 Tout le monde peut maintenant écrire.\n\n> _Powered by Brandon_`
                    });
                    delete muteTimers[chatId];
                } catch (err) {
                    console.error('Auto-unmute error:', err);
                }
            }, durationInMinutes * 60 * 1000);

        } else {
            await sock.sendMessage(chatId, {
                text: `╭━━━━━━━━━━━━━━━━━━━━━━╮\n┃   🔇 *GROUPE MUTÉ* 🔇      ┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n❌ Le groupe est maintenant fermé.\n👑 Seuls les admins peuvent écrire.\n\n> _Tapez .unmute pour rouvrir_`
            }, { quoted: message });
        }

    } catch (error) {
        console.error('Error in mute command:', error);
        await sock.sendMessage(chatId, {
            text: `❌ *Erreur lors du mute !*\nVérifie que le bot est bien admin.`
        }, { quoted: message });
    }
}

module.exports = muteCommand;
module.exports.muteTimers = muteTimers;

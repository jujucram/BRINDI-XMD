const { setAntilink, getAntilink, removeAntilink } = require('../lib/index');

async function handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        const prefix = '.';
        const args = userMessage.slice(9).toLowerCase().trim().split(' ');
        const action = args[0];

        if (!action) {
            const existing = await getAntilink(chatId, 'on');
            const current = existing?.enabled ? '🟢 Activé' : '🔴 Désactivé';
            return await sock.sendMessage(chatId, {
                image: { url: './assets/IMG-20240812-WA0097.jpg' },
                caption: `📊 *Statut :* ${current}\n\n📌 *Commandes :*\n• ${prefix}antilink on\n• ${prefix}antilink off\n• ${prefix}antilink set delete\n• ${prefix}antilink set kick\n• ${prefix}antilink set warn\n> BRINDI-XMD`,
            }, { quoted: message });
        }

        switch (action) {
            case 'on': {
                const existing = await getAntilink(chatId, 'on');
                if (existing?.enabled) {
                    return await sock.sendMessage(chatId, { text: `⚠️ *Anti-Lien est déjà activé !*\n> BRINDI-XMD` }, { quoted: message });
                }
                await setAntilink(chatId, 'on', 'delete');
                return await sock.sendMessage(chatId, { text: `🔗 *Anti-Lien :* 🟢 Activé\n\n_Tous les liens seront supprimés._\n> BRINDI-XMD` }, { quoted: message });
            }
            case 'off': {
                await removeAntilink(chatId, 'on');
                return await sock.sendMessage(chatId, { text: `🔗 *Anti-Lien :* 🔴 Désactivé\n> BRINDI-XMD`,}, { quoted: message });
            }
            case 'set': {
                const setAction = args[1];
                if (!['delete', 'kick', 'warn'].includes(setAction)) {
                    return await sock.sendMessage(chatId, { text: `❌ *Action invalide !*\nChoisissez : delete | kick | warn\n> BRINDI-XMD` }, { quoted: message });
                }
                await setAntilink(chatId, 'on', setAction);
                return await sock.sendMessage(chatId, { text: `✅ *Action anti-lien :* ${setAction}\n> BRINDI-XMD` }, { quoted: message });
            }
            default:
                return await sock.sendMessage(chatId, { text: `❌ *Commande inconnue.*\nUsage : .antilink on | off | set delete/kick/warn\n> BRINDI-XMD`,}, { quoted: message });
        }
    } catch (e) {
        console.error('❌ [antilink]', e.message);
        await sock.sendMessage(chatId, { text: `❌ *Erreur :* ${e.message}\n> BRINDI-XMD`, }, { quoted: message });
    }
}

module.exports = { handleAntilinkCommand };

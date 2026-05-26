const settings = require('../settings');

const BOT_IMAGE = './assets/IMG-20240812-WA0097.jpg';

function formatUptime(s) {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${d > 0 ? d + 'j ' : ''}${h}h ${m}m`;
}

async function aliveCommand(sock, chatId, message) {
    try {
        const uptime = formatUptime(Math.floor(process.uptime()));
        const ram = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);

        const caption = `💚 *OUI JE SUIS VIVANT !*\n\n✅ *Statut :* En ligne\n⏱️ *Uptime :* ${uptime}\n📦 *Version :* v${settings.version}\n🌍 *Mode :* ${settings.commandMode || 'Private'}\n👤 *Owner :* ${settings.botOwner}\n💾 *RAM :* ${ram} MB\n\n💡 Tape *${settings.prefix}menu* pour voir les commandes.\n> BRINDI-XMD`;

        await sock.sendMessage(chatId, {
            image: { url: BOT_IMAGE },
            caption,
        }, { quoted: message });

    } catch (e) {
        console.error('❌ [alive]', e.message);
        await sock.sendMessage(chatId, {
            text: `✅ *BRINDI-𝗫𝗠𝗗 v${settings.version}* est en ligne !\n💡 Tape *${settings.prefix}menu* pour les commandes.\n> BRINDI-XMD`,
        }, { quoted: message });
    }
}

module.exports = aliveCommand;

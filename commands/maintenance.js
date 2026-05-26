// maintenance.js — ITACHI-XMD-V2
let maintenanceMode = false;

async function maintenanceCommand(sock, chatId, message, args, isOwner) {
    if (!isOwner) {
        return sock.sendMessage(chatId, { text: '❌ Réservé au propriétaire du bot.' }, { quoted: message });
    }

    const arg = args[0]?.toLowerCase();
    if (!arg || !['on', 'off'].includes(arg)) {
        return sock.sendMessage(chatId, { text: '❌ Usage: .maintenance on | .maintenance off' }, { quoted: message });
    }

    maintenanceMode = arg === 'on';

    await sock.sendMessage(chatId, {
        image: { url: './assets/IMG-20240812-WA0097.jpg' },
        caption: maintenanceMode
            ? `🔧 *MODE MAINTENANCE ACTIVÉ*\n\n⚠️ Le bot est temporairement en maintenance.\nSeul le propriétaire peut utiliser les commandes.\n\n> 🥷 Brandon`
            : `✅ *MAINTENANCE TERMINÉE*\n\nLe bot est de nouveau opérationnel !\nTout le monde peut utiliser les commandes.\n\n> 🥷 Brandon`
    }, { quoted: message });
}

function isInMaintenance() { return maintenanceMode; }
module.exports = { maintenanceCommand, isInMaintenance };

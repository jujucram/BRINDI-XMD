const os = require('os');

function formatUptime(sec) {
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    const parts = [];
    if (d) parts.push(`${d}j`);
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
}

async function uptimeCommand(sock, chatId, message) {
    try {
        const uptime = Math.floor(process.uptime());

        await sock.sendMessage(chatId, {
            text: `⏱️ En ligne depuis : ${formatUptime(uptime)}✨\n> BRINDI-XMD`
        }, { quoted: message });

    } catch (e) {
        console.error('[UPTIME ERROR]', e.message);
    }
}

module.exports = uptimeCommand;

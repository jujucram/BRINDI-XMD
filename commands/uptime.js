const os = require('os');
const settings = require('../settings');


function formatUptime(sec) {
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    const parts = [];
    if (d) parts.push(`${d} jour${d > 1 ? 's' : ''}`);
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
}

function getBar(pct, len = 14) {
    const f = Math.round((Math.min(100, pct) / 100) * len);
    return '█'.repeat(f) + '░'.repeat(len - f);
}

async function uptimeCommand(sock, chatId, message) {
    const uptime = Math.floor(process.uptime());
    const mem = process.memoryUsage();
    const ramUsedMB = (mem.rss / 1024 / 1024).toFixed(1);
    const ramTotalMB = (os.totalmem() / 1024 / 1024).toFixed(0);
    const ramPct = ((mem.rss / os.totalmem()) * 100).toFixed(1);
    const heapUsed = (mem.heapUsed / 1024 / 1024).toFixed(1);
    const heapTotal = (mem.heapTotal / 1024 / 1024).toFixed(1);
    const cpu = os.loadavg()[0].toFixed(2);
    const cpuPct = Math.min(100, Math.round(os.loadavg()[0] * 25));
    const platform = os.platform();
    const arch = os.arch();
    const nodeVer = process.version;

    await sock.sendMessage(chatId, {
        image: { url: './assets/IMG-20240812-WA0097.jpg' },
        caption: `⏱️ *STATUS & UPTIME*

⏱️ *Temps en ligne :*
│ 🕐 ${formatUptime(uptime)}

💾 *Mémoire RAM :*
│ Utilisée : ${ramUsedMB} MB / ${ramTotalMB} MB
│ \`[${getBar(parseFloat(ramPct))}]\` ${ramPct}%
│ Heap : ${heapUsed} / ${heapTotal} MB

🖥️ *CPU :*
│ Load : ${cpu}
│ \`[${getBar(cpuPct)}]\` ~${cpuPct}%

🔧 *Système :*
│ 📦 Version : v${settings.version || '1.0'}
│ 🟢 Node.js : ${nodeVer}
│ 💻 OS : ${platform} (${arch})
│ 🧵 CPUs : ${os.cpus().length} cœurs

> BRINDI-XMD`,
        
    }, { quoted: message });
}

module.exports = uptimeCommand;

const fs = require('fs');
const path = require('path');

const themes = [
    { num: 1, url: 'assets/IMG-20240812-WA0097.jpg',                                         label: '🌑 Dark' },
    { num: 2, url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',     label: '🔵 Matrix' },
    { num: 3, url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800',     label: '🟣 Purple Smoke' },
    { num: 4, url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',        label: '🔴 Cyberpunk' },
    { num: 5, url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800',     label: '🌌 Galaxy' },
    { num: 6, url: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800',     label: '🟢 Neon City' },
    { num: 7, url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',     label: '⚡ Tech' },
    { num: 8, url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800',     label: '🤖 Hacker' },
];

const menuImagePath = path.join(__dirname, '../data/menuimage.json');

function setMenuImage(url) {
    try {
        fs.writeFileSync(menuImagePath, JSON.stringify({ url }, null, 2));
        return true;
    } catch { return false; }
}

function getImageSource(url) {
    if (url.startsWith('http')) return { url };
    return fs.readFileSync(path.join(__dirname, '..', url));
}

async function themeCommand(sock, chatId, args, message) {
    const num = parseInt(args[0]);

    if (!num || isNaN(num)) {
        const list = themes.map(t => `${t.num}. ${t.label}`).join('\n');
        return await sock.sendMessage(chatId, {
            image: getImageSource(themes[0].url),
            caption: `🎨 *Thèmes disponibles*\n\n${list}\n\n💡 Usage : *.theme <1-8>*\n\n> BRINDI-XMD`
        }, { quoted: message });
    }

    if (num < 1 || num > 8) {
        return await sock.sendMessage(chatId, {
            text: `❌ Numéro invalide. Choisis entre *1* et *8*.\n\n> BRINDI-XMD`
        }, { quoted: message });
    }

    const selected = themes[num - 1];
    setMenuImage(selected.url);

    return await sock.sendMessage(chatId, {
        image: getImageSource(selected.url),
        caption: `✅ *${selected.label}* appliqué !\n\nTape *.menu* pour vérifier.\n\n> BRINDI-XMD`
    }, { quoted: message });
}

module.exports = themeCommand;

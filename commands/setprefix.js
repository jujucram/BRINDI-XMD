const fs = require('fs');
const path = require('path');

const PREFIX_FILE = path.join(__dirname, '../data/prefix.json');



const VALID_PREFIXES = ['.', '!', '/', '?', '%', '*', 'Ib', 'Bot', '⚡', '🥷', '🚀', '🤖'];

function getCurrentPrefix() {
    try { return JSON.parse(fs.readFileSync(PREFIX_FILE)).prefix || '.'; }
    catch { return '.'; }
}

function savePrefix(p) {
    fs.writeFileSync(PREFIX_FILE, JSON.stringify({ prefix: p }, null, 2));
    if (global.settings) global.settings.prefix = p;
}

async function setprefixCommand(sock, chatId, args, message) {
    const current = getCurrentPrefix();

    if (!args || args.length === 0) {
        const prefixRows = VALID_PREFIXES.map((p, i) => {
            const active = p === current ? ' ✅' : '';
            return `│ ${String(i+1).padStart(2)}. \`${p}\`${active}`;
        }).join('\n');

        return await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `⚙️ *GESTION DU PRÉFIXE*\n\n📌 *Préfixe actuel :* \`${current}\`\n\n🔢 *Préfixes disponibles :*\n${prefixRows}\n\n💡 *Comment changer :*\n│ \`${current}setprefix .\`  → Point\n│ \`${current}setprefix !\`  → Exclamation\n│ \`${current}setprefix /\`  → Slash\n│ \`${current}setprefix ⚡\` → Éclair\n│ \`${current}setprefix 🥷\` → Ninja\n\n> BRINDI-XMD`,
            
        }, { quoted: message });
    }

    const newPrefix = args.join(' ').trim();

    if (!VALID_PREFIXES.includes(newPrefix)) {
        return await sock.sendMessage(chatId, {
            text: `❌ *Préfixe invalide :* \`${newPrefix}\`\n\n📋 *Préfixes valides :*\n${VALID_PREFIXES.map(p => `\`${p}\``).join('  ')}\n\n> BRINDI-XMD`,
        }, { quoted: message });
    }

    if (newPrefix === current) {
        return await sock.sendMessage(chatId, {
            text: `ℹ️ Le préfixe est déjà \`${current}\` !\n\n> BRINDI-XMD`,
            
        }, { quoted: message });
    }

    savePrefix(newPrefix);

    await sock.sendMessage(chatId, {
        image: { url: './assets/IMG-20240812-WA0097.jpg' },
        caption: `✅ *PRÉFIXE CHANGÉ !*\n\n🔄 *Ancien préfixe :* \`${current}\`\n🆕 *Nouveau préfixe :* \`${newPrefix}\`\n\n📋 *Exemples avec le nouveau préfixe :*\n│ ⬡ \`${newPrefix}menu\` → Menu principal\n│ ⬡ \`${newPrefix}help\` → Aide\n│ ⬡ \`${newPrefix}ping\` → Tester le bot\n\n✅ _Le bot répond maintenant avec \`${newPrefix}\`_\n\n> BRINDI-XMD`,
    }, { quoted: message });
}

module.exports = { setprefixCommand, getCurrentPrefix, VALID_PREFIXES };

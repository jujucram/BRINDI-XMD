const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');

const configPath = path.join(__dirname, '../data/antisticker.json');

if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify({}));
function getConfig() { try { return JSON.parse(fs.readFileSync(configPath)); } catch { return {}; } }
function saveConfig(d) { fs.writeFileSync(configPath, JSON.stringify(d, null, 2)); }

async function antistickerCommand(sock, chatId, senderId, args, message) {
    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, { text: '❌ *Uniquement dans les groupes !*\n> BRINDI-XMD', }, { quoted: message });
    }

    const config = getConfig();
    const action = args[0]?.toLowerCase();
    const current = config[chatId]?.enabled ? '🟢 Activé' : '🔴 Désactivé';

    if (!action) {
        return await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `📊 *Statut :* ${current}\n\n📌 *Commandes :*\n• .antisticker on\n• .antisticker off\n\n🛡️ *Fonctionnement :*\nTout sticker envoyé par un non-admin sera supprimé automatiquement.\n> BRINDI-XMD`,
        }, { quoted: message });
    }

    if (action === 'on') {
        if (!config[chatId]) config[chatId] = {};
        config[chatId].enabled = true;
        saveConfig(config);
        return await sock.sendMessage(chatId, {
            text: `🚫 *Anti-Sticker :* 🟢 Activé\n\n_Les stickers des non-admins seront supprimés._\n> BRINDI-XMD`,
        }, { quoted: message });
    }
    if (action === 'off') {
        if (!config[chatId]) config[chatId] = {};
        config[chatId].enabled = false;
        saveConfig(config);
        return await sock.sendMessage(chatId, {
            text: `🚫 *Anti-Sticker :* 🔴 Désactivé\n> BRINDI-XMD`,
        }, { quoted: message });
    }
}

async function handleAntisticker(sock, chatId, senderId, message) {
    const config = getConfig();
    if (!config[chatId]?.enabled) return false;
    const { isSenderAdmin } = await isAdmin(sock, chatId, senderId);
    if (isSenderAdmin) return false;
    try {
        await sock.sendMessage(chatId, { delete: message.key });
        await sock.sendMessage(chatId, {
            text: `🚫 @${senderId.split('@')[0]} les stickers sont interdits dans ce groupe !\n> BRINDI-XMD`,
            mentions: [senderId],
        });
        return true;
    } catch { return false; }
}

module.exports = antistickerCommand;
module.exports.handleAntisticker = handleAntisticker;

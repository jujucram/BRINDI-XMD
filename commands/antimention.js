const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');

const configPath = path.join(__dirname, '../data/antimention.json');

if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify({}));
function getConfig() { try { return JSON.parse(fs.readFileSync(configPath)); } catch { return {}; } }
function saveConfig(d) { fs.writeFileSync(configPath, JSON.stringify(d, null, 2)); }

async function antimentionCommand(sock, chatId, senderId, args, message) {
    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, { text: '❌ *Uniquement dans les groupes !*\n> BRINDI-XMD', }, { quoted: message });
    }

    const config = getConfig();
    const action = args[0]?.toLowerCase();
    const threshold = config[chatId]?.threshold || 5;
    const current = config[chatId]?.enabled ? '🟢 Activé' : '🔴 Désactivé';

    if (!action) {
        return await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `📊 *Statut :* ${current}\n🔢 *Seuil de mentions :* ${threshold}\n\n📌 *Commandes :*\n• .antimention on\n• .antimention off\n• .antimention seuil <nombre>\n  _Définir le nb max de mentions_\n\n🛡️ *Fonctionnement :*\nSi un membre (non-admin) mentionne plus de ${threshold} personnes dans un message, il est supprimé et le membre averti.\n> BRINDI-XMD`,
        }, { quoted: message });
    }

    if (!config[chatId]) config[chatId] = { enabled: false, threshold: 5 };

    if (action === 'on') {
        config[chatId].enabled = true;
        saveConfig(config);
        return await sock.sendMessage(chatId, {
            text: `❌ *Anti-Mention :* 🟢 Activé\n🔢 *Seuil :* ${config[chatId].threshold} mentions max\n\n_Les spams de mentions seront supprimés._\n> BRINDI-XMD`,
        }, { quoted: message });
    }
    if (action === 'off') {
        config[chatId].enabled = false;
        saveConfig(config);
        return await sock.sendMessage(chatId, {
            text: `❌ *Anti-Mention :* 🔴 Désactivé\n> BRINDI-XMD`,
        }, { quoted: message });
    }
    if (action === 'seuil') {
        const num = parseInt(args[1]);
        if (!num || num < 1) return await sock.sendMessage(chatId, { text: '❌ *Seuil invalide !*\n_Ex : .antimention seuil 3_\n> BRINDI-XMD', }, { quoted: message });
        config[chatId].threshold = num;
        saveConfig(config);
        return await sock.sendMessage(chatId, {
            text: `✅ *Seuil mis à jour :* ${num} mentions maximum par message.\n> BRINDI-XMD`,
        }, { quoted: message });
    }
}

// Handler appelé depuis main.js
async function handleAntimention(sock, chatId, senderId, mentionedJids, message) {
    const config = getConfig();
    if (!config[chatId]?.enabled) return false;
    const { isSenderAdmin } = await isAdmin(sock, chatId, senderId);
    if (isSenderAdmin) return false;
    const threshold = config[chatId]?.threshold || 5;
    if (!mentionedJids || mentionedJids.length < threshold) return false;
    try {
        await sock.sendMessage(chatId, { delete: message.key });
        await sock.sendMessage(chatId, {
            text: `⚠️ *Spam de mentions détecté !*\n@${senderId.split('@')[0]} a mentionné *${mentionedJids.length}* membres.\n\n🚫 _Message supprimé automatiquement._\n> BRINDI-XMD`,
            mentions: [senderId],
        });
        return true;
    } catch (e) { return false; }
}

module.exports = antimentionCommand;
module.exports.handleAntimention = handleAntimention;

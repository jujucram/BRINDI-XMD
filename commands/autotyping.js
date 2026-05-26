const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '../data/autotyping.json');

if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify({ enabled: false }));
function getConfig() { try { return JSON.parse(fs.readFileSync(configPath)); } catch { return { enabled: false }; } }
function saveConfig(d) { fs.writeFileSync(configPath, JSON.stringify(d, null, 2)); }

async function autotypingCommand(sock, chatId, message) {
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    const args = text.split(' ').slice(1);
    const config = getConfig();
    const action = args[0]?.toLowerCase();
    const current = config.enabled ? '🟢 Activé' : '🔴 Désactivé';

    if (!action) {
        return await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `📊 *Statut :* ${current}\n\n📌 *Commandes :*\n• .autotyping on\n• .autotyping off\n\nℹ️ Simule l'indicateur *"en train d'écrire..."* avant chaque réponse.\n> BRINDI-XMD`,
        }, { quoted: message });
    }

    config.enabled = action === 'on';
    saveConfig(config);
    const status = action === 'on' ? '🟢 Activé' : '🔴 Désactivé';

    return await sock.sendMessage(chatId, {
        text: `✍️ *Auto Typing :* ${status}\n> BRINDI-XMD`,
    }, { quoted: message });
}

function isAutotypingEnabled() { return getConfig().enabled; }

// Toutes les fonctions attendues par main.js
async function handleAutotypingForMessage(sock, chatId, userMessage) {
    if (!getConfig().enabled) return;
    try {
        await sock.sendPresenceUpdate('composing', chatId);
        await new Promise(r => setTimeout(r, 800));
        await sock.sendPresenceUpdate('available', chatId);
    } catch (e) { /* silently fail */ }
}

async function handleAutotypingForCommand(sock, chatId) {
    if (!getConfig().enabled) return;
    try {
        await sock.sendPresenceUpdate('composing', chatId);
    } catch (e) { /* silently fail */ }
}

async function showTypingAfterCommand(sock, chatId) {
    if (!getConfig().enabled) return;
    try {
        await sock.sendPresenceUpdate('composing', chatId);
        await new Promise(r => setTimeout(r, 500));
        await sock.sendPresenceUpdate('available', chatId);
    } catch (e) { /* silently fail */ }
}

// Export compatible avec l'original
module.exports = autotypingCommand;
module.exports.autotypingCommand = autotypingCommand;
module.exports.isAutotypingEnabled = isAutotypingEnabled;
module.exports.handleAutotypingForMessage = handleAutotypingForMessage;
module.exports.handleAutotypingForCommand = handleAutotypingForCommand;
module.exports.showTypingAfterCommand = showTypingAfterCommand;

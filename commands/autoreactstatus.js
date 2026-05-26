const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '../data/autoStatus.json');

const REACTIONS = ['🥷', '❤️', '🔥', '👏', '😍', '💯', '⚡', '🎯', '👑', '✨'];

if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify({ activé: false, reactOn: false }));
function getConfig() { try { return JSON.parse(fs.readFileSync(configPath)); } catch { return { activé: false, reactOn: false }; } }
function saveConfig(d) { fs.writeFileSync(configPath, JSON.stringify(d, null, 2)); }

async function autoreactstatusCommand(sock, chatId, senderId, args, message) {
    const config = getConfig();
    const action = args[0]?.toLowerCase();
    const current = config.reactOn ? '🟢 Activé' : '🔴 Désactivé';

    if (!action) {
        return await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `📊 *Statut :* ${current}\n\n😀 *Réactions utilisées :*\n${REACTIONS.join('  ')}\n\n📌 *Commandes :*\n• .autoreactstatus on\n• .autoreactstatus off\n\n🔥 *Fonctionnement :*\nLe bot réagit automatiquement avec un emoji aléatoire à chaque nouveau statut posté par tes contacts WhatsApp.\n> BRINDI-XMD`,
        }, { quoted: message });
    }

    config.reactOn = action === 'on';
    saveConfig(config);
    const status = action === 'on' ? '🟢 Activé' : '🔴 Désactivé';

    return await sock.sendMessage(chatId, {
        text: `🔥 *Auto React Status :* ${status}\n\n${action === 'on' ? '_Le bot réagira à tous les statuts avec un emoji._' : '_Les réactions automatiques sont désactivées._'}\n> BRINDI-XMD`
    }, { quoted: message });
}

// Handler appelé depuis main.js quand un statut est reçu
async function handleAutoReact(sock, statusMessage) {
    const config = getConfig();
    if (!config.reactOn) return;
    try {
        const emoji = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
        await sock.sendMessage('status@broadcast', {
            react: { text: emoji, key: statusMessage.key }
        });
    } catch (e) {
        console.error('❌ [autoreactstatus]', e.message);
    }
}

module.exports = autoreactstatusCommand;
module.exports.handleAutoReact = handleAutoReact;

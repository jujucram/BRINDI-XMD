const fs = require('fs');
const path = require('path');

const ANTIBOT_FILE = path.join(__dirname, '../data/antibot.json');

function readState() { try { return JSON.parse(fs.readFileSync(ANTIBOT_FILE)); } catch { return {}; } }
function saveState(s) { fs.writeFileSync(ANTIBOT_FILE, JSON.stringify(s, null, 2)); }
function isAntibotEnabled(chatId) { return readState()[chatId] === true; }

// Signature corrigée : (sock, chatId, message, args, isSenderAdmin)
async function antibotCommand(sock, chatId, message, args, isSenderAdmin) {
    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, {
            text: '❌ *Uniquement dans les groupes !*\n> BRINDI-XMD',
        }, { quoted: message });
    }

    const state = readState();
    const action = Array.isArray(args) ? args[0]?.toLowerCase() : args?.toLowerCase();
    const current = state[chatId] ? '🟢 Activé' : '🔴 Désactivé';

    if (!action) {
        return await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `📊 *Statut :* ${current}\n\n📌 *Commandes :*\n• .antibot on\n• .antibot off\n\n🛡️ Bloque les messages des autres bots dans le groupe.\n> BRINDI-XMD`,
        }, { quoted: message });
    }

    if (action === 'on') {
        state[chatId] = true;
        saveState(state);
        return await sock.sendMessage(chatId, {
            text: `🤖 *Anti-Bot :* 🟢 Activé\n\n🛡️ _Aucun autre bot ne pourra interagir ici._\n> BRINDI-XMD`,
        }, { quoted: message });
    }

    if (action === 'off') {
        state[chatId] = false;
        saveState(state);
        return await sock.sendMessage(chatId, {
            text: `🤖 *Anti-Bot :* 🔴 Désactivé\n> BRINDI-XMD`,
        }, { quoted: message });
    }
}

module.exports = { antibotCommand, isAntibotEnabled };

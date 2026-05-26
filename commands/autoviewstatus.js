const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '../data/autoStatus.json');

if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify({ activé: false, reactOn: false }));
function getConfig() { try { return JSON.parse(fs.readFileSync(configPath)); } catch { return { activé: false, reactOn: false }; } }
function saveConfig(d) { fs.writeFileSync(configPath, JSON.stringify(d, null, 2)); }

async function autoviewstatusCommand(sock, chatId, senderId, args, message) {
    let config = getConfig();
    const action = args[0]?.toLowerCase();
    const current = config.activé ? '🟢 Activé' : '🔴 Désactivé';

    if (!action) {
        return await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `📊 *Statut :* ${current}\n\n📌 *Commandes :*\n• .autoviewstatus on\n• .autoviewstatus off\n\n👁️ *Fonctionnement :*\nQuand activé, le bot visionne automatiquement TOUS les statuts de tes contacts, comme si tu les regardais toi-même.\n> BRINDI-XMD`,
        }, { quoted: message });
    }

    config.activé = action === 'on';
    saveConfig(config);
    const status = action === 'on' ? '🟢 Activé' : '🔴 Désactivé';

    return await sock.sendMessage(chatId, {
        text: `👁️ *Auto View Status :* ${status}\n\n${action === 'on' ? '_Le bot regardera automatiquement tous les statuts._' : '_La vue automatique des statuts est désactivée._'}\n> BRINDI-XMD`,
    }, { quoted: message });
}

module.exports = autoviewstatusCommand;

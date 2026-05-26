const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');

const configPath = path.join(__dirname, '../data/antileave.json');

if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify({}));
function getConfig() { try { return JSON.parse(fs.readFileSync(configPath)); } catch { return {}; } }
function saveConfig(d) { fs.writeFileSync(configPath, JSON.stringify(d, null, 2)); }

async function antileaveCommand(sock, chatId, senderId, args, message) {
    if (!chatId.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, { text: '❌ *Uniquement dans les groupes !*\n> BRINDI-XMD', }, { quoted: message });
    }

    const { isSenderAdmin } = await isAdmin(sock, chatId, senderId);
    if (!isSenderAdmin) {
        return await sock.sendMessage(chatId, {
            text: `❌ *Réservé aux admins du groupe !*\n> BRINDI-XMD`,
        }, { quoted: message });
    }

    const config = getConfig();
    const action = args[0]?.toLowerCase();
    const current = config[chatId]?.enabled ? '🟢 Activé' : '🔴 Désactivé';

    if (!action) {
        return await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `📊 *Statut :* ${current}\n\n📌 *Commandes :*\n• .antileave on\n• .antileave off\n\nℹ️ *Fonctionnement :*\n• Envoie un message d'alerte quand un membre quitte\n• Tente de réinviter le membre si le bot est admin\n> BRINDI-XMD`,
        }, { quoted: message });
    }

    if (!config[chatId]) config[chatId] = {};
    if (action === 'on') {
        config[chatId].enabled = true;
        saveConfig(config);
        return await sock.sendMessage(chatId, {
            text: `🚫 *Anti-Leave :* 🟢 Activé\n_Le bot alertera lors de chaque départ._\n> BRINDI-XMD`,
        }, { quoted: message });
    }
    if (action === 'off') {
        config[chatId].enabled = false;
        saveConfig(config);
        return await sock.sendMessage(chatId, {
            text: `🚫 *Anti-Leave :* 🔴 Désactivé\n> BRINDI-XMD`,
        }, { quoted: message });
    }
}

// Handler appelé depuis main.js lors d'un départ (remove)
async function handleAntileave(sock, chatId, participantJid) {
    const config = getConfig();
    if (!config[chatId]?.enabled) return;
    const num = participantJid.split('@')[0];
    try {
        // Message d'alerte dans le groupe
        await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `🚪 *DÉPART DÉTECTÉ*\n\n😢 *+${num}* a quitté le groupe !\n\n🔄 Tentative de réinvitation...\n> BRINDI-XMD`
        });
        // Tente de réinviter
        await new Promise(r => setTimeout(r, 2000));
        await sock.groupParticipantsUpdate(chatId, [participantJid], 'add');
    } catch (e) {
        console.error('❌ [antileave handler]', e.message);
    }
}

module.exports = antileaveCommand;
module.exports.handleAntileave = handleAntileave;

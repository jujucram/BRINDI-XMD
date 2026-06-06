const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '../data/autoStatus.json');
const REACTIONS = ['🥷', '❤️', '🔥', '👏', '😍', '💯', '⚡', '🎯', '👑', '✨'];

// Init config
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ activé: false, reactOn: false }, null, 2));
}

function getConfig() {
    try { return JSON.parse(fs.readFileSync(configPath)); }
    catch { return { activé: false, reactOn: false }; }
}

function saveConfig(d) {
    fs.writeFileSync(configPath, JSON.stringify(d, null, 2));
}

// ─── COMMANDE ───────────────────────────────────────────────
async function autoStatusCommand(sock, chatId, msg, args) {
    try {
        const senderId = msg.key.participant || msg.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);

        if (!msg.key.fromMe && !isOwner) {
            return await sock.sendMessage(chatId, {
                text: '❌ *Cette commande est réservée au propriétaire !*\n> BRINDI-XMD'
            }, { quoted: msg });
        }

        const config = getConfig();
        const command = args[0]?.toLowerCase();

        // Pas d'arguments → afficher statut
        if (!command) {
            return await sock.sendMessage(chatId, {
                text: `📊 *Configuration Auto Status*\n\n` +
                      `• Auto View : ${config.activé ? '🟢 Activé' : '🔴 Désactivé'}\n` +
                      `• Auto React : ${config.reactOn ? '🟢 Activé' : '🔴 Désactivé'}\n\n` +
                      `📌 *Commandes :*\n` +
                      `• .autostatus on/off\n` +
                      `• .autostatus react on/off\n` +
                      `> BRINDI-XMD`
            }, { quoted: msg });
        }

        // .autostatus on/off
        if (command === 'on' || command === 'off') {
            config.activé = command === 'on';
            saveConfig(config);
            return await sock.sendMessage(chatId, {
                text: `📱 *Auto Status View :* ${config.activé ? '🟢 Activé' : '🔴 Désactivé'}\n` +
                      `${config.activé ? '_Le bot visionne automatiquement les statuts._' : ''}\n` +
                      `> BRINDI-XMD`
            }, { quoted: msg });
        }

        // .autostatus react on/off
        if (command === 'react') {
            const sub = args[1]?.toLowerCase();
            if (sub !== 'on' && sub !== 'off') {
                return await sock.sendMessage(chatId, {
                    text: '❌ Usage : .autostatus react on/off\n> BRINDI-XMD'
                }, { quoted: msg });
            }
            config.reactOn = sub === 'on';
            saveConfig(config);
            return await sock.sendMessage(chatId, {
                text: `💫 *Auto React Status :* ${config.reactOn ? '🟢 Activé' : '🔴 Désactivé'}\n` +
                      `${config.reactOn ? '_Le bot réagira aux statuts avec un emoji aléatoire._' : ''}\n` +
                      `> BRINDI-XMD`
            }, { quoted: msg });
        }

        // Commande inconnue
        return await sock.sendMessage(chatId, {
            text: '❌ *Commande invalide !*\nUsage :\n• .autostatus on/off\n• .autostatus react on/off\n> BRINDI-XMD'
        }, { quoted: msg });

    } catch (error) {
        console.error('❌ [autoStatusCommand]', error.message);
        await sock.sendMessage(chatId, {
            text: '❌ Erreur lors du traitement.\n> BRINDI-XMD'
        }, { quoted: msg });
    }
}

// ─── REACT ──────────────────────────────────────────────────
async function reactToStatus(sock, statusKey) {
    try {
        if (!getConfig().reactOn) return;
        if (!statusKey?.id) return;

        const emoji = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
        await sock.sendMessage('status@broadcast', {
            react: { text: emoji, key: statusKey }
        });
    } catch (e) {
        console.error('❌ [reactToStatus]', e.message);
    }
}

// ─── HANDLER PRINCIPAL (appelé depuis main.js) ───────────────
async function handleStatusUpdate(sock, status) {
    try {
        const config = getConfig();
        if (!config.activé && !config.reactOn) return;
        if (!status) return;

        await new Promise(r => setTimeout(r, 1000));

        let key = null;

        // Structure messages.upsert
        if (status.messages?.length > 0) {
            const msg = status.messages[0];
            if (!msg?.key) return;
            if (msg.key.fromMe) return;                          // ignorer ses propres messages
            if (msg.key.remoteJid !== 'status@broadcast') return;
            key = msg.key;
        }
        // Structure directe
        else if (status.key?.remoteJid === 'status@broadcast') {
            if (status.key.fromMe) return;                       // ignorer ses propres messages
            key = status.key;
        }

        if (!key) return;

        // Auto view
        if (config.activé) {
            try {
                await sock.readMessages([key]);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    await new Promise(r => setTimeout(r, 3000));
                    try { await sock.readMessages([key]); } catch {}
                }
            }
        }

        // Auto react
        if (config.reactOn) {
            await new Promise(r => setTimeout(r, 500)); // petit délai entre view et react
            await reactToStatus(sock, key);
        }

    } catch (error) {
        console.error('❌ [handleStatusUpdate]', error.message);
    }
}

// ─── HELPERS ────────────────────────────────────────────────
function isAutoStatusEnabled() {
    return getConfig().activé;
}

function isStatusReactionEnabled() {
    return getConfig().reactOn;
}

module.exports = {
    autoStatusCommand,
    handleStatusUpdate,
    isAutoStatusEnabled,
    isStatusReactionEnabled
};

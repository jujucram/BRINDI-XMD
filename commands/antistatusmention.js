const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../data/antistatusmention.json');

if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify({ enabled: false }));
function getConfig() { try { return JSON.parse(fs.readFileSync(configPath)); } catch { return { enabled: false }; } }
function saveConfig(d) { fs.writeFileSync(configPath, JSON.stringify(d, null, 2)); }

async function antistatusmention(sock, chatId, senderId, args, message) {
    const action = args[0]?.toLowerCase();
    const config = getConfig();
    const current = config.enabled ? '🟢 Activé' : '🔴 Désactivé';

    if (!action) {
        return await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `📊 *Statut :* ${current}\n\n📌 *Commandes :*\n• .antistatusmention on\n• .antistatusmention off\n\n🛡️ *Supprime les mentions du groupe via statut.*\n> BRINDI-XMD`,
        }, { quoted: message });
    }

    config.enabled = action === 'on';
    saveConfig(config);
    return await sock.sendMessage(chatId, {
        text: `⚠️ *Anti-Statut Mention :* ${config.enabled ? '🟢 Activé' : '🔴 Désactivé'}\n${config.enabled ? '_Les mentions via statut seront supprimées._' : '_Protection désactivée._'}\n> BRINDI-XMD`,
    }, { quoted: message });
}

function isStatusMention(message) {
    try {
        const msg = message?.message;
        if (!msg) return false;
        // Type 1 : groupMentionedMessage officiel
        if (msg.groupMentionedMessage) return true;
        // Type 2 : contextInfo pointant vers status@broadcast
        const ctxList = [
            msg.extendedTextMessage?.contextInfo,
            msg.imageMessage?.contextInfo,
            msg.videoMessage?.contextInfo,
            msg.stickerMessage?.contextInfo,
            msg.audioMessage?.contextInfo,
        ].filter(Boolean);
        for (const ctx of ctxList) {
            if (ctx?.remoteJid === 'status@broadcast') return true;
        }
        return false;
    } catch { return false; }
}

// Handler principal — APPELÉ SUR CHAQUE MESSAGE DE GROUPE
async function handleAntistatus(sock, chatId, senderId, message) {
    try {
        const config = getConfig();
        if (!config.enabled) return false;
        if (!chatId?.endsWith('@g.us')) return false;

        const msg = message?.message;
        if (!msg) return false;

        let shouldDelete = false;

        // Détection 1 : groupMentionedMessage
        if (msg.groupMentionedMessage) shouldDelete = true;

        // Détection 2 : contextInfo remoteJid = status@broadcast
        if (!shouldDelete) {
            const ctxList = [
                msg.extendedTextMessage?.contextInfo,
                msg.imageMessage?.contextInfo,
                msg.videoMessage?.contextInfo,
                msg.stickerMessage?.contextInfo,
                msg.audioMessage?.contextInfo,
            ].filter(Boolean);
            for (const ctx of ctxList) {
                if (ctx?.remoteJid === 'status@broadcast') {
                    shouldDelete = true;
                    break;
                }
            }
        }

        // Détection 3 : message reaction sur statut
        if (!shouldDelete && msg.reactionMessage) {
            const reactCtx = msg.reactionMessage?.key?.remoteJid;
            if (reactCtx === 'status@broadcast') shouldDelete = true;
        }

        if (!shouldDelete) return false;

        // Supprimer le message avec la bonne clé
        const deleteKey = {
            remoteJid: chatId,
            id: message.key.id,
            participant: message.key.participant || senderId,
            fromMe: false
        };

        try {
            await sock.sendMessage(chatId, { delete: deleteKey });
            console.log(`🛡️ [antistatusmention] Supprimé @${senderId?.split('@')[0]}`);
            return true;
        } catch (e1) {
            // Essai avec la clé originale
            try {
                await sock.sendMessage(chatId, { delete: message.key });
                return true;
            } catch (e2) {
                console.error('❌ [antistatusmention] Suppression échouée:', e2.message);
                return false;
            }
        }
    } catch (e) {
        console.error('❌ [antistatusmention]', e.message);
        return false;
    }
}

module.exports = antistatusmention;
module.exports.isStatusMention = isStatusMention;
module.exports.isEnabled = () => getConfig().enabled;
module.exports.handleAntistatus = handleAntistatus;

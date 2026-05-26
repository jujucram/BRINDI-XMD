const fs = require('fs');
const path = require('path');
const { proto } = require('@whiskeysockets/baileys');
const isAdmin = require('../lib/isAdmin');

const configPath = path.join(__dirname, '../data/antimentionstatus.json');
const dataDir = path.dirname(configPath);

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify({}), 'utf8');

function getConfig() {
    try { return JSON.parse(fs.readFileSync(configPath, 'utf8')); }
    catch { return {}; }
}

function saveConfig(data) {
    try { fs.writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf8'); return true; }
    catch (err) { console.error('❌ [antimentionstatus] Erreur sauvegarde:', err.message); return false; }
}

function getGroupConfig(chatId) {
    const config = getConfig();
    if (!config[chatId]) { config[chatId] = { enabled: false }; saveConfig(config); }
    return config[chatId];
}

async function isAuthorized(sock, chatId, senderId) {
    const ownerNumbers = [(process.env.OWNER_NUMBER || '237673355468') + '@s.whatsapp.net'];
    if (ownerNumbers.includes(senderId)) return true;
    const { isSenderAdmin } = await isAdmin(sock, chatId, senderId);
    return isSenderAdmin;
}

async function antimentionstatusCommand(sock, chatId, senderId, args, quoted) {
    // 🔒 GROUPE UNIQUEMENT
    if (!chatId?.endsWith('@g.us')) {
        return await sock.sendMessage(chatId, {
            text: '❌ *Cette commande fonctionne uniquement dans les groupes !*\n> BRINDI-XMD',
        }, { quoted });
    }

    if (!await isAuthorized(sock, chatId, senderId)) {
        return await sock.sendMessage(chatId, {
            text: '❌ *Réservé aux admins du groupe !*\n> BRINDI-XMD',
        }, { quoted });
    }

    const config = getConfig();
    const groupCfg = getGroupConfig(chatId);
    const action = args[0]?.toLowerCase();

    if (!action) {
        return await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `📊 *Statut :* ${groupCfg.enabled ? '🟢 Activé' : '🔴 Désactivé'}\n\n📌 *Commandes :*\n• .antimentionstatus on\n• .antimentionstatus off\n\n🛡️ *Fonctionnement :*\nSupprime automatiquement les messages provenant d'une mention de groupe via un statut WhatsApp.\n> BRINDI-XMD`,
        }, { quoted });
    }

    if (action === 'on') {
        config[chatId] = { enabled: true };
        saveConfig(config);
        return await sock.sendMessage(chatId, {
            text: `⚠️ *Anti-Mention Statut :* 🟢 Activé\n\n_Les mentions via statut seront automatiquement supprimées._\n> BRINDI-XMD`,
        }, { quoted });
    }

    if (action === 'off') {
        config[chatId] = { enabled: false };
        saveConfig(config);
        return await sock.sendMessage(chatId, {
            text: `⚠️ *Anti-Mention Statut :* 🔴 Désactivé\n\n_Protection désactivée._\n> BRINDI-XMD`,
        }, { quoted });
    }

    return await sock.sendMessage(chatId, {
        text: `❌ *Option invalide !*\n\nUtilise :\n• .antimentionstatus on\n• .antimentionstatus off\n> BRINDI-XMD`,
    }, { quoted });
}

function isStatusMentionMsg(mek) {
    try {
        const msg = mek?.message;
        if (!msg) return false;
        if (msg.groupMentionedMessage) return true;
        const contextSources = [
            msg.extendedTextMessage?.contextInfo,
            msg.imageMessage?.contextInfo,
            msg.videoMessage?.contextInfo,
            msg.stickerMessage?.contextInfo,
            msg.audioMessage?.contextInfo,
            msg.documentMessage?.contextInfo
        ].filter(Boolean);
        for (const ctx of contextSources) {
            if (ctx?.remoteJid === 'status@broadcast') return true;
            if (ctx?.groupMentions?.length > 0) return true;
        }
        return false;
    } catch (err) {
        console.error('❌ [antimentionstatus] Erreur détection:', err.message);
        return false;
    }
}

async function handleAntimentionStatus(sock, chatId, sender, mek) {
    try {
        if (!chatId?.endsWith('@g.us')) return false;
        if (mek?.key?.fromMe) return false;

        const groupCfg = getGroupConfig(chatId);
        if (!groupCfg.enabled) return false;

        if (!isStatusMentionMsg(mek)) return false;

        console.log(`⚠️ [antimentionstatus] Mention status détectée de @${sender?.split('@')[0]}`);

        let isBotAdmin = false;
        try {
            const meta = await sock.groupMetadata(chatId);
            const botJid = sock.user.id?.replace(/:\d+/, '') + '@s.whatsapp.net';
            isBotAdmin = meta.participants.some(p =>
                p.id === botJid && (p.admin === 'admin' || p.admin === 'superadmin')
            );
        } catch (err) {
            console.error('❌ [antimentionstatus] Erreur groupMeta', err.message);
            return false;
        }

        if (!isBotAdmin) {
            console.log('❌ [antimentionstatus] Bot non admin → suppression impossible');
            return false;
        }

        const deleteKey = {
            remoteJid: chatId,
            id: mek.key.id,
            participant: mek.key.participant || sender,
            fromMe: false
        };

        try {
            await sock.sendMessage(chatId, { delete: deleteKey });
            console.log(`🗑️ [antimentionstatus] Message supprimé (méthode 1)`);
            return true;
        } catch (err) {
            console.log('⚠️ [antimentionstatus] Méthode 1 échouée, tentative 2...');
        }

        try {
            const revokeMsg = proto.Message.fromObject({
                protocolMessage: {
                    key: deleteKey,
                    type: proto.Message.ProtocolMessage.Type.REVOKE
                }
            });
            await sock.relayMessage(chatId, revokeMsg, {});
            console.log(`🗑️ [antimentionstatus] Message supprimé (méthode 2)`);
            return true;
        } catch (err) {
            console.error('❌ [antimentionstatus] Échec suppression:', err.message);
            return false;
        }

    } catch (err) {
        console.error('❌ [antimentionstatus] Erreur handler:', err.message);
        return false;
    }
}

module.exports = antimentionstatusCommand;
module.exports.handleAntimentionStatus = handleAntimentionStatus;
module.exports.isStatusMention = isStatusMentionMsg;
module.exports.getGroupConfig = getGroupConfig;

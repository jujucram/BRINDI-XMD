const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

function loadState() {
    try {
        var raw = fs.readFileSync(path.join(__dirname, '..', 'data', 'mention.json'), 'utf8');
        var state = JSON.parse(raw);
        if (state && typeof state.assetPath === 'string' && state.assetPath.endsWith('assets/mention_default.webp')) {
            return { enabled: !!state.enabled, assetPath: '', type: 'text' };
        }
        return state;
    } catch (e) {
        return { enabled: false, assetPath: '', type: 'text' };
    }
}

function saveState(state) {
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'mention.json'), JSON.stringify(state, null, 2));
}

async function ensureDefaultSticker(state) {
    try {
        var assetPath = path.join(__dirname, '..', state.assetPath);
        if (state.assetPath.endsWith('mention_default.webp') && !fs.existsSync(assetPath)) {
            var defaultStickerPath = path.join(__dirname, '..', 'assets', 'stickintro.webp');
            if (fs.existsSync(defaultStickerPath)) {
                fs.copyFileSync(defaultStickerPath, assetPath);
            } else {
                var assetsDir = path.dirname(assetPath);
                if (!fs.existsSync(assetsDir)) {
                    fs.mkdirSync(assetsDir, { recursive: true });
                }
                fs.writeFileSync(assetPath.replace('.webp', '.txt'), 'Sticker par défaut indisponible');
            }
        }
    } catch (e) {
        console.warn('[MENTION] ensureDefaultSticker :', e && e.message);
    }
}

async function handleMentionDetection(sock, chatId, message) {
    try {
        if (message.key && message.key.fromMe) return;

        var state = loadState();
        await ensureDefaultSticker(state);
        if (!state.enabled) return;

        var rawId = (sock.user && (sock.user.id || sock.user.jid)) || '';
        if (!rawId) return;
        var botNum = rawId.split('@')[0].split(':')[0];
        var botJids = [
            botNum + '@s.whatsapp.net',
            botNum + '@whatsapp.net',
            rawId
        ];

        var msg = message.message || {};
        var contexts = [
            msg.extendedTextMessage && msg.extendedTextMessage.contextInfo,
            msg.imageMessage && msg.imageMessage.contextInfo,
            msg.videoMessage && msg.videoMessage.contextInfo,
            msg.documentMessage && msg.documentMessage.contextInfo,
            msg.stickerMessage && msg.stickerMessage.contextInfo,
            msg.buttonsResponseMessage && msg.buttonsResponseMessage.contextInfo,
            msg.listResponseMessage && msg.listResponseMessage.contextInfo
        ].filter(Boolean);

        var mentioned = [];
        for (var i = 0; i < contexts.length; i++) {
            var c = contexts[i];
            if (Array.isArray(c.mentionedJid)) {
                mentioned = mentioned.concat(c.mentionedJid);
            }
        }

        var directMentionLists = [
            msg.extendedTextMessage && msg.extendedTextMessage.mentionedJid,
            msg.mentionedJid
        ].filter(Array.isArray);
        for (var j = 0; j < directMentionLists.length; j++) {
            mentioned = mentioned.concat(directMentionLists[j]);
        }

        if (!mentioned.length) {
            var rawText = (
                msg.conversation ||
                (msg.extendedTextMessage && msg.extendedTextMessage.text) ||
                (msg.imageMessage && msg.imageMessage.caption) ||
                (msg.videoMessage && msg.videoMessage.caption) ||
                ''
            ).toString();
            if (rawText) {
                var safeBot = botNum.replace(/[-\s]/g, '');
                var re = new RegExp('@?' + safeBot + '\\b');
                if (!re.test(rawText.replace(/\s+/g, ''))) return;
            } else {
                return;
            }
        }

        // ============================
        // ENVOI DE LA RÉPONSE 
        // ============================

        if (!state.assetPath) {
            await sock.sendMessage(chatId, {
                text: 'Wesh on m\'a appelé ? 👀'
            }, { quoted: message });
            return;
        }

        var assetPath = path.join(__dirname, '..', state.assetPath);

        if (!fs.existsSync(assetPath)) {
            await sock.sendMessage(chatId, {
                text: 'Wesh on m\'a appelé ? 👀'
            }, { quoted: message });
            return;
        }

        try {
            if (state.type === 'sticker') {
                await sock.sendMessage(chatId, { sticker: fs.readFileSync(assetPath) }, { quoted: message });
                return;
            }

            var payload = {};
            if (state.type === 'image') {
                payload.image = fs.readFileSync(assetPath);
                payload.caption = '> BRINDI-XMD';
            } else if (state.type === 'video') {
                payload.video = fs.readFileSync(assetPath);
                payload.caption = '> BRINDI-XMD';
                if (state.gifPlayback) payload.gifPlayback = true;
            } else if (state.type === 'audio') {
                payload.audio = fs.readFileSync(assetPath);
                payload.mimetype = state.mimetype || 'audio/mpeg';
                if (typeof state.ptt === 'boolean') payload.ptt = state.ptt;
            } else if (state.type === 'text') {
                var customText = fs.readFileSync(assetPath, 'utf8');
                payload.text = customText + '\n\n> BRINDI-XMD';
            } else {
                payload.text = 'Wesh on m\'a appelé ? 👀';
            }

            await sock.sendMessage(chatId, payload, { quoted: message });
        } catch (e) {
            await sock.sendMessage(chatId, {
                text: 'Wesh on m\'a appelé ? 👀'
            }, { quoted: message });
        }
    } catch (err) {
        console.error('[MENTION] handleMentionDetection :', err.message);
    }
}

async function mentionToggleCommand(sock, chatId, message, args, isOwner) {
    if (!isOwner) {
        return sock.sendMessage(chatId, {
            text: '❌ Seul le propriétaire ou un sudo peut utiliser cette commande.\n\n> BRINDI-XMD'
        }, { quoted: message });
    }

    var onoff = (args || '').trim().toLowerCase();
    if (!onoff || !['on', 'off'].includes(onoff)) {
        return sock.sendMessage(chatId, {
            text: '❌ *Usage :* .mention on / .mention off\n\n> BRINDI-XMD'
        }, { quoted: message });
    }

    var state = loadState();
    state.enabled = onoff === 'on';
    saveState(state);

    return sock.sendMessage(chatId, {
        text: state.enabled
            ? '✅ *Réponse aux mentions activée !* 🤖.\n\n> BRINDI-XMD'
            : '✅ *Réponse aux mentions désactivée.*\n\n> BRINDI-XMD'
    }, { quoted: message });
}

async function setMentionCommand(sock, chatId, message, isOwner) {
    if (!isOwner) {
        return sock.sendMessage(chatId, {
            text: '❌ Seul le propriétaire ou un sudo peut utiliser cette commande.\n\n> BRINDI-XMD'
        }, { quoted: message });
    }

    var ctx = message.message && message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo;
    var qMsg = ctx && ctx.quotedMessage;

    if (!qMsg) {
        return sock.sendMessage(chatId, {
            text: '❌ Réponds à un message ou un média (sticker/image/vidéo/audio/document) avec cette commande.\n\n> BRINDI-XMD'
        }, { quoted: message });
    }

    var type = 'sticker', buf, dataType;

    if (qMsg.stickerMessage) { dataType = 'stickerMessage'; type = 'sticker'; }
    else if (qMsg.imageMessage) { dataType = 'imageMessage'; type = 'image'; }
    else if (qMsg.videoMessage) { dataType = 'videoMessage'; type = 'video'; }
    else if (qMsg.audioMessage) { dataType = 'audioMessage'; type = 'audio'; }
    else if (qMsg.documentMessage) { dataType = 'documentMessage'; type = 'file'; }
    else if (qMsg.conversation || (qMsg.extendedTextMessage && qMsg.extendedTextMessage.text)) { type = 'text'; }
    else {
        return sock.sendMessage(chatId, {
            text: '❌ Format non supporté. Réponds à un texte/sticker/image/vidéo/audio/document.\n\n> BRINDI-XMD'
        }, { quoted: message });
    }

    if (type === 'text') {
        buf = Buffer.from(qMsg.conversation || (qMsg.extendedTextMessage && qMsg.extendedTextMessage.text) || '', 'utf8');
        if (!buf.length) {
            return sock.sendMessage(chatId, {
                text: '❌ Texte vide.\n\n> BRINDI-XMD'
            }, { quoted: message });
        }
    } else {
        try {
            var media = qMsg[dataType];
            if (!media) throw new Error('Pas de média');
            var kind = type === 'sticker' ? 'sticker' : type;
            var stream = await downloadContentFromMessage(media, kind);
            var chunks = [];
            for await (var chunk of stream) chunks.push(chunk);
            buf = Buffer.concat(chunks);
        } catch (e) {
            console.error('[MENTION] download error', e.message);
            return sock.sendMessage(chatId, {
                text: '❌ Échec du téléchargement du média.\n\n> BRINDI-XMD'
            }, { quoted: message });
        }
    }

    if (buf.length > 1024 * 1024) {
        return sock.sendMessage(chatId, {
            text: '❌ Fichier trop volumineux. Maximum 1 Mo.\n\n> BRINDI-XMD'
        }, { quoted: message });
    }

    var mimetype = (qMsg[dataType] && qMsg[dataType].mimetype) || '';
    var ptt = !!(qMsg.audioMessage && qMsg.audioMessage.ptt);
    var gifPlayback = !!(qMsg.videoMessage && qMsg.videoMessage.gifPlayback);
    var ext = 'bin';

    if (type === 'sticker') ext = 'webp';
    else if (type === 'image') ext = mimetype.includes('png') ? 'png' : 'jpg';
    else if (type === 'video') ext = 'mp4';
    else if (type === 'audio') {
        if (mimetype.includes('ogg') || mimetype.includes('opus')) { ext = 'ogg'; mimetype = 'audio/ogg; codecs=opus'; }
        else if (mimetype.includes('mpeg') || mimetype.includes('mp3')) { ext = 'mp3'; mimetype = 'audio/mpeg'; }
        else if (mimetype.includes('aac')) { ext = 'aac'; mimetype = 'audio/aac'; }
        else if (mimetype.includes('wav')) { ext = 'wav'; mimetype = 'audio/wav'; }
        else if (mimetype.includes('m4a') || mimetype.includes('mp4')) { ext = 'm4a'; mimetype = 'audio/mp4'; }
        else { ext = 'mp3'; mimetype = 'audio/mpeg'; }
    }
    else if (type === 'text') ext = 'txt';

    var stateBefore = loadState();
    try {
        var assetsDir = path.join(__dirname, '..', 'assets');
        if (fs.existsSync(assetsDir)) {
            var files = fs.readdirSync(assetsDir);
            for (var k = 0; k < files.length; k++) {
                if (files[k].startsWith('mention_custom.')) {
                    try { fs.unlinkSync(path.join(assetsDir, files[k])); } catch (e) {}
                }
            }
        }
        if (stateBefore.assetPath && stateBefore.assetPath.startsWith('assets/') &&
            !stateBefore.assetPath.endsWith('mention_default.webp')) {
            var prevPath = path.join(__dirname, '..', stateBefore.assetPath);
            if (fs.existsSync(prevPath)) {
                try { fs.unlinkSync(prevPath); } catch (e) {}
            }
        }
    } catch (e) {
        console.warn('[MENTION] cleanup assets :', e.message);
    }

    var outName = 'mention_custom.' + ext;
    var outPath = path.join(__dirname, '..', 'assets', outName);

    try {
        fs.writeFileSync(outPath, buf);
    } catch (e) {
        console.error('[MENTION] write error', e.message);
        return sock.sendMessage(chatId, {
            text: '❌ Échec de l\'enregistrement du fichier.\n\n> BRINDI-XMD'
        }, { quoted: message });
    }

    var state = loadState();
    state.assetPath = path.join('assets', outName);
    state.type = type;
    if (type === 'audio') state.mimetype = mimetype;
    if (type === 'audio') state.ptt = ptt;
    if (type === 'video') state.gifPlayback = gifPlayback;
    saveState(state);

    return sock.sendMessage(chatId, {
        text: '✅ *Média de réponse aux mentions mis à jour !*\n\n> BRINDI-XMD'
    }, { quoted: message });
}

module.exports = { handleMentionDetection, mentionToggleCommand, setMentionCommand };

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');
const chatMemory = new Map();

function loadData() {
    try { return JSON.parse(fs.readFileSync(USER_GROUP_DATA, 'utf8')); }
    catch (e) { return { chatbot: {} }; }
}

function saveData(data) {
    try { fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2)); }
    catch (e) { console.error('[CHATBOT] saveData:', e.message); }
}

function getPrompt() {
    try {
        var p = path.join(__dirname, '../data/prompt.json');
        return JSON.parse(fs.readFileSync(p)).prompt ||
            "Tu es BRINDI-XMD, un bot WhatsApp humain, stylé et naturel créé par le dev camerounais Brandon. Réponds de manière très courte (1 à 2 phrases max) en utilisant l'argot camerounais de WhatsApp. Ne dis jamais que tu es une IA.";
    } catch (e) {
        return "Tu es BRINDI-XMD, un bot WhatsApp humain, stylé et naturel créé par le dev camerounais Brandon. Réponds de manière très courte (1 à 2 phrases max) en utilisant l'argot camerounais de WhatsApp. Ne dis jamais que tu es une IA.";
    }
}

var delay = function(ms) { return new Promise(function(r) { setTimeout(r, ms); }); };

async function showTyping(sock, chatId) {
    try {
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);
        await delay(1500);
        await sock.sendPresenceUpdate('paused', chatId);
    } catch (e) {}
}

async function getAIResponse(userMessage, history) {
    var systemPrompt = getPrompt();
    var context = history.length > 1
        ? 'Historique: ' + history.slice(-3).join(' | ') + '\n'
        : '';
    var userContent = context + 'Utilisateur: ' + userMessage;

    var answer = null;

    // ============================
    // API 1 : Pollinations POST (rapide, stable, pas de limite URL)
    // ============================
    try {
        var r1 = await axios.post(
            'https://text.pollinations.ai/openai',
            {
                model: 'openai',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContent }
                ],
                temperature: 0.9,
                max_tokens: 150
            },
            { timeout: 10000, headers: { 'Content-Type': 'application/json' } }
        );
        var a1 = r1.data && r1.data.choices && r1.data.choices[0] && r1.data.choices[0].message && r1.data.choices[0].message.content;
        if (a1 && a1.trim().length > 1) {
            answer = a1.trim();
        }
    } catch (e1) {
        console.warn('[CHATBOT] API 1 échouée :', e1.message);
    }

    // ============================
    // API 2 : Pollinations POST modèle mistral (variation, toujours fiable)
    // ============================
    if (!answer) {
        try {
            var r2 = await axios.post(
                'https://text.pollinations.ai/openai',
                {
                    model: 'mistral',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userContent }
                    ],
                    temperature: 0.9,
                    max_tokens: 150
                },
                { timeout: 10000, headers: { 'Content-Type': 'application/json' } }
            );
            var a2 = r2.data && r2.data.choices && r2.data.choices[0] && r2.data.choices[0].message && r2.data.choices[0].message.content;
            if (a2 && a2.trim().length > 1) {
                answer = a2.trim();
            }
        } catch (e2) {
            console.warn('[CHATBOT] API 2 échouée :', e2.message);
        }
    }

    // ============================
    // API 3 : GiftedTech Gemini (fallback externe)
    // ============================
    if (!answer) {
        try {
            var q3 = encodeURIComponent(systemPrompt.slice(0, 150) + ' ' + userMessage);
            var r3 = await axios.get(
                'https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=' + q3,
                { timeout: 8000, headers: { 'user-agent': 'Mozilla/5.0' } }
            );
            var a3 = r3.data && (r3.data.result || r3.data.answer);
            if (a3 && a3.toString().trim().length > 1) {
                answer = a3.toString().trim();
            }
        } catch (e3) {
            console.warn('[CHATBOT] API 3 échouée :', e3.message);
        }
    }

    if (!answer) return null;

    answer = answer
        .replace(/^(BRINDI-XMD:|Réponse:|Bot:|Assistant:)/i, '')
        .replace(/>\s*BRINDI-XMD/gi, '')
        .trim();

    return answer.slice(0, 500);
}

function getFallbackResponse(msg) {
    var t = (msg || '').toLowerCase();
    var fallbacks = [
        { keys: ['salut', 'bonjour', 'bonsoir', 'wesh', 'yo', 'hi', 'hey'], res: ['Wesh l\'ami 👋', 'Oya salut ! 😏', 'Yo, le djo ça dit quoi ?', 'Hey, tranquille ? 🔥'] },
        { keys: ['ça va', 'ca va', 'tu vas bien', 'moua'], res: ['Tranquille ou quoi, et chez toi ? 😎', 'Ça tourne fort !', 'Je suis là, on gère non ?'] },
        { keys: ['qui t', 'tu es qui', 't\'es quoi'], res: ['BRINDI-XMD le seul et unique ! 🔥', 'C\'est moi BRINDI, le bot du groupe 😏'] },
        { keys: ['brandon', 'créateur', 'dev'], res: ['C\'est Brandon mon créateur ! Un génie 🇨🇲👑', 'Laisse le boss Brandon tranquille, il code fort 🫡'] },
        { keys: ['merci', 'thanks'], res: ['Pas de souci, on est ensemble ! 🤝', 'À ton service chef !'] },
        { keys: ['tg', 'ferme', 'dégage', 'imbécile'], res: ['Calme ton cœur mon frère 😂', 'Tu djos trop fort, calme-toi 💀'] },
    ];

    for (var i = 0; i < fallbacks.length; i++) {
        if (fallbacks[i].keys.some(function(k) { return t.includes(k); })) {
            var arr = fallbacks[i].res;
            return arr[Math.floor(Math.random() * arr.length)];
        }
    }

    var generic = ['Mmh je vois 🤔', 'Ah bon ? Raconte encore... 😏', 'C\'est carré 👌', 'On est ensemble non ? 🤨', 'Tchip, djos des trucs sérieux 👀'];
    return generic[Math.floor(Math.random() * generic.length)];
}

function normalizeJid(jid) {
    if (!jid) return '';
    return jid.split('@')[0].split(':')[0];
}

function isBotTargeted(message, botJid) {
    var botNum = normalizeJid(botJid);
    var msg = message.message || {};

    var rawText =
        msg.conversation ||
        (msg.extendedTextMessage && msg.extendedTextMessage.text) ||
        (msg.imageMessage && msg.imageMessage.caption) ||
        (msg.videoMessage && msg.videoMessage.caption) || '';

    if (rawText.includes('@' + botNum)) return true;

    var ctx = (msg.extendedTextMessage && msg.extendedTextMessage.contextInfo) ||
              (msg.imageMessage && msg.imageMessage.contextInfo) ||
              (msg.videoMessage && msg.videoMessage.contextInfo);

    if (ctx) {
        var mentioned = ctx.mentionedJid || [];
        if (mentioned.some(function(jid) { return normalizeJid(jid) === botNum; })) return true;

        var quotedParticipant = normalizeJid(ctx.participant || '');
        var quotedRemote = normalizeJid(ctx.remoteJid || '');
        if (quotedParticipant === botNum || quotedRemote === botNum) return true;
    }
    return false;
}

function getCleanText(message, botJid) {
    var botNum = normalizeJid(botJid);
    var msg = message.message || {};

    var raw = msg.conversation || '';
    if (!raw && msg.extendedTextMessage) raw = msg.extendedTextMessage.text || '';
    else if (!raw && msg.imageMessage) raw = msg.imageMessage.caption || '';
    else if (!raw && msg.videoMessage) raw = msg.videoMessage.caption || '';

    return raw
        .replace(new RegExp('@' + botNum, 'g'), '')
        .replace(/@\d+/g, '')
        .trim();
}

async function handleChatbotCommand(sock, chatId, message, match) {
    if (!match || match.trim() === '') {
        return sock.sendMessage(chatId, {
            text: '🤖 *CHATBOT BRINDI-XMD*\n\n*.chatbot on* — Activer\n*.chatbot off* — Désactiver\n\n> BRINDI-XMD'
        }, { quoted: message });
    }

    var data = loadData();
    if (!data.chatbot) data.chatbot = {};
    var arg = match.trim().toLowerCase();

    if (arg === 'on') {
        if (data.chatbot[chatId] && data.chatbot[chatId].enabled === true) {
            return sock.sendMessage(chatId, { text: '🤖 Le chatbot est déjà activé ici.\n\n> BRINDI-XMD' }, { quoted: message });
        }
        data.chatbot[chatId] = { enabled: true };
        saveData(data);
        return sock.sendMessage(chatId, { text: '✅ *Chatbot activé avec succès !* 🤖\n\nTagguez-moi pour me parler !\n\n> BRINDI-XMD' }, { quoted: message });
    }

    if (arg === 'off') {
        if (!data.chatbot[chatId]) {
            return sock.sendMessage(chatId, { text: '❌ Le chatbot est déjà désactivé.\n\n> BRINDI-XMD' }, { quoted: message });
        }
        delete data.chatbot[chatId];
        saveData(data);
        return sock.sendMessage(chatId, { text: '✅ Chatbot désactivé.\n\n> BRINDI-XMD' }, { quoted: message });
    }

    return sock.sendMessage(chatId, { text: '❌ Usage : *.chatbot on* ou *.chatbot off*\n\n> BRINDI-XMD' }, { quoted: message });
}

async function handleChatbotResponse(sock, chatId, message, userMessage, senderId) {
    try {
        var data = loadData();
        if (!data.chatbot || !data.chatbot[chatId] || data.chatbot[chatId].enabled !== true) return;

        var botJid = (sock.user && (sock.user.id || sock.user.jid)) || '';
        if (!botJid) return;

        var botNum = normalizeJid(botJid);
        var senderNum = normalizeJid(senderId || '');

        if (senderNum === botNum || message.key.fromMe === true) return;
        if (!isBotTargeted(message, botJid)) return;

        var cleanText = getCleanText(message, botJid);

        if (!cleanText) {
            await showTyping(sock, chatId);
            return sock.sendMessage(chatId, {
                text: 'Tu as tagué le vide là non ? Parle-moi ! 😅'
            }, { quoted: message });
        }

        if (!chatMemory.has(senderId)) chatMemory.set(senderId, []);
        var history = chatMemory.get(senderId);
        history.push(cleanText);
        if (history.length > 10) history.shift();

        await showTyping(sock, chatId);

        var aiResponse = await getAIResponse(cleanText, history);
        var response = aiResponse || getFallbackResponse(cleanText);

        await sock.sendMessage(chatId, {
            text: response
        }, { quoted: message });

    } catch (err) {
        console.error('[CHATBOT] handleChatbotResponse:', err.message);
    }
}

module.exports = { handleChatbotCommand, handleChatbotResponse };

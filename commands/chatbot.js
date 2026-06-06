const fs = require('fs');
const path = require('path');
const axios = require('axios');

const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');
const chatMemory = new Map(); // senderId → string[]

function loadData() {
    try { return JSON.parse(fs.readFileSync(USER_GROUP_DATA, 'utf8')); }
    catch { return { chatbot: {} }; }
}

function saveData(data) {
    try { fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2)); }
    catch (e) { console.error('❌ saveData:', e.message); }
}

function getPrompt() {
    try {
        const p = path.join(__dirname, '../data/prompt.json');
        return JSON.parse(fs.readFileSync(p)).prompt ||
            "Tu es BRINDI-XMD, bot WhatsApp créé par Brandon (dev camerounais 🇨🇲). Réponds comme un humain stylé, naturel, court (1-3 phrases). Emoji, slang WhatsApp. Ne dis JAMAIS que tu es une IA.";
    } catch {
        return "Tu es BRINDI-XMD, bot WhatsApp créé par Brandon (dev camerounais 🇨🇲). Réponds comme un humain stylé, naturel, court (1-3 phrases). Emoji, slang WhatsApp. Ne dis JAMAIS que tu es une IA.";
    }
}

const delay = ms => new Promise(r => setTimeout(r, ms));

async function showTyping(sock, chatId) {
    try {
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);
        await delay(800);
        await sock.sendPresenceUpdate('paused', chatId);
    } catch {}
}

// ─── 5 APIs en cascade (même système que ai.js) ──────────────
async function getAIResponse(userMessage, history) {
    const systemPrompt = getPrompt();
    const context = history.length > 0
        ? `Historique récent : ${history.slice(-4).join(' | ')}\n\n`
        : '';
    const fullPrompt = `${systemPrompt}\n\n${context}Utilisateur: ${userMessage}\nBRINDI-XMD:`;
    const sq = encodeURIComponent(fullPrompt);

    const apis = [
        () => axios.get(`https://text.pollinations.ai/${sq}`, { timeout: 10000, responseType: 'text' })
            .then(r => typeof r.data === 'string' && r.data.length > 5 ? r.data.trim() : null),

        () => axios.get(`https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=${sq}`, { timeout: 10000 })
            .then(r => r.data?.result || r.data?.answer || null),

        () => axios.get(`https://api.siputzx.my.id/api/ai/gemini-pro?content=${sq}`, { timeout: 10000 })
            .then(r => r.data?.message || r.data?.data || null),

        () => axios.get(`https://api.ryzendesu.vip/api/ai/gemini?text=${sq}`, { timeout: 10000 })
            .then(r => r.data?.message || r.data?.answer || null),

        () => axios.get(`https://api.xteam.xyz/ai?text=${sq}&apikey=d90a9e986e18778b`, { timeout: 10000 })
            .then(r => r.data?.result || r.data?.response || null),
    ];

    for (const api of apis) {
        try {
            const result = await api();
            if (result && typeof result === 'string' && result.trim().length > 3) {
                let cleaned = result.trim();
                // Nettoyer si le modèle répète le prompt
                if (cleaned.startsWith('BRINDI-XMD:')) {
                    cleaned = cleaned.replace('BRINDI-XMD:', '').trim();
                }
                return cleaned.slice(0, 500);
            }
        } catch { continue; }
    }

    return null;
}

// ─── Fallback local si toutes les APIs échouent ──────────────
function getFallbackResponse(msg) {
    const t = (msg || '').toLowerCase();
    const fallbacks = [
        { keys: ['salut', 'bonjour', 'bonsoir', 'wesh', 'yo', 'hi', 'hey'], res: ['wesh 👋', 'salut toi 😏', 'yo ça va ?', 'hey 🔥'] },
        { keys: ['ça va', 'ca va', 'comment tu vas'], res: ['nickel, et toi ?', 'ça tourne 😎', 'top ! toi même ?'] },
        { keys: ['qui t', 'tu es qui', 't\'es quoi'], res: ['BRINDI-XMD le vrai 🔥', 'ton bot préféré 😏'] },
        { keys: ['brandon', 'créateur', 'dev'], res: ['mon boss, le dev camerounais 🇨🇲🔥', 'Brandon le patron 👑'] },
        { keys: ['merci', 'thanks', 'thx'], res: ['de rien 😊', 'toujours 🫡'] },
        { keys: ['tg', 'ferme', 'dégage'], res: ['calme toi 😂', 'non 💀'] },
        { keys: ['quoi', 'koi'], res: ['feur 😂', 'la vie 😎'] },
    ];
    for (const { keys, res } of fallbacks) {
        if (keys.some(k => t.includes(k)))
            return res[Math.floor(Math.random() * res.length)];
    }
    const generic = ['hmmm 🤔', 'dis m\'en plus 😏', 'ok ok 👌', 'mmh 🤨', 'intéressant... 👀'];
    return generic[Math.floor(Math.random() * generic.length)];
}

// ─── Détecter si le bot est tagué ────────────────────────────
function isBotTargeted(message, botJid) {
    const botNum = botJid.split('@')[0].split(':')[0];
    const msg = message.message || {};
    const rawText =
        msg.conversation ||
        msg.extendedTextMessage?.text ||
        msg.imageMessage?.caption ||
        msg.videoMessage?.caption || '';

    if (rawText.includes(`@${botNum}`)) return true;

    const ctx =
        msg.extendedTextMessage?.contextInfo ||
        msg.imageMessage?.contextInfo ||
        msg.videoMessage?.contextInfo;

    if (ctx) {
        const mentioned = ctx.mentionedJid || [];
        if (mentioned.some(jid => jid.split('@')[0].split(':')[0] === botNum)) return true;

        const quotedParticipant = (ctx.participant || '').split('@')[0].split(':')[0];
        const quotedRemote = (ctx.remoteJid || '').split('@')[0].split(':')[0];
        if (quotedParticipant === botNum || quotedRemote === botNum) return true;
    }

    return false;
}

function getCleanText(message, botJid) {
    const botNum = botJid.split('@')[0].split(':')[0];
    const msg = message.message || {};
    const raw =
        msg.conversation ||
        msg.extendedTextMessage?.text ||
        msg.imageMessage?.caption ||
        msg.videoMessage?.caption || '';
    return raw
        .replace(new RegExp(`@${botNum}`, 'g'), '')
        .replace(/@\d+/g, '')
        .trim();
}

// ─── COMMANDE .chatbot on/off ─────────────────────────────────
async function handleChatbotCommand(sock, chatId, message, match) {
    if (!match || match.trim() === '') {
        return sock.sendMessage(chatId, {
            text: `🤖 *CHATBOT BRINDI-XMD*\n\n*.chatbot on* — Activer\n*.chatbot off* — Désactiver\n\n> BRINDI-XMD`
        }, { quoted: message });
    }

    const data = loadData();
    if (!data.chatbot) data.chatbot = {};
    const arg = match.trim().toLowerCase();

    if (arg === 'on') {
        if (data.chatbot[chatId]) {
            return sock.sendMessage(chatId, {
                text: `🤖 Chatbot déjà activé.\n\n> BRINDI-XMD`
            }, { quoted: message });
        }
        data.chatbot[chatId] = true;
        saveData(data);
        return sock.sendMessage(chatId, {
            text: `✅ *Chatbot activé !* 🤖\n\n> BRINDI-XMD`
        }, { quoted: message });
    }

    if (arg === 'off') {
        if (!data.chatbot[chatId]) {
            return sock.sendMessage(chatId, {
                text: `❌ Chatbot déjà désactivé.\n\n> BRINDI-XMD`
            }, { quoted: message });
        }
        delete data.chatbot[chatId];
        saveData(data);
        return sock.sendMessage(chatId, {
            text: `✅ Chatbot désactivé.\n\n> BRINDI-XMD`
        }, { quoted: message });
    }

    return sock.sendMessage(chatId, {
        text: `❌ Usage : *.chatbot on* ou *.chatbot off*\n\n> BRINDI-XMD`
    }, { quoted: message });
}

// ─── HANDLER PRINCIPAL ───────────────────────────────────────
async function handleChatbotResponse(sock, chatId, message, userMessage, senderId) {
    try {
        const data = loadData();
        if (!data.chatbot?.[chatId]) return;

        const botJid = sock.user?.id || sock.user?.jid || '';
        if (!botJid) return;

        if (!isBotTargeted(message, botJid)) return;

        const cleanText = getCleanText(message, botJid);

        if (!cleanText) {
            await showTyping(sock, chatId);
            return sock.sendMessage(chatId, {
                text: `T'as quelque chose à me dire ? 😅\n\n> BRINDI-XMD`
            }, { quoted: message });
        }

        // Mémoire par utilisateur
        if (!chatMemory.has(senderId)) chatMemory.set(senderId, []);
        const history = chatMemory.get(senderId);
        history.push(cleanText);
        if (history.length > 20) history.shift();

        await showTyping(sock, chatId);

        const aiResponse = await getAIResponse(cleanText, history);
        const response = aiResponse || getFallbackResponse(cleanText);

        await sock.sendMessage(chatId, {
            text: `${response}\n\n> BRINDI-XMD`
        }, { quoted: message });

    } catch (err) {
        console.error('❌ handleChatbotResponse:', err.message);
        try {
            await sock.sendMessage(chatId, {
                text: `😵 Petit bug, réessaie !\n\n> BRINDI-XMD`
            }, { quoted: message });
        } catch {}
    }
}

module.exports = { handleChatbotCommand, handleChatbotResponse };

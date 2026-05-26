const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');

// =======================
// MÉMOIRE TEMPORAIRE
// =======================

const chatMemory = {
    messages: new Map(),
    userInfo: new Map()
};

// =======================
// CHARGER DONNÉES
// =======================

function loadUserGroupData() {
    try {
        if (!fs.existsSync(USER_GROUP_DATA)) {
            return { chatbot: {} };
        }
        return JSON.parse(fs.readFileSync(USER_GROUP_DATA));
    } catch (error) {
        console.error('Erreur chargement JSON:', error);
        return { chatbot: {} };
    }
}

// =======================
// SAUVEGARDER DONNÉES
// =======================

function saveUserGroupData(data) {
    try {
        fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Erreur sauvegarde JSON:', error);
    }
}

// =======================
// DELAY
// =======================

function getRandomDelay() {
    return Math.floor(Math.random() * 2000) + 1000;
}

// =======================
// TYPING
// =======================

async function showTyping(sock, chatId) {
    try {
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);
        await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
    } catch (e) {
        console.log('Typing error:', e.message);
    }
}

// =======================
// EXTRAIRE INFOS USER
// =======================

function extractUserInfo(message) {
    const info = {};
    const lower = message.toLowerCase();

    // NOM
    if (lower.includes("je m'appelle")) {
        const name = message.split(/je m'appelle/i)[1]?.trim().split(' ')[0];
        if (name) info.name = name;
    }

    // AGE
    if (lower.includes('ans')) {
        const age = message.match(/\d+/);
        if (age) info.age = age[0];
    }

    return info;
}

// =======================
// COMMANDE CHATBOT
// =======================

async function handleChatbotCommand(sock, chatId, message, match) {
    // HELP
    if (!match) {
        return sock.sendMessage(chatId, {
            text: `🤖 *CONFIGURATION CHATBOT*

*.chatbot on*
➜ Active le chatbot

*.chatbot off*
➜ Désactive le chatbot`,
            quoted: message
        });
    }

    const data = loadUserGroupData();

    // =======================
    // ACTIVER
    // =======================
    if (match === 'on') {
        if (data.chatbot[chatId]) {
            return sock.sendMessage(chatId, {
                text: '✅ Le chatbot est déjà activé.',
                quoted: message
            });
        }

        data.chatbot[chatId] = true;
        saveUserGroupData(data);

        return sock.sendMessage(chatId, {
            text: '✅ Chatbot activé avec succès.',
            quoted: message
        });
    }

    // =======================
    // DÉSACTIVER
    // =======================
    if (match === 'off') {
        if (!data.chatbot[chatId]) {
            return sock.sendMessage(chatId, {
                text: '❌ Le chatbot est déjà désactivé.',
                quoted: message
            });
        }

        delete data.chatbot[chatId];
        saveUserGroupData(data);

        return sock.sendMessage(chatId, {
            text: '✅ Chatbot désactivé avec succès.',
            quoted: message
        });
    }
}

// =======================
// RÉPONSES CHATBOT
// =======================

async function handleChatbotResponse(sock, chatId, message, userMessage, senderId) {
    const data = loadUserGroupData();

    // Vérifie si le chatbot est activé sur ce canal (groupe ou privé)
    if (!data.chatbot[chatId]) return;

    try {
        // Extraction propre du numéro pur du bot (ex: "2376xxxxxx")
        const botNumber = sock.user.id.split(':')[0].split('@')[0];

        // =======================
        // MENTION
        // =======================
        let isBotMentioned = false;
        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        isBotMentioned = mentionedJid.some(jid => jid.includes(botNumber));

        // =======================
        // REPLY (RÉPONSE AU MESSAGE DU BOT)
        // =======================
        let isReplyToBot = false;
        const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;

        if (quotedParticipant) {
            // On nettoie le JID de la personne citée pour ne garder que son numéro pur
            const cleanQuotedParticipant = quotedParticipant.split(':')[0].split('@')[0];
            isReplyToBot = (cleanQuotedParticipant === botNumber);
        }

        // =======================
        // PRIVÉ
        // =======================
        const isPrivate = !chatId.endsWith('@g.us');

        // Correction de la logique d'interception :
        // En privé : il répond à tout. En groupe : uniquement si mentionné OU si on répond à son message.
        if (!isPrivate && !isBotMentioned && !isReplyToBot) return;

        // =======================
        // NETTOYER MESSAGE
        // =======================
        let cleanedMessage = userMessage
            .replace(new RegExp(`@${botNumber}`, 'g'), '')
            .trim();

        if (!cleanedMessage) return;

        // =======================
        // INIT MÉMOIRE
        // =======================
        if (!chatMemory.messages.has(senderId)) {
            chatMemory.messages.set(senderId, []);
            chatMemory.userInfo.set(senderId, {});
        }

        // =======================
        // SAUVEGARDER INFOS
        // =======================
        const info = extractUserInfo(cleanedMessage);
        chatMemory.userInfo.set(senderId, {
            ...chatMemory.userInfo.get(senderId),
            ...info
        });

        // =======================
        // HISTORIQUE
        // =======================
        const history = chatMemory.messages.get(senderId);
        history.push(cleanedMessage);

        if (history.length > 10) {
            history.shift();
        }
        chatMemory.messages.set(senderId, history);

        // =======================
        // TYPING ANIMATION
        // =======================
        await showTyping(sock, chatId);

        // =======================
        // APPEL API IA
        // =======================
        const response = await getAIResponse(cleanedMessage, {
            messages: history,
            userInfo: chatMemory.userInfo.get(senderId)
        });

        console.log('QUESTION:', cleanedMessage);
        console.log('REPONSE:', response);

        // =======================
        // ENVOYER LA RÉPONSE
        // =======================
        await sock.sendMessage(
            chatId,
            { text: response },
            { quoted: message }
        );

    } catch (error) {
        console.error('Erreur chatbot:', error);
        try {
            await sock.sendMessage(chatId, {
                text: "😅 Désolé, j'ai eu un petit bug.",
                quoted: message
            });
        } catch {}
    }
}

// =======================
// CONFIGURATION DE L'IA
// =======================

async function getAIResponse(userMessage, userContext) {
    try {
        const prompt = `Tu es BRINDI Bot.
Tu parles français naturellement comme un humain sur WhatsApp.

Règles :
- Réponses courtes et percutantes
- Style naturel (argot WhatsApp/africain/génération Z si approprié, reste cool)
- Drôles parfois
- Utilise des emojis de manière détendue
- Ne dis jamais que tu es une IA ou un modèle de langage

Historique de la discussion :
${userContext.messages.join('\n')}

Message actuel de l'utilisateur :
${userMessage}`;

        const url = "https://zellapi.autos/ai/chatbot?text=" + encodeURIComponent(prompt);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('API Error: ' + response.status);
        }

        const data = await response.json();
        console.log('API DATA:', data);

        let aiText = null;

        // Extraction selon le format retourné
        if (typeof data === 'string') {
            aiText = data;
        } else if (data.result) {
            aiText = data.result;
        } else if (data.response) {
            aiText = data.response;
        } else if (data.message) {
            aiText = data.message;
        }

        if (!aiText || aiText.trim() === '') {
            const replies = [
                "😂 Tu racontes quoi encore ?",
                "😅 J’ai pas compris là",
                "🤔 Explique un peu mieux",
                "😂 Hein ??",
                "😎 Pas mal ça"
            ];
            return replies[Math.floor(Math.random() * replies.length)];
        }

        // Nettoyage des résidus de prompts
        aiText = aiText
            .replace(/You:/gi, '')
            .replace(/AI:/gi, '')
            .replace(/Bot:/gi, '')
            .trim();

        return aiText;

    } catch (error) {
        console.error('AI ERROR:', error);
        const errors = [
            "😅 Petit problème de connexion",
            "🤖 Mon cerveau a bug un peu",
            "😂 Attends je réfléchis encore",
            "😴 Le serveur dort là"
        ];
        return errors[Math.floor(Math.random() * errors.length)];
    }
}

// =======================
// EXPORTS
// =======================
module.exports = {
    handleChatbotCommand,
    handleChatbotResponse,
    chatMemory
};

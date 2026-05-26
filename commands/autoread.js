const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autoread.json');

// Initialize configuration file if it doesn't exist
function initConfig() {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ activé: false }, null, 2));
    }
    return JSON.parse(fs.readFileSync(configPath));
}

// Toggle autoread feature
async function autoreadCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ *Cette commande est réservée au propriétaire !*\n> BRINDI-XMD',
                contextInfo: { forwardingScore: 1, isForwarded: true }
            });
            return;
        }

        // Get command arguments
        const args = message.message?.conversation?.trim().split(' ').slice(1) || 
                    message.message?.extendedTextMessage?.text?.trim().split(' ').slice(1) || 
                    [];
        
        // Initialize or read config
        const config = initConfig();
        
        // Toggle based on argument or toggle current state if no argument
        if (args.length > 0) {
            const action = args[0].toLowerCase();
            if (action === 'on' || action === 'enable') {
                config.activé = true;
            } else if (action === 'off' || action === 'disable') {
                config.activé = false;
            } else {
                await sock.sendMessage(chatId, {
                    text: '❌ *Option invalide ! Utilisez : .autoread on/off*\n> BRINDI-XMD',
                    contextInfo: { forwardingScore: 1, isForwarded: true }
                });
                return;
            }
        } else {
            // Toggle current state
            config.activé = !config.activé;
        }
        
        // Save updated configuration
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        
        // Send confirmation message
        await sock.sendMessage(chatId, {
            text: `✅ *Auto-read est maintenant ${config.activé ? 'activé' : 'désactivé'} !*\n> BRINDI-XMD`,
            contextInfo: { forwardingScore: 1, isForwarded: true }
        });
        
    } catch (error) {
        console.error('Error in autoread command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ *Erreur lors du traitement de la commande !*\n> BRINDI-XMD',
            contextInfo: { forwardingScore: 1, isForwarded: true }
        });
    }
}

// Function to check if autoread is activé
function isAutoreadEnabled() {
    try {
        const config = initConfig();
        return config.activé;
    } catch (error) {
        console.error('Error checking autoread status:', error);
        return false;
    }
}

// Function to check if bot is mentioned in a message
function isBotMentionedInMessage(message, botNumber) {
    if (!message.message) return false;
    
    const messageTypes = [
        'extendedTextMessage', 'imageMessage', 'videoMessage', 'stickerMessage',
        'documentMessage', 'audioMessage', 'contactMessage', 'locationMessage'
    ];
    
    for (const type of messageTypes) {
        if (message.message[type]?.contextInfo?.mentionedJid) {
            const mentionedJid = message.message[type].contextInfo.mentionedJid;
            if (mentionedJid.some(jid => jid === botNumber)) {
                return true;
            }
        }
    }
    
    const textContent = 
        message.message.conversation || 
        message.message.extendedTextMessage?.text ||
        message.message.imageMessage?.caption ||
        message.message.videoMessage?.caption || '';
    
    if (textContent) {
        const botUsername = botNumber.split('@')[0];
        if (textContent.includes(`@${botUsername}`)) {
            return true;
        }
        
        const botNames = [global.botname?.toLowerCase(), 'bot', 'brindi', 'brindi bot'];
        const words = textContent.toLowerCase().split(/\s+/);
        if (botNames.some(name => words.includes(name))) {
            return true;
        }
    }
    
    return false;
}

// Function to handle autoread functionality
async function handleAutoread(sock, message) {
    if (isAutoreadEnabled()) {
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotMentioned = isBotMentionedInMessage(message, botNumber);
        
        if (isBotMentioned) {
            return false; 
        } else {
            const key = { remoteJid: message.key.remoteJid, id: message.key.id, participant: message.key.participant };
            await sock.readMessages([key]);
            return true; 
        }
    }
    return false; 
}

module.exports = {
    autoreadCommand,
    isAutoreadEnabled,
    isBotMentionedInMessage,
    handleAutoread
};

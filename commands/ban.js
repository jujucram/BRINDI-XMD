const fs = require('fs');
const { channelInfo } = require('../lib/messageConfig');
const isAdmin = require('../lib/isAdmin');
const { isSudo } = require('../lib/index');

async function banCommand(sock, chatId, message) {
    // Restrict in groups to admins; in private to owner/sudo
    const isGroup = chatId.endsWith('@g.us');
    if (isGroup) {
        const senderId = message.key.participant || message.key.remoteJid;
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        if (!isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, { text: '❌ *Seuls les admins peuvent utiliser .ban.*\n> BRINDI-XMD' }, { quoted: message });
            return;
        }
    } else {
        const senderId = message.key.participant || message.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        if (!message.key.fromMe && !senderIsSudo) {
            await sock.sendMessage(chatId, { text: '❌ *Cette commande est réservée au propriétaire / sudo !*\n> BRINDI-XMD' }, { quoted: message });
            return;
        }
    }
    let userToBan;
    
    // Check for mentioned users
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToBan = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToBan = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToBan) {
        await sock.sendMessage(chatId, { 
            text: '❌ *Veuillez mentionner l\'utilisateur ou répondre à son message pour le bannir.*\n> BRINDI-XMD' 
        });
        return;
    }

    // Prevent banning the bot itself
    try {
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (userToBan === botId || userToBan === botId.replace('@s.whatsapp.net', '@lid')) {
            await sock.sendMessage(chatId, { text: '❌ *Vous ne pouvez pas bannir le bot !*\n> BRINDI-XMD' }, { quoted: message });
            return;
        }
    } catch {}

    try {
        // Add user to banned list
        const bannedUsers = JSON.parse(fs.readFileSync('./data/banned.json'));
        if (!bannedUsers.includes(userToBan)) {
            bannedUsers.push(userToBan);
            fs.writeFileSync('./data/banned.json', JSON.stringify(bannedUsers, null, 2));
            
            await sock.sendMessage(chatId, { 
                text: `🔨 *L'utilisateur @${userToBan.split('@')[0]} a été banni avec succès !*\n> BRINDI-XMD`,
                mentions: [userToBan]
            });
        } else {
            await sock.sendMessage(chatId, { 
                text: `⚠️ *L'utilisateur @${userToBan.split('@')[0]} est déjà banni !*\n> BRINDI-XMD`,
                mentions: [userToBan]
            });
        }
    } catch (error) {
        console.error('Error in ban command:', error);
        await sock.sendMessage(chatId, { text: '❌ *Échec du bannissement !*\n> BRINDI-XMD' });
    }
}

module.exports = banCommand;

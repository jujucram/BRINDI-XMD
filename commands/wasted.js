const axios = require('axios');
const { channelInfo } = require('../lib/messageConfig');

async function wastedCommand(sock, chatId, message) {
    let userToWaste;
    
    // Vérifier les utilisateurs mentionnés
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToWaste = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Vérifier si c'est une réponse à un message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToWaste = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToWaste) {
        await sock.sendMessage(chatId, { 
            text: 'Veuillez mentionner quelqu\'un ou répondre à son message pour lui appliquer l\'effet Wasted !', 
            
        }, { quoted: message });
        return;
    }

    try {
        // Récupérer la photo de profil de l'utilisateur
        let profilePic;
        try {
            profilePic = await sock.profilePictureUrl(userToWaste, 'image');
        } catch {
            profilePic = 'https://i.imgur.com/2wzGhpF.jpeg'; // Image par défaut si pas de photo de profil
        }

        // Récupérer l'image avec l'effet "Wasted"
        const wastedResponse = await axios.get(
            `https://some-random-api.com/canvas/overlay/wasted?avatar=${encodeURIComponent(profilePic)}`,
            { responseType: 'arraybuffer' }
        );

        // Envoyer l'image "Wasted"
        await sock.sendMessage(chatId, {
            image: Buffer.from(wastedResponse.data),
            caption: `⚰️ *Wasted* : @${userToWaste.split('@')[0]} 💀\n\nRepose en paix !\n> BRINDI-XMD`,
            mentions: [userToWaste],
        
        });

    } catch (error) {
        console.error('Erreur dans la commande wasted :', error);
        await sock.sendMessage(chatId, { 
            text: 'Impossible de générer l\'image Wasted ! Réessayez plus tard.',
            
        }, { quoted: message });
    }
}

module.exports = wastedCommand;

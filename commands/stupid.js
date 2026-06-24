const fetch = require('node-fetch');

async function stupidCommand(sock, chatId, quotedMsg, mentionedJid, sender, args) {
    try {
        // Déterminer l'utilisateur cible
        let who = quotedMsg 
            ? quotedMsg.sender 
            : mentionedJid && mentionedJid[0] 
                ? mentionedJid[0] 
                : sender;

        // Obtenir le texte pour la carte "stupid" (valeur par défaut : "im+stupid" si aucun texte n'est fourni)
        let text = args && args.length > 0 ? args.join(' ') : 'im+stupid';
        
        // Récupérer l'URL de la photo de profil
        let avatarUrl;
        try {
            avatarUrl = await sock.profilePictureUrl(who, 'image');
        } catch (error) {
            console.error('Erreur lors de la récupération de la photo de profil :', error);
            avatarUrl = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'; // Avatar par défaut
        }

        // Récupérer la carte générée depuis l'API
        const apiUrl = `https://some-random-api.com/canvas/misc/its-so-stupid?avatar=${encodeURIComponent(avatarUrl)}&dog=${encodeURIComponent(text)}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`L'API a répondu avec le statut : ${response.status}`);
        }

        // Obtenir le buffer de l'image
        const imageBuffer = await response.buffer();

        // Envoyer l'image avec la légende et mentionner l'utilisateur
        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `*@${who.split('@')[0]}*`,
            mentions: [who]
        });

    } catch (error) {
        console.error('Erreur dans la commande stupid :', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Désolé, je n\'ai pas pu générer la carte. Réessayez plus tard !'
        });
    }
}

module.exports = { stupidCommand };

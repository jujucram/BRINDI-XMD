const fs = require('fs');
const path = require('path');

// Liste des émojis pour les réactions aux commandes
const commandEmojis = ['⏳'];

// Chemin pour stocker l'état de l'auto-réaction
const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');

// Charger l'état de l'auto-réaction depuis le fichier
function loadAutoReactionState() {
    try {
        if (fs.existsSync(USER_GROUP_DATA)) {
            const data = JSON.parse(fs.readFileSync(USER_GROUP_DATA));
            return data.autoReaction || false;
        }
    } catch (error) {
        console.error('Erreur lors du chargement de l\'état de l\'auto-réaction :', error);
    }
    return false;
}

// Sauvegarder l'état de l'auto-réaction dans le fichier
function saveAutoReactionState(state) {
    try {
        const data = fs.existsSync(USER_GROUP_DATA) 
            ? JSON.parse(fs.readFileSync(USER_GROUP_DATA))
            : { groups: [], chatbot: {} };
        
        data.autoReaction = state;
        fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'état de l\'auto-réaction :', error);
    }
}

// Stocker l'état de l'auto-réaction
let isAutoReactionEnabled = loadAutoReactionState();

function getRandomEmoji() {
    return commandEmojis[0];
}

// Fonction pour ajouter une réaction au message d'une commande
async function addCommandReaction(sock, message) {
    try {
        if (!isAutoReactionEnabled || !message?.key?.id) return;
        
        const emoji = getRandomEmoji();
        await sock.sendMessage(message.key.remoteJid, {
            react: {
                text: emoji,
                key: message.key
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la réaction à la commande :', error);
    }
}

// Fonction pour gérer la commande areact
async function handleAreactCommand(sock, chatId, message, isOwner) {
    try {
        if (!isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ Cette commande est réservée uniquement au propriétaire du bot !',
                quoted: message
            });
            return;
        }

        const args = message.message?.conversation?.split(' ') || [];
        const action = args[1]?.toLowerCase();

        if (action === 'on') {
            isAutoReactionEnabled = true;
            saveAutoReactionState(true);
            await sock.sendMessage(chatId, { 
                text: '✅ Les auto-réactions ont été activées de manière globale.',
                quoted: message
            });
        } else if (action === 'off') {
            isAutoReactionEnabled = false;
            saveAutoReactionState(false);
            await sock.sendMessage(chatId, { 
                text: '✅ Les auto-réactions ont été désactivées de manière globale.',
                quoted: message
            });
        } else {
            const currentState = isAutoReactionEnabled ? 'activées' : 'désactivées';
            await sock.sendMessage(chatId, { 
                text: `Les auto-réactions sont actuellement ${currentState} de manière globale.\n\nUtilisez :\n.areact on - Activer les auto-réactions\n.areact off - Désactiver les auto-réactions`,
                quoted: message
            });
        }
    } catch (error) {
        console.error('Erreur lors de la gestion de la commande areact :', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Une erreur est survenue lors de la configuration des auto-réactions.',
            quoted: message
        });
    }
}

module.exports = {
    addCommandReaction,
    handleAreactCommand
};

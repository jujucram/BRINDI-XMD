const compliments = [
    "Tu es incroyable tel que tu es !",
    "Tu as un excellent sens de l’humour !",
    "Tu es une personne attentionnée et gentille.",
    "Tu es plus fort que tu ne le penses.",
    "Tu illumines la pièce dès que tu arrives !",
    "Tu es un véritable ami.",
    "Tu m’inspires énormément !",
    "Ta créativité n’a aucune limite !",
    "Tu as un cœur en or.",
    "Tu fais une différence dans ce monde.",
    "Ta positivité est contagieuse !",
    "Tu as une incroyable éthique de travail.",
    "Tu fais ressortir le meilleur chez les autres.",
    "Ton sourire illumine la journée de tout le monde.",
    "Tu es talentueux dans tout ce que tu fais.",
    "Ta gentillesse rend le monde meilleur.",
    "Tu as une vision unique et magnifique.",
    "Ton enthousiasme est vraiment inspirant !",
    "Tu es capable de réaliser de grandes choses.",
    "Tu sais toujours comment rendre quelqu’un spécial.",
    "Ta confiance en toi est admirable.",
    "Tu as une belle âme.",
    "Ta générosité n’a pas de limites.",
    "Tu as le sens du détail.",
    "Ta passion est vraiment motivante !",
    "Tu es une personne qui sait écouter.",
    "Tu es plus fort que tu ne le crois !",
    "Ton rire est contagieux.",
    "Tu as un don naturel pour valoriser les autres.",
    "Tu rends le monde meilleur juste par ta présence."
];

async function complimentCommand(sock, chatId, message) {
    try {
        if (!message || !chatId) {
            console.log('Invalid message or chatId:', { message, chatId });
            return;
        }

        let userToCompliment;

        // Vérifie les mentions
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            userToCompliment = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }
        // Vérifie les réponses à un message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToCompliment = message.message.extendedTextMessage.contextInfo.participant;
        }

        if (!userToCompliment) {
            await sock.sendMessage(chatId, {
                text: 'Veuillez mentionner quelqu’un ou répondre à son message !\n> BRINDI-XMD'
            });
            return;
        }

        const compliment = compliments[Math.floor(Math.random() * compliments.length)];

        // Petit délai pour éviter le rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));

        await sock.sendMessage(chatId, {
            text: `✨ @${userToCompliment.split('@')[0]}, ${compliment}\n> BRINDI-XMD`,
            mentions: [userToCompliment]
        });

    } catch (error) {
        console.error('Error in compliment command:', error);

        if (error.data === 429) {
            await new Promise(resolve => setTimeout(resolve, 2000));

            try {
                await sock.sendMessage(chatId, {
                    text: 'Veuillez réessayer dans quelques secondes.\n> BRINDI-XMD'
                });
            } catch (retryError) {
                console.error('Error sending retry message:', retryError);
            }

        } else {
            try {
                await sock.sendMessage(chatId, {
                    text: 'Une erreur est survenue lors de l’envoi du compliment.\n> BRINDI-XMD'
                });
            } catch (sendError) {
                console.error('Error sending error message:', sendError);
            }
        }
    }
}

module.exports = { complimentCommand };
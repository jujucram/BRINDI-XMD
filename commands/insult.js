const insults = [
    "Tu es comme un nuage. Quand tu pars, la journée devient magnifique.",
    "Tu apportes tellement de joie aux gens… surtout quand tu quittes la pièce.",
    "J’accepterais ton avis, mais alors nous aurions tous les deux tort.",
    "Tu n’es pas stupide, tu réfléchis juste avec difficulté.",
    "Tes secrets sont en sécurité avec moi… je ne les écoute même pas.",
    "Tu prouves que même l’évolution prend parfois des pauses.",
    "Tu as quelque chose sur le menton… non, encore plus bas.",
    "Tu es comme une mise à jour système : personne n’a envie de toi maintenant.",
    "Tu rends les gens heureux… quand tu t’en vas.",
    "Tu es comme une pièce de monnaie : deux faces et peu de valeur.",
    "Tu as quelque chose dans la tête… ah non finalement.",
    "Tu es la raison pour laquelle il y a des instructions sur les bouteilles de shampoing.",
    "Tu flottes partout sans véritable objectif.",
    "Tes blagues sont comme du lait périmé : difficiles à supporter.",
    "Tu es comme une bougie dans le vent : inutile quand ça devient sérieux.",
    "Ton talent spécial, c’est d’énerver tout le monde équitablement.",
    "Tu es comme un signal Wi-Fi : faible au pire moment.",
    "Tu prouves qu’on peut être agaçant naturellement.",
    "Ton énergie aspire toute la bonne humeur autour de toi.",
    "Tu as le visage parfait pour faire de la radio.",
    "Tu es comme un embouteillage : personne ne te veut mais tu es là.",
    "Tu es comme un crayon cassé : inutile.",
    "Tes idées sont tellement originales… que je les ai déjà entendues partout.",
    "Tu es la preuve vivante que même les erreurs peuvent survivre.",
    "Tu n’es pas paresseux, tu es motivé à ne rien faire.",
    "Ton cerveau fonctionne comme Windows 95 : lent et dépassé.",
    "Tu es comme un ralentisseur : personne ne t’aime mais tout le monde doit te supporter.",
    "Tu es comme un moustique : juste agaçant.",
    "Tu réunis les gens… pour parler de toi."
];

async function insultCommand(sock, chatId, message) {

    try {

        if (!message || !chatId) {
            console.log('Invalid message or chatId:', {
                message,
                chatId
            });
            return;
        }

        let userToInsult;

        // Vérifie les mentions
        if (
            message.message?.extendedTextMessage
                ?.contextInfo?.mentionedJid?.length > 0
        ) {

            userToInsult =
                message.message.extendedTextMessage
                    .contextInfo.mentionedJid[0];
        }

        // Vérifie les réponses
        else if (
            message.message?.extendedTextMessage
                ?.contextInfo?.participant
        ) {

            userToInsult =
                message.message.extendedTextMessage
                    .contextInfo.participant;
        }

        if (!userToInsult) {

            await sock.sendMessage(chatId, {
                text:
`❌ Mentionne quelqu’un ou réponds à son message pour l’insulter !

> BRINDI-XMD`
            });

            return;
        }

        const insult =
            insults[Math.floor(Math.random() * insults.length)];

        // Anti spam
        await new Promise(resolve =>
            setTimeout(resolve, 1000)
        );

        await sock.sendMessage(chatId, {

            text:
`😹 @${userToInsult.split('@')[0]}, ${insult}

> BRINDI-XMD`,

            mentions: [userToInsult]

        });

    } catch (error) {

        console.error('Error in insult command:', error);

        if (error.data === 429) {

            await new Promise(resolve =>
                setTimeout(resolve, 2000)
            );

            try {

                await sock.sendMessage(chatId, {
                    text:
`⏳ Veuillez réessayer dans quelques secondes.

> BRINDI-XMD`
                });

            } catch (retryError) {

                console.error(
                    'Error sending retry message:',
                    retryError
                );
            }

        } else {

            try {

                await sock.sendMessage(chatId, {
                    text:
`❌ Une erreur est survenue lors de l’insulte.

> BRINDI-XMD`
                });

            } catch (sendError) {

                console.error(
                    'Error sending error message:',
                    sendError
                );
            }
        }
    }
}

module.exports = { insultCommand };
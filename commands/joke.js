/**
 * Commande Blagues pour BRINDI-XMD
 * Envoie une blague de papa bien lourde en français.
 */
module.exports = async function (sock, chatId, message) {
    try {
        // Liste de blagues de papa en français pour BRINDI-XMD
        const blagues = [
            "Pourquoi les plongeurs plongent-ils toujours en arrière et jamais en avant ?\nParce que sinon ils tombent dans le bateau !",
            "Tu connais la blague de la chaise ?\nElle est pliante !",
            "Pourquoi les oiseaux volent-ils vers le sud en hiver ?\nParce que c'est trop long d'y aller à pied !",
            "Qu'est-ce qu'une table qui réfléchit ?\nUne table de multiplication !",
            "Quel est le comble pour un électricien ?\nDe ne pas être au courant !",
            "Deux poissons discutent :\n- Tu fais quoi dans la vie ?\n- Rien, et toi ?\n- L'eau !",
            "Pourquoi les squelettes ne se battent-ils jamais entre eux ?\nParce qu'ils n'ont pas de couilles ! (euh, de courage...)",
            "Que dit un oignon quand il se cogne ?\n'Aïe !'",
            "Quel est le poisson le plus sourdingue ?\nLe hareng (ah l'an) !",
            "Comment appelle-t-on un chien qui fait de la magie ?\nUn Labradabrador !"
        ];

        // Sélection aléatoire d'une blague
        const indexAleatoire = Math.floor(Math.random() * blagues.length);
        const blagueChoisie = blagues[indexAleatoire];

        // Formatage du message version BRINDI-XMD
        const messageBrindi = `🤣 *『 𝑩𝑹𝑰𝑵𝑫𝑰-𝑿𝑴𝑫 : 𝑩𝑳𝑨𝑮𝑼𝑬 』* 🤣\n\n${blagueChoisie}\n\n*Humour 100% garanti (ou pas) !* 💀`;

        // Envoi du message sur WhatsApp (avec citation du message d'origine si présent)
        await sock.sendMessage(chatId, { text: messageBrindi }, { quoted: message });

    } catch (error) {
        console.error('Erreur dans la commande blague de BRINDI-XMD :', error);
        await sock.sendMessage(
            chatId, 
            { text: '❌ *[BRINDI-XMD]* Une erreur est survenue. Impossible de raconter une blague pour le moment. Riez tout seul !' }, 
            { quoted: message }
        );
    }
};

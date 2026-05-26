
async function truthCommand(sock, chatId, message) {
    try {
        // Liste de questions "Vérité" en français pour BRINDI-XMD
        const verites = [
            "Quel est ton plus grand mensonge que personne n'a jamais découvert ?",
            "Quelle est la chose la plus embarrassante que tu as faite par amour ?",
            "Si tu pouvais échanger ta vie avec quelqu'un dans ce groupe, ce serait qui et pourquoi ?",
            "Quel est le dernier mensonge que tu as dit à ton meilleur ami ou à ton partenaire ?",
            "Quelle est ta pire habitude quand tu es seul(e) chez toi ?",
            "As-tu déjà fouillé discrètement dans le téléphone de quelqu'un d'autre ?",
            "Quelle est la chose la plus ridicule que tu as achetée sur un coup de tête ?",
            "Si tu gagnais au loto demain, quelle est la toute première chose que tu ferais ?",
            "Quel est le secret que tu as juré de garder mais que tu as quand même répété ?",
            "Quelle est la personne présente dans ce groupe (ou ce chat) que tu trouves la plus attirante ?"
        ];

        // Sélection aléatoire d'une vérité
        const indexAleatoire = Math.floor(Math.random() * verites.length);
        const veriteChoisie = verites[indexAleatoire];

        // Formatage du message avec la touche BRINDI-XMD
        const messageBrindi = `🔮 *『 𝑩𝑹𝑰𝑵𝑫𝑰-𝑿𝑴𝑫 : 𝑽𝑬𝑹𝑰𝑻𝑬 』* 🔮\n\n🤔 *Ta question :*\n${veriteChoisie}\n\n*Pas de mensonge, on te regarde !* 👀`;

        // Envoi du message sur WhatsApp
        await sock.sendMessage(chatId, { text: messageBrindi }, { quoted: message });

    } catch (error) {
        console.error('Erreur dans la commande truth de BRINDI-XMD :', error);
        await sock.sendMessage(
            chatId, 
            { text: '❌ *[BRINDI-XMD]* Une erreur est survenue. Impossible de récupérer une question pour le moment. Réessayez plus tard !' }, 
            { quoted: message }
        );
    }
}

module.exports = { truthCommand };

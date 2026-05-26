
async function dareCommand(sock, chatId, message) {
    try {
        // Liste de défis en français pour BRINDI-XMD
        const defis = [
            "Fais 15 pompes et envoie une preuve ou jure que tu l'as fait !",
            "Envoie une note vocale en chantant le refrain de ta chanson préférée.",
            "Raconte la blague la plus nulle que tu connaisses.",
            "Change ta photo de profil pendant 2 heures par une image choisie par le groupe.",
            "Dis quel est ton plus grand secret ou ton plus grand regret.",
            "Envoie le dernier screen de ta galerie sans tricher !",
            "Déclare ta flamme de manière ultra romantique à la 3ème personne de ta liste de discussion.",
            "Imite le cri d'un animal de la ferme dans une note vocale de 5 secondes.",
            "Envoie un message textuel à ton ex en disant simplement : 'Tu me manques' (et assume la réponse !).",
            "Donne une note sur 10 à la personne qui t'a tagué ou qui a lancé la commande."
        ];

        // Sélection aléatoire d'un défi
        const indexAleatoire = Math.floor(Math.random() * defis.length);
        const defiChoisi = defis[indexAleatoire];

        // Formatage du message avec le nom de ton bot
        const messageBrindi = `⚡ *『 𝑩𝑹𝑰𝑵𝑫𝑰-𝑿𝑴𝑫 : 𝑨𝑪𝑻𝑰𝑶𝑵 』* ⚡\n\n🎯 *Ton défi :*\n${defiChoisi}\n\n*Alors, tu relèves le défi ou tu dégonfles ?* 😏`;

        // Envoi du message sur WhatsApp
        await sock.sendMessage(chatId, { text: messageBrindi }, { quoted: message });

    } catch (error) {
        console.error('Erreur dans la commande dare de BRINDI-XMD :', error);
        await sock.sendMessage(
            chatId, 
            { text: '❌ *[BRINDI-XMD]* Une erreur est survenue. Impossible de récupérer un défi pour le moment. Réessayez plus tard !' }, 
            { quoted: message }
        );
    }
}

module.exports = { dareCommand };

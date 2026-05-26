
module.exports = async function (sock, chatId, message) {
    try {
        // Liste de faits insolites en français pour BRINDI-XMD
        const faitsInutiles = [
            "Les flamants roses ne sont pas nés roses. Ils le deviennent à cause des crevettes qu'ils mangent !",
            "Le cœur des crevettes se trouve dans leur tête.",
            "Il est physiquement impossible pour les cochons de regarder le ciel.",
            "Les chats dorment en moyenne 70% de leur vie.",
            "Le cri d'un canard ne fait pas d'écho, et personne ne sait vraiment pourquoi.",
            "Les bananes sont courbées parce qu'elles poussent en direction du soleil.",
            "Le miel est le seul aliment qui ne se périme jamais. On a trouvé du miel vieux de 3 000 ans encore comestible !",
            "Vos yeux ont la même taille depuis votre naissance, mais votre nez et vos oreilles ne s'arrêtent jamais de grandir.",
            "Le jeu des ciseaux, de la feuille et du morceau de pierre a été inventé en Chine.",
            "Les vaches ont des meilleures amies et se stressent quand elles sont séparées.",
            "L'ADN d'un humain est identique à 50% à celui d'une banane.",
            "Le cri de la girafe n'existe pas, elle est presque totalement muette !"
        ];

        // Sélection aléatoire d'un fait
        const indexAleatoire = Math.floor(Math.random() * faitsInutiles.length);
        const faitChoisi = faitsInutiles[indexAleatoire];

        // Formatage du message version BRINDI-XMD
        const messageBrindi = `💡 *『 𝑩𝑹𝑰𝑵𝑫𝑰-𝑿𝑴𝑫 : 𝑰𝑵𝑭𝑶 𝑰𝑵𝑼𝑻𝑰𝑳𝑬 』* 💡\n\n🧠 *Le saviez-vous ?*\n${faitChoisi}\n\n*Voilà, tu te coucheras moins bête ce soir !* 😂`;

        // Envoi du message sur WhatsApp
        await sock.sendMessage(chatId, { text: messageBrindi }, { quoted: message });

    } catch (error) {
        console.error('Erreur dans la commande infos de BRINDI-XMD :', error);
        await sock.sendMessage(
            chatId, 
            { text: '❌ *[BRINDI-XMD]* Une erreur est survenue. Impossible de charger une info pour le moment.' }, 
            { quoted: message }
        );
    }
};

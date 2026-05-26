
module.exports = async function quoteCommand(sock, chatId, message) {
    try {
        // Liste de citations inspirantes en français pour BRINDI-XMD
        const citations = [
            "« Le plus grand risque est de ne prendre aucun risque. » – Mark Zuckerberg",
            "« Exige beaucoup de toi-même et attends peu des autres. Ainsi beaucoup d'ennuis te seront épargnés. » – Confucius",
            "« La vie, c'est comme une bicyclette, il faut avancer pour ne pas perdre l'équilibre. » – Albert Einstein",
            "« Tout est possible à qui rêve, ose, travaille et n'abandonne jamais. » – Xavier Dolan",
            "« Le bonheur n'est pas quelque chose de tout fait. Il découle de vos propres actions. » – Dalaï Lama",
            "« Que vos choix soient le reflet de vos espoirs, non de vos peurs. » – Nelson Mandela",
            "« Il n'y a qu'une façon d'échouer, c'est d'abandonner avant d'avoir réussi. » – Georges Clemenceau",
            "« La seule façon de faire du bon travail, c'est d'aimer ce que vous faites. » – Steve Jobs",
            "« Le passé ne peut être changé. Le futur est encore entre vos mains. » – Inconnu",
            "« Sois le changement que tu veux voir dans ce monde. » – Mahatma Gandhi"
        ];

        // Sélection aléatoire d'une citation
        const indexAleatoire = Math.floor(Math.random() * citations.length);
        const citationChoisie = citations[indexAleatoire];

        // Formatage du message version BRINDI-XMD
        const messageBrindi = `📜 *『 𝑩𝑹𝑰𝑵𝑫𝑰-𝑿𝑴𝑫 : 𝑪𝑰𝑻𝑨𝑻𝑰𝑶𝑵 』* 📜\n\n${citationChoisie}\n\n*Médite là-dessus...* ✨`;

        // Envoi du message sur WhatsApp
        await sock.sendMessage(chatId, { text: messageBrindi }, { quoted: message });

    } catch (error) {
        console.error('Erreur dans la commande quote de BRINDI-XMD :', error);
        await sock.sendMessage(
            chatId, 
            { text: '❌ *[BRINDI-XMD]* Une erreur est survenue. Impossible de récupérer une citation pour le moment. Réessayez plus tard !' }, 
            { quoted: message }
        );
    }
};

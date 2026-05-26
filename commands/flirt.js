const flirts = [
    "💘 Ton sourire est capable d’illuminer toute ma journée.",
    "😍 Si la beauté était un crime, tu serais déjà condamné(e).",
    "🥰 Chaque fois que je te parle, mon cœur bat plus vite.",
    "💕 Tu es la meilleure partie de ma journée.",
    "😘 Même les étoiles sont jalouses de ton éclat.",
    "💖 J’aimerais être ton téléphone pour rester toujours dans tes mains.",
    "😍 Ton regard me fait complètement fondre.",
    "💞 Avec toi, chaque moment devient spécial.",
    "🥺 Tu es tellement adorable que c’en est dangereux.",
    "❤️ Je pourrais passer des heures à parler avec toi sans me lasser.",
    "💓 Tu rends mon monde plus beau juste par ta présence.",
    "😘 Si embrasser était un langage, je te parlerais toute la nuit.",
    "🌹 Tu es plus doux(ce) qu’un rêve.",
    "💘 Je crois que mon cœur t’a choisi depuis longtemps.",
    "🥰 Impossible de ne pas sourire quand je pense à toi.",
    "💕 Tu es la définition parfaite de la beauté.",
    "😍 Je suis sûr(e) que même Cupidon est jaloux de toi.",
    "💖 Tu fais battre mon cœur comme jamais.",
    "😘 Ton charme devrait être interdit.",
    "❤️ Avec toi, tout semble magique."
];

async function flirtCommand(sock, chatId, message) {

    try {

        const flirtMessage =
            flirts[Math.floor(Math.random() * flirts.length)];

        // Envoyer le message de flirt
        await sock.sendMessage(chatId, {
            text: `${flirtMessage}\n> BRINDI-XMD`
        }, { quoted: message });

    } catch (error) {

        console.error('Error in flirt command:', error);

        await sock.sendMessage(chatId, {
            text:
`❌ Impossible d’obtenir un message de flirt.

Réessaie plus tard !

> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = { flirtCommand };
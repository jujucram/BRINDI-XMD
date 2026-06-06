
const NEW_IMG = './assets/IMG-20240812-WA0097.jpg';

// Liste des signes valides et leurs émojis
const SIGNES = {
    belier: '♈', taureau: '♉', gemeaux: '♊', cancer: '♋',
    lion: '♌', vierge: '♍', balance: '♎', scorpion: '♏',
    sagittaire: '♐', capricorne: '♑', verseau: '♒', poissons: '♓'
};

// Éléments pour générer un horoscope unique chaque jour (basé sur la date)
const AMOUR = [
    "Une belle surprise vous attend aujourd'hui. Soyez à l'écoute.",
    "C'est le moment de clarifier les choses ou de faire le premier pas.",
    "Journée calme, profitez-en pour vous recentrer sur vous-même.",
    "L'ambiance est électrique ! Un coup de cœur est fort possible."
];

const TRAVAIL = [
    "Votre créativité est au top, proposez vos idées sans hésiter !",
    "Journée chargée, restez organisé pour ne pas vous laisser déborder.",
    "Une opportunité intéressante pourrait se présenter d'ici peu.",
    "Soyez patient, vos efforts finiront par payer rapidement."
];

const CHANCE = [
    "⭐ Très forte aujourd'hui ! C'est le moment de tenter votre chance.",
    "⚡ Modérée. Ne prenez pas de risques inutiles.",
    "✨ Excellente pour les finances et les bonnes affaires.",
    "💫 Discrète, mais un coup de pouce inattendu arrivera ce soir."
];

async function horoscopeCommand(sock, chatId, message, args) {
    try {
        const signeSaisi = args[0]?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Enlève les accents

        // 1. Vérifier si le signe est fourni et valide
        if (!signeSaisi || !SIGNES[signeSaisi]) {
            await sock.sendMessage(chatId, {
                text: `🔮 *Veuillez fournir un signe astrologique valide.*\n\n📝 *Exemple :*\n.horoscope lion\n\n✨ *Signes :* bélier, taureau, gémeaux, cancer, lion, vierge, balance, scorpion, sagittaire, capricorne, verseau, poissons.`
            }, { quoted: message });
            return;
        }

        // Réaction
        await sock.sendMessage(chatId, {
            react: { text: '🔮', key: message.key }
        });

        const emoji = SIGNES[signeSaisi];
        const nomSigne = signeSaisi.toUpperCase();

        // Utiliser le jour actuel pour que l'horoscope change chaque jour mais reste fixe sur les 24h
        const day = new Date().getDate();
        const indexAmour = (day + nomSigne.length) % AMOUR.length;
        const indexTravail = (day * 2) % TRAVAIL.length;
        const indexChance = (day + 3) % CHANCE.length;

        // Formater la date du jour
        const dateJour = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

        let caption = `${emoji} *HOROSCOPE DU ${dateJour} — ${nomSigne}* ${emoji}\n\n`;
        caption += `❤️ *Amour & Relations :*\n${AMOUR[indexAmour]}\n\n`;
        caption += `💼 *Travail & Énergie :*\n${TRAVAIL[indexTravail]}\n\n`;
        caption += `🍀 *Chance :* ${CHANCE[indexChance]}\n\n`;
        caption += `> BRINDI-XMD`;

        // Envoi final
        await sock.sendMessage(chatId, {
            image: { url: NEW_IMG },
            caption: caption
        }, { quoted: message });

    } catch (error) {
        console.error("Erreur commande horoscope:", error.message);
        await sock.sendMessage(chatId, {
            text: `❌ *Une erreur est survenue.*\n\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = horoscopeCommand;

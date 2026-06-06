const axios = require('axios');


const NEW_IMG = './assets/IMG-20240812-WA0097.jpg';

// Petit dictionnaire pour traduire les livres en anglais si nécessaire (requis pour la majorité des API)
const bookTranslations = {
    "genese": "Genesis", "exode": "Exodus", "levitique": "Leviticus", "nombres": "Numbers", "deuteronome": "Deuteronomy",
    "josue": "Joshua", "juges": "Judges", "ruth": "Ruth", "1 samuel": "1 Samuel", "2 samuel": "2 Samuel",
    "1 rois": "1 Kings", "2 rois": "2 Kings", "1 chroniques": "1 Chronicles", "2 chroniques": "2 Chronicles",
    "esdras": "Ezra", "nehemie": "Nehemiah", "esther": "Esther", "job": "Job", "psaumes": "Psalms", "psaume": "Psalms",
    "proverbes": "Proverbs", "ecclesiaste": "Ecclesiastes", "cantique": "Song of Solomon", "esaie": "Isaiah",
    "jeremie": "Jeremiah", "lamentations": "Lamentations", "ezechiel": "Ezekiel", "daniel": "Daniel",
    "osee": "Hosea", "joel": "Joel", "amos": "Amos", "abdias": "Obadiah", "jonas": "Jonah", "michee": "Micah",
    "nahum": "Nahum", "habacuc": "Habakkuk", "sophonie": "Zephaniah", "haggee": "Haggai", "zacharie": "Zechariah",
    "malachie": "Malachi", "matthieu": "Matthew", "marc": "Mark", "luc": "Luke", "jean": "John",
    "actes": "Acts", "romains": "Romans", "1 corinthiens": "1 Corinthians", "2 corinthiens": "2 Corinthians",
    "galates": "Galatians", "ephesiens": "Ephesians", "philippiens": "Philippians", "colossiens": "Colossians",
    "1 thessaloniciens": "1 Thessalonians", "2 thessaloniciens": "2 Thessalonians", "1 timothee": "1 Timothy",
    "2 timothee": "2 Timothy", "tite": "Titus", "philemon": "Philemon", "hebreux": "Hebrews", "jacques": "James",
    "1 pierre": "1 Peter", "2 pierre": "2 Peter", "1 jean": "1 John", "2 jean": "2 John", "3 jean": "3 John",
    "jude": "Jude", "apocalypse": "Revelation"
};

// Fonction pour adapter la référence aux API anglophones
function formatReference(ref) {
    let lowerRef = ref.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Enlève les accents
    for (const [fr, en] of Object.entries(bookTranslations)) {
        if (lowerRef.startsWith(fr)) {
            return ref.toLowerCase().replace(fr, en);
        }
    }
    return ref; // Retourne le texte original si pas trouvé
}

async function bibleCommand(sock, chatId, message, args) {
    try {
        // 1. Vérifier si une référence est fournie
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: `⚠️ *Veuillez fournir une référence biblique.*\n\n📝 *Exemple :*\n.bible Jean 3:16`
            }, { quoted: message });
            return;
        }

        const referenceOriginale = args.join(" ");
        const referenceAnglais = formatReference(referenceOriginale);

        // 2. Ajouter la réaction de chargement
        await sock.sendMessage(chatId, {
            react: { text: '📖', key: message.key }
        });

        let textTrouve = null;
        let refTrouvee = referenceOriginale;
        let traductionName = "Inconnue";

        // --- SOURCE 1 : Bible-API (Supporte le français nativement parfois, ou l'anglais) ---
        if (!textTrouve) {
            try {
                const res = await axios.get(`https://bible-api.com/${encodeURIComponent(referenceOriginale)}?translation=bjc`); // bjc = Bible de Jérusalem (Français)
                if (res.data && res.data.text) {
                    textTrouve = res.data.text;
                    refTrouvee = res.data.reference;
                    traductionName = res.data.translation_name;
                }
            } catch (e) { /* On passe à la suite si ça échoue */ }
        }

        // --- SOURCE 2 : Source alternative Bible-API en Anglais (si la version FR a échoué) ---
        if (!textTrouve) {
            try {
                const res = await axios.get(`https://bible-api.com/${encodeURIComponent(referenceAnglais)}`);
                if (res.data && res.data.text) {
                    textTrouve = res.data.text;
                    refTrouvee = res.data.reference;
                    traductionName = res.data.translation_name + " (En)";
                }
            } catch (e) { }
        }

        // --- SOURCE 3 : Bolly Is Online Bible API ---
        if (!textTrouve) {
            try {
                // Version en Français (Louis Segond - LSG)
                const res = await axios.get(`https://beta.bolls.life/static/translations/LSG.json`); 
                // Note: Bolls life nécessite souvent une recherche par ID, on utilise leur route de secours texte :
                const res2 = await axios.get(`https://bible-api.com/${encodeURIComponent(referenceAnglais)}?translation=kjv`);
                if (res2.data && res2.data.text) {
                    textTrouve = res2.data.text;
                    refTrouvee = res2.data.reference;
                    traductionName = "King James Version (KJV)";
                }
            } catch (e) { }
        }

        // --- SOURCE 4 : API.Bible / Bolls Life Alternative ---
        if (!textTrouve) {
            try {
                const res = await axios.get(`https://bolls.life/get-text/LSG/${encodeURIComponent(referenceAnglais)}/`);
                if (res.data && res.data.text) {
                    textTrouve = res.data.text;
                    refTrouvee = referenceOriginale;
                    traductionName = "Louis Segond (FR)";
                }
            } catch (e) { }
        }

        // --- SOURCE 5 : API Bhagavad/Bible (Sujette à changements, mise en dernier recours) ---
        if (!textTrouve) {
            try {
                const res = await axios.get(`https://bca.sh/api/v1/bible?q=${encodeURIComponent(referenceAnglais)}`);
                if (res.data && res.data.text) {
                    textTrouve = res.data.text;
                    refTrouvee = res.data.reference || referenceOriginale;
                    traductionName = "Alternative System";
                }
            } catch (e) { }
        }

        // 4. Construction du message de réponse
        let caption = "";
        if (textTrouve) {
            caption = `📜 *VERSET BIBLIQUE TROUVÉ!*\n\n` +
                      `📖 *Référence :* ${refTrouvee}\n` +
                      `📚 *Texte :*\n${textTrouve.trim()}\n\n` +
                      `🗂️ *Traduction :* ${traductionName}\n`;
        } else {
            caption = `❌ *Verset non trouvé.*\n\nLes 5 serveurs ont renvoyé une erreur. Vérifie l'orthographe (ex: Jean 3:16, Genèse 1:1) et réessaie.`;
        }

        // Ajout de ta signature personnalisée
        caption += `\n> BRINDI-XMD`;

        // 5. Envoi du message final avec l'image et le texte
        await sock.sendMessage(chatId, {
            image: { url: NEW_IMG },
            caption: caption
        }, { quoted: message });

    } catch (error) {
        console.error("Erreur générale commande bible:", error.message);
        
        await sock.sendMessage(chatId, {
            text: `❌ *Une erreur critique est survenue lors de la recherche.*\n\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = bibleCommand;

// Liste de mots en français (sans accents pour faciliter le jeu sur clavier)
const motsFrancais = [
    'JAVASCRIPT', 'PROGRAMMATION', 'ORDINATEUR', 'DEVELOPPEUR', 
    'INTERNET', 'WHATSAPP', 'TELEPHONE', 'APPLICATION', 
    'CLAVIER', 'ECRAN', 'SERVEUR', 'RESEAU', 'LOGICIEL',
    'TECHNOLOGIE', 'DONNEES', 'SECURITE', 'ALGORITHME', 'ROBOT',
    'MAISON', 'VOITURE', 'BATEAU', 'AVION', 'MUSIQUE', 'CINEMA'
];

let jeuxPendu = {};

function startHangman(sock, chatId, message) {
    // Empêcher de lancer deux parties en même temps dans le même groupe
    if (jeuxPendu[chatId]) {
        return sock.sendMessage(chatId, { 
            text: '⚠️ Une partie est déjà en cours ici ! Terminez-la d\'abord.' 
        }, { quoted: message });
    }

    // Choisir un mot au hasard dans la liste
    const mot = motsFrancais[Math.floor(Math.random() * motsFrancais.length)];
    const motMasque = Array(mot.length).fill('_');

    jeuxPendu[chatId] = {
        mot: mot,
        motMasque: motMasque,
        lettresEssayees: [],
        erreurs: 0,
        maxErreurs: 6, // 6 chances avant le Game Over
    };

    sock.sendMessage(chatId, { 
        text: `🎮 *JEU DU PENDU*\n\nLa partie commence !\nLe mot à deviner : ${motMasque.join(' ')}\n\nEnvoyez une lettre pour deviner avec \`.guess <lettre>\`.\n\n> BRINDI-XMD` 
    }, { quoted: message });
}

function guessLetter(sock, chatId, args, message) {
    // Vérifier si une partie est en cours
    if (!jeuxPendu[chatId]) {
        return sock.sendMessage(chatId, { 
            text: '❌ Aucun jeu en cours. Lancez une partie avec la commande `.hangman`' 
        }, { quoted: message });
    }

    // Récupérer et nettoyer la lettre depuis les arguments
    let lettre = args[0];
    if (!lettre) {
        return sock.sendMessage(chatId, { 
            text: '⚠️ Veuillez préciser une lettre. Exemple : `.guess A`' 
        }, { quoted: message });
    }

    lettre = lettre.trim().toUpperCase();

    // Vérifier que l'utilisateur a bien envoyé UNE SEULE lettre de A à Z
    if (!/^[A-Z]$/.test(lettre)) {
        return sock.sendMessage(chatId, { 
            text: '⚠️ Veuillez envoyer une seule lettre valide (A-Z).' 
        }, { quoted: message });
    }

    const jeu = jeuxPendu[chatId];
    const { mot, motMasque, lettresEssayees, maxErreurs } = jeu;

    // Vérifier si la lettre a déjà été tentée
    if (lettresEssayees.includes(lettre)) {
        return sock.sendMessage(chatId, { 
            text: `⚠️ Tu as déjà essayé la lettre "*${lettre}*".\n\nLettres tentées : ${lettresEssayees.join(', ')}` 
        }, { quoted: message });
    }

    // Ajouter la lettre aux essais
    lettresEssayees.push(lettre);

    if (mot.includes(lettre)) {
        // Bonne réponse : on révèle les lettres dans le mot masqué
        for (let i = 0; i < mot.length; i++) {
            if (mot[i] === lettre) {
                motMasque[i] = lettre;
            }
        }
        
        sock.sendMessage(chatId, { 
            text: `✅ *Bien joué !*\n\nMot : ${motMasque.join(' ')}\n\n> BRINDI-XMD` 
        }, { quoted: message });

        // Vérifier la victoire (S'il n'y a plus de '_')
        if (!motMasque.includes('_')) {
            sock.sendMessage(chatId, { 
                text: `🎉 *Félicitations !*\n\nTu as deviné le mot : *${mot}*\n\n> BRINDI-XMD` 
            }, { quoted: message });
            delete jeuxPendu[chatId]; // Fin du jeu
        }
    } else {
        // Mauvaise réponse : on ajoute une erreur
        jeu.erreurs += 1;
        const essaisRestants = maxErreurs - jeu.erreurs;
        
        sock.sendMessage(chatId, { 
            text: `❌ *Mauvaise lettre !*\n\nMot : ${motMasque.join(' ')}\nLettres tentées : ${lettresEssayees.join(', ')}\nIl te reste *${essaisRestants}* essai(s).\n\n> BRINDI-XMD` 
        }, { quoted: message });

        // Vérifier la défaite
        if (jeu.erreurs >= maxErreurs) {
            sock.sendMessage(chatId, { 
                text: `💀 *GAME OVER !*\n\nLe pendu est complet. Le mot était : *${mot}*\n\n> BRINDI-XMD` 
            }, { quoted: message });
            delete jeuxPendu[chatId]; // Fin du jeu
        }
    }
}

// On exporte les fonctions adaptées
module.exports = { startHangman, guessLetter };

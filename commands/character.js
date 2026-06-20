const axios = require('axios');
const { channelInfo } = require('../lib/messageConfig');

async function characterCommand(sock, chatId, message) {
    let userToAnalyze;
    
    // Vérifier si un utilisateur est mentionné
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToAnalyze = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Vérifier si on répond à un message (reply)
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToAnalyze = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    // Si personne n'est ciblé
    if (!userToAnalyze) {
        await sock.sendMessage(chatId, { 
            text: '⚠️ Veuillez mentionner quelqu\'un ou répondre à son message pour analyser son caractère !' 
        }, { quoted: message });
        return;
    }

    try {
        // Récupérer la photo de profil de l'utilisateur ciblé
        let profilePic;
        try {
            profilePic = await sock.profilePictureUrl(userToAnalyze, 'image');
        } catch {
            profilePic = 'https://i.imgur.com/2wzGhpF.jpeg'; // Image par défaut s'il n'en a pas
        }

        // Liste des traits de caractère en français
        const traits = [
            "Intelligent(e)", "Créatif(ve)", "Déterminé(e)", "Ambitieux(se)", "Attentionné(e)",
            "Charismatique", "Confiant(e)", "Empathique", "Énergique", "Amical(e)",
            "Généreux(se)", "Honnête", "Drôle", "Imaginatif(ve)", "Indépendant(e)",
            "Intuitif(ve)", "Gentil(le)", "Logique", "Fidèle", "Optimiste",
            "Passionné(e)", "Patient(e)", "Persévérant(e)", "Fiable", "Débrouillard(e)",
            "Sincère", "Réfléchi(e)", "Compréhensif(ve)", "Polyvalent(e)", "Sage"
        ];

        // Obtenir 3 à 5 traits de manière aléatoire
        const numTraits = Math.floor(Math.random() * 3) + 3; // Nombre entre 3 et 5
        const selectedTraits = [];
        for (let i = 0; i < numTraits; i++) {
            const randomTrait = traits[Math.floor(Math.random() * traits.length)];
            if (!selectedTraits.includes(randomTrait)) {
                selectedTraits.push(randomTrait);
            }
        }

        // Calculer des pourcentages aléatoires pour chaque trait sélectionné
        const traitPercentages = selectedTraits.map(trait => {
            const percentage = Math.floor(Math.random() * 41) + 60; // Nombre aléatoire entre 60 et 100
            return `• ${trait} : ${percentage}%`;
        });

        // 🟢 FORMATAGE DU NUMÉRO (Ajout du '+' avant l'identifiant)
        const formatNumber = "+" + userToAnalyze.split('@')[0];

        // Création du message d'analyse final
        const analysis = `🔮 *Analyse de Caractère* 🔮\n\n` +
            `👤 *Utilisateur :* ${formatNumber}\n\n` +
            `✨ *Traits Principaux :*\n${traitPercentages.join('\n')}\n\n` +
            `🎯 *Note Globale :* ${Math.floor(Math.random() * 21) + 80}%\n\n` +
            `> BRINDI-XMD`;

        // Envoyer l'analyse avec la photo de profil
        await sock.sendMessage(chatId, {
            image: { url: profilePic },
            caption: analysis,
            mentions: [userToAnalyze] // Permet de rendre le tag cliquable si besoin
        }, { quoted: message });

    } catch (error) {
        console.error('[CHARACTER ERROR]', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Échec de l\'analyse du caractère ! Réessayez plus tard.' 
        }, { quoted: message });
    }
}

module.exports = characterCommand;

const yts = require('yt-search');
const axios = require('axios');

async function playCommand(sock, chatId, message) {
    try {
        // 1. Sécurisation de l'extraction du texte pour éviter le crash sur split()
        const text = message.message?.conversation || 
                     message.message?.extendedTextMessage?.text || 
                     message.message?.imageMessage?.caption || ""; // Ajout d'un fallback string vide
        
        const args = text.trim().split(/\s+/); // Gère les espaces multiples
        const searchQuery = args.slice(1).join(' ').trim();
        
        if (!searchQuery) {
            return await sock.sendMessage(chatId, { 
                text: "Quel morceau veux-tu télécharger ? Exemple : *!play Gangsta's Paradise*"
            });
        }

        // 2. Recherche YouTube
        const searchResult = await yts(searchQuery);
        if (!searchResult || !searchResult.videos || searchResult.videos.length === 0) {
            return await sock.sendMessage(chatId, { 
                text: "Aucun morceau trouvé pour cette recherche !"
            });
        }

        // Envoi du message d'attente
        await sock.sendMessage(chatId, {
            text: "_Veuillez patienter, le téléchargement est en cours..._"
        });

        const video = searchResult.videos[0];
        const urlYt = encodeURIComponent(video.url); // Sécurise l'URL pour la requête API

        // 3. Appel de l'API avec configuration Axios sécurisée
        const apiUrl = `https://apis-keith.vercel.app/download/dlmp3?url=${urlYt}`;
        
        const response = await axios.get(apiUrl, { 
            timeout: 15000, // Évite que le bot reste bloqué indéfiniment si l'API rame (15s)
            validateStatus: function (status) {
                return status >= 200 && status < 500; // Ne crash pas si l'API renvoie un code 400+
            }
        });

        const data = response.data;

        // 4. Vérification stricte des données reçues
        if (!data || !data.status || !data.result || !data.result.downloadUrl) {
            return await sock.sendMessage(chatId, { 
                text: "L'API de téléchargement a renvoyé une erreur ou est hors ligne. Réessayez plus tard."
            });
        }

        const audioUrl = data.result.downloadUrl;
        const title = data.result.title || "audio";

        // 5. Envoi du fichier Audio sur WhatsApp
        await sock.sendMessage(chatId, {
            audio: { url: audioUrl },
            mimetype: "audio/mp4", // Plus compatible sur WhatsApp que audio/mpeg pour les players internes
            fileName: `${title}.mp3`
        }, { quoted: message });

    } catch (error) {
        // Log propre dans la console sans couper le processus du bot
        console.error(' Erreur dans la commande play :', error.message);
        
        try {
            await sock.sendMessage(chatId, { 
                text: "Une erreur critique est survenue lors du téléchargement. Réessayez plus tard."
            });
        } catch (msgError) {
            console.error("Impossible d'envoyer le message d'erreur au chat :", msgError.message);
        }
    }
}

module.exports = playCommand;

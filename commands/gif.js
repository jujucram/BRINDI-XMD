const axios = require('axios');

const GIPHY_API_KEY = 'VOTRE_CLES_API';

async function gifCommand(sock, chatId, message, query) {
    // 1. Vérification stricte du mot-clé
    if (!query || !query.trim()) {
        return await sock.sendMessage(chatId, {
            text: `❌ Précise un mot-clé !\n💡 Exemple : *.gif chat drôle*\n\n> BRINDI-XMD`
        }, { quoted: message });
    }

    try {
        // 2. Appel à l'API Giphy avec filtres optimisés
        const res = await axios.get('https://api.giphy.com/v1/gifs/search', {
            params: {
                api_key: GIPHY_API_KEY,
                q: query.trim(),
                limit: 1,
                rating: 'g' // Filtre de sécurité (Tout public)
            },
            timeout: 6000 // Évite que le bot bloque indéfiniment si l'API rame
        });

        const gif = res.data?.data?.[0];

        // 3. Si aucun résultat n'est trouvé
        if (!gif) {
            return await sock.sendMessage(chatId, {
                text: `😕 Aucun GIF trouvé pour *"${query.trim()}"*.\n\n> BRINDI-XMD`
            }, { quoted: message });
        }

        // 4. Extraction sécurisée de l'URL du GIF (priorité au format léger pour mobile)
        const gifUrl = gif.images?.downsized_medium?.url || 
                       gif.images?.fixed_height?.url || 
                       gif.images?.original?.url;

        if (!gifUrl) throw new Error('URL du GIF introuvable dans la réponse');

        // 5. Envoi au format "Autoplay / Loop" (Vrai style GIF WhatsApp)
        await sock.sendMessage(chatId, {
            video: { url: gifUrl },
            caption: `🎞️ *Recherche :* ${query.trim()}\n\n> BRINDI-XMD`,
            gifPlayback: true
        }, { quoted: message });

    } catch (error) {
        console.error('[GIF ERROR]', error.message);
        
        // Message d'erreur discret et propre pour le chat
        await sock.sendMessage(chatId, {
            text: `❌ Impossible de récupérer un GIF pour le moment. Réessaye.\n\n> BRINDI-XMD`
        }, { quoted: message });
    }
}

module.exports = gifCommand;

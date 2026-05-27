const axios = require('axios');

module.exports = async function (sock, chatId) {
    try {
        const apiKey = '';//votre apiKey

        // Actualités en français
        const response = await axios.get(
            `https://newsapi.org/v2/top-headlines?country=fr&language=fr&apiKey=${apiKey}`
        );

        const articles = response.data.articles.slice(0, 5);

        let newsMessage = '📰 *Dernières actualités* 📰\n\n';

        articles.forEach((article, index) => {
            newsMessage += `*${index + 1}. ${article.title || 'Titre indisponible'}*\n`;
            newsMessage += `${article.description || 'Aucune description disponible.'}\n\n`;
        });

        newsMessage += '> BRINDI-XMD';

        await sock.sendMessage(chatId, {
            text: newsMessage
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des actualités :', error);

        await sock.sendMessage(chatId, {
            text: '❌ Désolé, impossible de récupérer les actualités pour le moment.\n\n> BRINDI-XMD'
        });
    }
};

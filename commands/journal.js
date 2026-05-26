
// Sources RSS réelles : RFI, France 24, Le Monde, BBC Afrique
const axios = require('axios');

const NEW_IMG = './assets/IMG-20240812-WA0097.jpg';



// Sources RSS par catégorie (100% gratuites, sans clé)
const RSS_SOURCES = {
    monde: [
        'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.france24.com%2Ffr%2Frss',
        'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.lemonde.fr%2Frss%2Fune.xml',
        'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Ffeeds.bbci.co.uk%2Fnews%2Fworld%2Frss.xml'
    ],
    guinee: [
        'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.rfi.fr%2Ffr%2Frss%2Fafrique.xml',
        'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.jeuneafrique.com%2Ffeed%2F',
        'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.rfi.fr%2Ffr%2Fpodcasts%2F20-minutes-dactu-rfi.xml'
    ],
    afrique: [
        'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.rfi.fr%2Ffr%2Frss%2Fafrique.xml',
        'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.jeuneafrique.com%2Ffeed%2F',
        'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Ffeeds.bbci.co.uk%2Fnews%2Fworld%2Fafrica%2Frss.xml'
    ],
    france: [
        'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.lemonde.fr%2Frss%2Fune.xml',
        'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.lefigaro.fr%2Frss%2Ffigaro_actualites.xml',
        'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.france24.com%2Ffr%2Ffrance%2Frss'
    ],
    sport: [
        'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.france24.com%2Ffr%2Fsports%2Frss',
        'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.rfi.fr%2Ffr%2Frss%2Fsports.xml',
        'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Ffeeds.bbci.co.uk%2Fsport%2Frss.xml'
    ],
    tech: [
        'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.france24.com%2Ffr%2Ftag%2Fintelligence-artificielle%2Frss',
        'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Ffeeds.feedburner.com%2FJournalduNet',
        'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.numerama.com%2Ffeed%2F'
    ]
};

function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#\d+;/g, '')
        .trim();
}

async function fetchRSS(url) {
    const r = await axios.get(url, { timeout: 12000 });
    const items = r.data?.items || [];
    const now = new Date();
    
    return items
        .map(item => {
            const pubDate = item.pubDate ? new Date(item.pubDate) : null;
            const ageJours = pubDate ? Math.floor((now - pubDate) / (1000 * 60 * 60 * 24)) : 999;
            return {
                titre: cleanText(item.title),
                source: cleanText(item.author) || r.data?.feed?.title || 'Inconnu',
                description: cleanText(item.description || item.content || '').slice(0, 150),
                date: pubDate ? pubDate.toLocaleDateString('fr-FR') : '',
                timestamp: pubDate ? pubDate.getTime() : 0,
                ageJours
            };
        })
        .filter(a => a.titre && a.ageJours <= 7) // Articles des 7 derniers jours
        .sort((a, b) => b.timestamp - a.timestamp); // Plus récents en premier
}

async function journalCommand(sock, chatId, message, args) {
    const categorie = args[0]?.toLowerCase() || 'monde';
    const sources = RSS_SOURCES[categorie] || RSS_SOURCES.monde;

    await sock.sendMessage(chatId, {
        react: { text: '📰', key: message.key }
    });
    await sock.sendMessage(chatId, {
        text: `📰 Chargement du journal *${categorie.toUpperCase()}*...\n⏳ Connexion aux sources...`
    }, { quoted: message });

    const today = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    let articles = [];
    let sourceUsed = '';

    // Essayer chaque source RSS
    for (const url of sources) {
        try {
            const results = await fetchRSS(url);
            if (results.length > 0) {
                articles = results.slice(0, 6);
                // Extraire le nom de la source de l'URL
                if (url.includes('france24')) sourceUsed = 'France 24';
                else if (url.includes('rfi')) sourceUsed = 'RFI';
                else if (url.includes('lemonde')) sourceUsed = 'Le Monde';
                else if (url.includes('lefigaro')) sourceUsed = 'Le Figaro';
                else if (url.includes('jeuneafrique')) sourceUsed = 'Jeune Afrique';
                else if (url.includes('bbc')) sourceUsed = 'BBC Afrique';
                else if (url.includes('numerama')) sourceUsed = 'Numerama';
                else sourceUsed = 'RSS';
                break;
            }
        } catch (e) {
            console.log(`RSS failed (${url.slice(0, 50)}): ${e.message}`);
        }
    }

    const icons = {
        monde: '🌍', guinee: '🇬🇳', afrique: '🌍',
        france: '🇫🇷', sport: '⚽', tech: '💻'
    };
    const icon = icons[categorie] || '📰';

    let caption = `${icon} *JOURNAL — BRINDI-XMD*\n`;
    caption += `📅 ${today}\n`;
    if (sourceUsed) caption += `📡 Source : *${sourceUsed}*\n`;
    caption += `\n╔══════════════════════╗\n`;
    caption += `║ 📰 *ACTUALITÉS ${categorie.toUpperCase()}* 📰 ║\n`;
    caption += `╚══════════════════════╝\n\n`;

    if (articles.length === 0) {
        caption += `❌ Sources temporairement indisponibles.\n\nRéessaie dans quelques instants.`;
    } else {
        articles.forEach((a, i) => {
            caption += `*${i + 1}.* 📌 *${a.titre}*\n`;
            if (a.source) caption += `   📡 ${a.source}\n`;
            if (a.description) caption += `   📝 ${a.description}...\n`;
            if (a.date) caption += `   📅 ${a.date}\n`;
            caption += `\n`;
        });
        caption += `━━━━━━━━━━━━━━━━━━\n`;
        caption += `💡 *Catégories :*\n`;
        caption += `🌍 .journal monde | 🇬🇳 .journal guinee\n`;
        caption += `🌍 .journal afrique | 🇫🇷 .journal france\n`;
        caption += `⚽ .journal sport | 💻 .journal tech\n`;
    }

    caption += `\n> 🥷 Brandon`;

    await sock.sendMessage(chatId, {
        image: { url: NEW_IMG },
        caption,
        
    }, { quoted: message });
}

module.exports = journalCommand;

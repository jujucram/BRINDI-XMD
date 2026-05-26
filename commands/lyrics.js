const axios = require('axios');
const fetch = require('node-fetch');

// 5 APIs de lyrics avec fallback
async function fetchLyrics(query) {
    const apis = [
        // API 1 : lyricsapi.fly.dev
        async () => {
            const r = await fetch(`https://lyricsapi.fly.dev/api/lyrics?q=${encodeURIComponent(query)}`, { timeout: 12000 });
            const d = await r.json();
            if (d?.result?.lyrics) return { lyrics: d.result.lyrics, title: d.result.title || query, artist: d.result.artist || '' };
            return null;
        },
        // API 2 : xteam lyrics
        async () => {
            const r = await axios.get(`https://api.xteam.xyz/lyrics?title=${encodeURIComponent(query)}&apikey=d90a9e986e18778b`, { timeout: 12000 });
            const d = r.data;
            if (d?.result?.lyrics || d?.lyrics) return { lyrics: d.result?.lyrics || d.lyrics, title: d.result?.title || d.title || query, artist: d.result?.artist || d.artist || '' };
            return null;
        },
        // API 3 : siputzx
        async () => {
            const r = await fetch(`https://api.siputzx.my.id/api/search/lyrics?q=${encodeURIComponent(query)}`, { timeout: 12000 });
            const d = await r.json();
            const item = d?.data?.[0] || d?.result?.[0];
            if (item?.lyrics) return { lyrics: item.lyrics, title: item.title || query, artist: item.artist || '' };
            return null;
        },
        // API 4 : lolhuman
        async () => {
            const r = await axios.get(`https://api.lolhuman.xyz/api/lirik?apikey=85faf717d0545d14074659ad&query=${encodeURIComponent(query)}`, { timeout: 12000 });
            const d = r.data;
            if (d?.result?.lyrics || d?.result) return { lyrics: d.result?.lyrics || d.result, title: d.result?.title || query, artist: d.result?.artist || '' };
            return null;
        },
        // API 5 : giftedtech
        async () => {
            const r = await fetch(`https://api.giftedtech.my.id/api/search/lyrics?apikey=gifted&q=${encodeURIComponent(query)}`, { timeout: 12000 });
            const d = await r.json();
            if (d?.result?.lyrics) return { lyrics: d.result.lyrics, title: d.result.title || query, artist: d.result.artist || '' };
            return null;
        },
    ];

    for (const api of apis) {
        try {
            const result = await api();
            if (result?.lyrics && result.lyrics.length > 10) return result;
        } catch { continue; }
    }
    return null;
}

// Remplacement de 'args' par directement 'songTitle' qui vient du main
async function lyricsCommand(sock, chatId, songTitle, message) {

    // Suppression de la ligne : const songTitle = args.join(' '); 
    // car songTitle est déjà une chaîne de texte propre.

    if (!songTitle || songTitle.trim() === '') {
        return await sock.sendMessage(chatId, {
            image: { url: './assets/IMG-20240812-WA0097.jpg' },
            caption: `╔═══════════════════════╗\n║  🥷 *BRINDI-𝗫𝗠𝗗 v1.0* 🥷  ║\n╠═══════════════════════╣\n║   🎵 *PAROLES MUSIQUE* ║\n╚═══════════════════════╝\n\n💡 *Usage :* \`.lyrics <titre de la chanson>\`\n\n📌 *Exemples :*\n┌──────────────────────\n│ ⬡ .lyrics Shape of You\n│ ⬡ .lyrics Bohemian Rhapsody\n│ ⬡ .lyrics Believer Imagine Dragons\n└──────────────────────\n\n> _Propulsé par 🥷 Brandon_`,
            
        }, { quoted: message });
    }

    await sock.sendMessage(chatId, {
        text: `🎵 _Recherche des paroles de_ *"${songTitle}"*...\n⏳ _Patiente..._`
    }, { quoted: message });

    const result = await fetchLyrics(songTitle);

    if (!result) {
        return await sock.sendMessage(chatId, {
            text: `╔═══════════════════════╗\n║  🥷 *BRINDI-𝗫𝗠𝗗 v1.0* 🥷  ║\n╚═══════════════════════╝\n\n❌ *Paroles introuvables pour :*\n"${songTitle}"\n\n💡 *Conseils :*\n┌──────────────────────\n│ ⬡ Vérifiez l'orthographe\n│ ⬡ Ajoutez le nom de l'artiste\n│ ⬡ Utilisez le titre original\n└──────────────────────`,
            
        }, { quoted: message });
    }

    const { lyrics, title, artist } = result;
    const header = `╔═══════════════════════╗\n║  🥷 *BRINDI-𝗫𝗠𝗗 v1.0* 🥷  ║\n╠═══════════════════════╣\n║   🎵 *PAROLES TROUVÉES* ║\n╚═══════════════════════╝\n\n🎤 *Titre :* ${title}\n${artist ? `👤 *Artiste :* ${artist}\n` : ''}\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    const footer = `\n\n━━━━━━━━━━━━━━━━━━━━━━\n> _Propulsé par 🥷 Brandon_`;
    const MAX = 3800;
    const full = header + lyrics + footer;

    if (full.length <= MAX) {
        // Correction ici : Retrait de 'contextInfo: channelInfo' pour éviter le crash de variable indéfinie
        await sock.sendMessage(chatId, { text: full }, { quoted: message });
    } else {
        // Envoie en 2 parties si trop long
        await sock.sendMessage(chatId, {
            text: header + lyrics.slice(0, MAX) + '\n\n_📄 Suite ci-dessous..._',
            
        }, { quoted: message });
        await new Promise(r => setTimeout(r, 1000));
        await sock.sendMessage(chatId, {
            text: lyrics.slice(MAX) + footer,
            
        });
    }
}

module.exports = { lyricsCommand };

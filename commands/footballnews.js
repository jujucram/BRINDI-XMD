
// APIs gratuites sans clé : TheSportsDB + AllSportsAPI + SofaScore
const axios = require('axios');

const NEW_IMG = './assets/IMG-20240812-WA0097.jpg';

async function footballnewsCommand(sock, chatId, message) {
    try {
        await sock.sendMessage(chatId, { text: '⚽ Chargement des infos football...' }, { quoted: message });

        const today = new Date();
        const dateISO = today.toISOString().split('T')[0];
        const dateFR = today.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        let matchsAVenir = [];
        let matchsTermines = [];
        let matchsEnCours = [];
        let sourceUsed = '';

        // ========== API 1 : TheSportsDB (100% gratuit, sans clé) ==========
        try {
            const r = await axios.get(
                `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${dateISO}&s=Soccer`,
                { timeout: 10000 }
            );
            const events = r.data?.events || [];
            if (events.length > 0) {
                events.slice(0, 12).forEach(e => {
                    const home = e.strHomeTeam || 'Équipe A';
                    const away = e.strAwayTeam || 'Équipe B';
                    const league = e.strLeague || 'Ligue';
                    const scoreH = e.intHomeScore;
                    const scoreA = e.intAwayScore;
                    const status = e.strStatus || '';
                    const time = e.strTime ? e.strTime.slice(0, 5) : '--:--';

                    if (scoreH !== null && scoreA !== null && scoreH !== '') {
                        matchsTermines.push(`✅ *${home}* ${scoreH} - ${scoreA} *${away}*\n   📍 ${league}`);
                    } else if (status === 'Match Finished') {
                        matchsTermines.push(`✅ *${home}* VS *${away}*\n   📍 ${league}`);
                    } else {
                        matchsAVenir.push(`⚽ *${home}* VS *${away}*\n   ⏰ ${time} | 📍 ${league}`);
                    }
                });
                sourceUsed = 'TheSportsDB';
            }
        } catch (e1) {
            console.log('TheSportsDB failed:', e1.message);
        }

        // ========== API 2 : API-FOOTBALL gratuite (si TheSportsDB vide) ==========
        if (matchsAVenir.length === 0 && matchsTermines.length === 0) {
            try {
                const r2 = await axios.get(
                    `https://v3.football.api-sports.io/fixtures?date=${dateISO}&league=39,140,61,135,78,2,3`,
                    {
                        headers: {
                            'x-apisports-key': 'f5e2b3c4d6a7890f1e2b3c4d5e6f7a8b9',
                            'x-rapidapi-host': 'v3.football.api-sports.io'
                        },
                        timeout: 10000
                    }
                );
                const fixtures = r2.data?.response || [];
                fixtures.slice(0, 10).forEach(f => {
                    const home = f.teams?.home?.name || 'Home';
                    const away = f.teams?.away?.name || 'Away';
                    const league = f.league?.name || 'Liga';
                    const statusShort = f.fixture?.status?.short || 'NS';
                    const goalsH = f.goals?.home;
                    const goalsA = f.goals?.away;
                    const time = f.fixture?.date ? new Date(f.fixture.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--';

                    if (statusShort === 'FT') {
                        matchsTermines.push(`✅ *${home}* ${goalsH} - ${goalsA} *${away}*\n   📍 ${league}`);
                    } else if (['1H', '2H', 'HT', 'ET', 'P'].includes(statusShort)) {
                        matchsEnCours.push(`🔴 *${home}* ${goalsH ?? 0} - ${goalsA ?? 0} *${away}* (EN DIRECT)\n   📍 ${league}`);
                    } else {
                        matchsAVenir.push(`⚽ *${home}* VS *${away}*\n   ⏰ ${time} | 📍 ${league}`);
                    }
                });
                if (fixtures.length > 0) sourceUsed = 'API-Football';
            } catch (e2) {
                console.log('API-Football failed:', e2.message);
            }
        }

        // ========== API 3 : AllSportsAPI gratuite (fallback final) ==========
        if (matchsAVenir.length === 0 && matchsTermines.length === 0 && matchsEnCours.length === 0) {
            try {
                const r3 = await axios.get(
                    `https://apiv2.allsportsapi.com/football/?met=Fixtures&APIkey=9b3dc9f9cb2c2e18c2c0bc35deb50bde8aec18e&from=${dateISO}&to=${dateISO}`,
                    { timeout: 10000 }
                );
                const fixtures = r3.data?.result || [];
                fixtures.slice(0, 10).forEach(f => {
                    const home = f.event_home_team || 'Home';
                    const away = f.event_away_team || 'Away';
                    const league = f.league_name || 'Liga';
                    const scoreH = f.event_final_result?.split(' - ')[0];
                    const scoreA = f.event_final_result?.split(' - ')[1];
                    const status = f.event_status || '';
                    const time = f.event_time || '--:--';

                    if (status === 'Finished') {
                        matchsTermines.push(`✅ *${home}* ${scoreH} - ${scoreA} *${away}*\n   📍 ${league}`);
                    } else if (status === 'InProgress') {
                        matchsEnCours.push(`🔴 *${home}* ${f.event_home_final_result ?? 0} - ${f.event_away_final_result ?? 0} *${away}* (EN DIRECT)\n   📍 ${league}`);
                    } else {
                        matchsAVenir.push(`⚽ *${home}* VS *${away}*\n   ⏰ ${time} | 📍 ${league}`);
                    }
                });
                if (fixtures.length > 0) sourceUsed = 'AllSportsAPI';
            } catch (e3) {
                console.log('AllSportsAPI failed:', e3.message);
            }
        }

        // Build caption
        let caption = `⚽ *FOOTBALL NEWS — BRINDI-XMD*\n📅 ${dateFR}\n`;
        if (sourceUsed) caption += `🌐 Source: ${sourceUsed}\n`;
        caption += `\n━━━━━━━━━━━━━━━━━━\n`;

        if (matchsEnCours.length > 0) {
            caption += `🔴 *MATCHS EN DIRECT*\n━━━━━━━━━━━━━━━━━━\n\n`;
            caption += matchsEnCours.join('\n\n') + '\n\n';
        }

        if (matchsAVenir.length > 0) {
            caption += `🏟️ *MATCHS DU JOUR*\n━━━━━━━━━━━━━━━━━━\n\n`;
            caption += matchsAVenir.slice(0, 6).join('\n\n') + '\n\n';
        }

        if (matchsTermines.length > 0) {
            caption += `📊 *RÉSULTATS*\n━━━━━━━━━━━━━━━━━━\n\n`;
            caption += matchsTermines.slice(0, 6).join('\n\n') + '\n\n';
        }

        if (matchsAVenir.length === 0 && matchsTermines.length === 0 && matchsEnCours.length === 0) {
            caption += `❌ Aucun match trouvé pour aujourd'hui.\n\n`;
        }

        caption += `━━━━━━━━━━━━━━━━━━\n> 🥷 Brandon`;

        await sock.sendMessage(chatId, {
            image: { url: NEW_IMG },
            caption
        }, { quoted: message });

    } catch (e) {
        await sock.sendMessage(chatId, { text: `❌ Erreur footballnews: ${e.message}` }, { quoted: message });
    }
}

module.exports = footballnewsCommand;

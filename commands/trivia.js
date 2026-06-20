const axios = require('axios');

const triviaGames = {};

// =======================
// DÉCODER HTML
// =======================
function decodeHTML(text) {
    if (!text) return '';
    return text
        .toString()
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}

// =======================
// MÉLANGER TABLEAU
// =======================
function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }
    return array;
}

// =======================
// QUESTIONS DE SECOURS (100% FR - Nettoyé)
// =======================
const fallbackQuestions = [
    { question: "Quelle est la capitale du Cameroun ?", correct_answer: "Yaoundé", incorrect_answers: ["Douala", "Bafoussam", "Garoua"] },
    { question: "Quelle est la capitale économique du Cameroun ?", correct_answer: "Douala", incorrect_answers: ["Yaoundé", "Garoua", "Kribi"] },
    { question: "Quel pays d'Afrique est surnommé 'L'Afrique en miniature' ?", correct_answer: "Le Cameroun", incorrect_answers: ["Le Sénégal", "La Côte d'Ivoire", "Le Kenya"] },
    { question: "Quelle est la monnaie du Cameroun ?", correct_answer: "Le Franc CFA", incorrect_answers: ["Le Naira", "Le Dollar", "L'Euro"] },
    { question: "Qui a peint la Joconde ?", correct_answer: "Léonard de Vinci", incorrect_answers: ["Michel-Ange", "Raphaël", "Pablo Picasso"] },
    { question: "Quelle est la formule chimique de l'eau ?", correct_answer: "H2O", incorrect_answers: ["CO2", "O2", "H2SO4"] },
    { question: "Quel est le plus grand océan du monde ?", correct_answer: "L'océan Pacifique", incorrect_answers: ["L'océan Atlantique", "L'océan Indien", "L'océan Arctique"] },
    { question: "En quelle année a eu lieu la Révolution française ?", correct_answer: "1789", incorrect_answers: ["1815", "1776", "1804"] },
    { question: "Combien de joueurs y a-t-il dans une équipe de football ?", correct_answer: "11", incorrect_answers: ["9", "10", "12"] },
    { question: "Qui a écrit 'Les Misérables' ?", correct_answer: "Victor Hugo", incorrect_answers: ["Émile Zola", "Gustave Flaubert", "Alexandre Dumas"] },
    { question: "Quelle planète est la plus proche du Soleil ?", correct_answer: "Mercure", incorrect_answers: ["Vénus", "Mars", "La Terre"] },
    { question: "Quel est le plus petit pays du monde ?", correct_answer: "Le Vatican", incorrect_answers: ["Monaco", "Saint-Marin", "Malte"] },
    { question: "Quelle est la capitale de la France ?", correct_answer: "Paris", incorrect_answers: ["Lyon", "Marseille", "Bordeaux"] },
    { question: "Combien de continents y a-t-il sur Terre ?", correct_answer: "7", incorrect_answers: ["5", "6", "8"] },
    { question: "Quel est l'animal terrestre le plus rapide ?", correct_answer: "Le guépard", incorrect_answers: ["Le lion", "Le cheval", "L'antilope"] },
    { question: "Combien de côtés a un hexagone ?", correct_answer: "6", incorrect_answers: ["5", "7", "8"] },
    { question: "Quel est le plus grand pays du monde par superficie ?", correct_answer: "La Russie", incorrect_answers: ["Le Canada", "La Chine", "Les États-Unis"] },
    { question: "Combien d'os compte le corps humain adulte ?", correct_answer: "206", incorrect_answers: ["185", "213", "230"] },
    { question: "Quelle est la langue la plus parlée dans le monde ?", correct_answer: "Le mandarin", incorrect_answers: ["L'anglais", "L'espagnol", "L'hindi"] },
    { question: "En quelle année l'homme a-t-il marché sur la Lune pour la première fois ?", correct_answer: "1969", incorrect_answers: ["1965", "1972", "1959"] },
    { question: "Quel fleuve est le plus long du monde ?", correct_answer: "Le Nil", incorrect_answers: ["L'Amazone", "Le Congo", "Le Mississippi"] },
    { question: "Quelle est la température d'ébullition de l'eau à pression normale ?", correct_answer: "100°C", incorrect_answers: ["90°C", "120°C", "80°C"] },
    { question: "Quel scientifique a développé la théorie de la relativité ?", correct_answer: "Albert Einstein", incorrect_answers: ["Isaac Newton", "Galilée", "Nikola Tesla"] },
    { question: "Quel est le plus grand mammifère du monde ?", correct_answer: "La baleine bleue", incorrect_answers: ["L'éléphant d'Afrique", "Le requin baleine", "Le requin blanc"] },
    { question: "Qui est le dieu de la mythologie grecque du Tonnerre ?", correct_answer: "Zeus", incorrect_answers: ["Poséidon", "Hadès", "Arès"] },
    { question: "Quel pays est aussi appelé le Pays du Soleil Levant ?", correct_answer: "Le Japon", incorrect_answers: ["La Chine", "La Corée du Sud", "La Thaïlande"] },
    { question: "Quelle est la capitale du Canada ?", correct_answer: "Ottawa", incorrect_answers: ["Toronto", "Montréal", "Vancouver"] },
    { question: "Combien de cœurs possède une pieuvre ?", correct_answer: "3", incorrect_answers: ["1", "2", "4"] },
    { question: "Qui a découvert la pénicilline ?", correct_answer: "Alexander Fleming", incorrect_answers: ["Louis Pasteur", "Marie Curie", "Albert Einstein"] },
    { question: "Quel gaz les plantes absorbent-elles pour faire la photosynthèse ?", correct_answer: "Le dioxyde de carbone", incorrect_answers: ["L'oxygène", "L'azote", "L'hydrogène"] },
    { question: "Dans quel pays se trouvent les pyramides de Gizeh ?", correct_answer: "L'Égypte", incorrect_answers: ["Le Mexique", "Le Pérou", "La Grèce"] },
    { question: "Quelle est la couleur obtenue en mélangeant du bleu et du jaune ?", correct_answer: "Le vert", incorrect_answers: ["L'orange", "Le violet", "Le marron"] },
    { question: "Quel est le plus grand désert du monde ?", correct_answer: "L'Antarctique", incorrect_answers: ["Le Sahara", "Le désert de Gobi", "Le désert du Kalahari"] },
    { question: "Quel organe est affecté par l'hépatite ?", correct_answer: "Le foie", incorrect_answers: ["Les poumons", "Le cœur", "Les reins"] },
    { question: "Qui est le créateur du réseau social Facebook ?", correct_answer: "Mark Zuckerberg", incorrect_answers: ["Steve Jobs", "Bill Gates", "Elon Musk"] },
    { question: "Combien de cordes possède une guitare classique ?", correct_answer: "6", incorrect_answers: ["4", "5", "7"] },
    { question: "Quel fruit est le plus produit au monde ?", correct_answer: "La tomate", incorrect_answers: ["La banane", "La pomme", "L'orange"] },
    { question: "De quel pays le groupe de musique ABBA est-il originaire ?", correct_answer: "La Suède", incorrect_answers: ["La Norvège", "Le Danemark", "Le Royaume-Uni"] },
    { question: "Qui est l'auteur de la pièce 'Roméo et Juliette' ?", correct_answer: "William Shakespeare", incorrect_answers: ["Molière", "Voltaire", "Victor Hugo"] },
    { question: "Quel est le métal le plus cher du monde ?", correct_answer: "Le rhodium", incorrect_answers: ["L'or", "Le platine", "L'argent"] },
    { question: "Combien de secondes y a-t-il dans une heure ?", correct_answer: "3600", incorrect_answers: ["60", "600", "86400"] },
    { question: "Quel est le plus grand reptile du monde ?", correct_answer: "Le crocodile marin", incorrect_answers: ["L'anaconda", "Le dragon de Komodo", "La tortue luth"] },
    { sport: "Dans quel sport utilise-t-on un volant ?", correct_answer: "Le badminton", incorrect_answers: ["Le tennis", "Le golf", "Le squash"] },
    { question: "Quel oiseau ne peut pas voler mais court très vite ?", correct_answer: "L'autruche", incorrect_answers: ["Le pingouin", "Le kiwi", "Le faucon"] },
    { question: "Quelle est la capitale de l'Espagne ?", correct_answer: "Madrid", incorrect_answers: ["Barcelone", "Séville", "Valence"] },
    { question: "Qui a écrit la fable 'Le Corbeau et le Renard' ?", correct_answer: "Jean de La Fontaine", incorrect_answers: ["Molière", "Arthur Rimbaud", "Charles Baudelaire"] },
    { question: "Quel est l'élément chimique le plus abondant dans l'univers ?", correct_answer: "L'hydrogène", incorrect_answers: ["L'oxygène", "L'hélium", "Le carbone"] },
    { question: "Quel monument célèbre se trouve à New York ?", correct_answer: "La Statue de la Liberté", incorrect_answers: ["La Tour Eiffel", "Big Ben", "Le Colisée"] },
    { question: "Quel pays a remporté la Coupe du Monde 2018 ?", correct_answer: "La France", incorrect_answers: ["La Croatie", "L'Allemagne", "Le Brésil"] },
    { question: "Combien de jours compte une année bissextile ?", correct_answer: "366", incorrect_answers: ["365", "364", "367"] },
    { question: "Quel pays est le plus peuplé du monde ?", correct_answer: "L'Inde", incorrect_answers: ["La Chine", "Les États-Unis", "Le Brésil"] },
    { question: "Quel pays a inventé les pâtes ?", correct_answer: "La Chine", incorrect_answers: ["L'Italie", "La Grèce", "La France"] },
    { question: "Qui a découvert l'Amérique en 1492 ?", correct_answer: "Christophe Colomb", incorrect_answers: ["Vasco de Gama", "Magellan", "Amerigo Vespucci"] },
    { question: "Quel est le symbole chimique de l'or ?", correct_answer: "Au", incorrect_answers: ["Ag", "Fe", "Cu"] },
    { question: "Quelle est la capitale de l'Australie ?", correct_answer: "Canberra", incorrect_answers: ["Sydney", "Melbourne", "Brisbane"] },
    { question: "Combien de planètes y a-t-il dans le système solaire ?", correct_answer: "8", incorrect_answers: ["7", "9", "10"] },
    { question: "Quel est le plus long fleuve d'Afrique ?", correct_answer: "Le Nil", incorrect_answers: ["Le Congo", "Le Niger", "Le Zambèze"] },
    { question: "Quel sport se joue avec un palet ?", correct_answer: "Le hockey sur glace", incorrect_answers: ["Le curling", "Le polo", "Le football américain"] },
    { question: "Quelle est la capitale de l'Italie ?", correct_answer: "Rome", incorrect_answers: ["Milan", "Naples", "Florence"] },
    { question: "Combien de grammes y a-t-il dans un kilogramme ?", correct_answer: "1000", incorrect_answers: ["100", "10000", "500"] },
    { question: "Quel est le plus haut sommet du monde ?", correct_answer: "L'Everest", incorrect_answers: ["Le K2", "Le Kangchenjunga", "Le Mont Blanc"] },
    { question: "Quel animal est le symbole de la paix ?", correct_answer: "La colombe", incorrect_answers: ["L'aigle", "Le lion", "La colombe blanche"] },
    { question: "Quelle est la vitesse de la lumière (en km/s) ?", correct_answer: "300 000 km/s", incorrect_answers: ["150 000 km/s", "500 000 km/s", "100 000 km/s"] },
    { question: "Quel pays a la plus grande forêt tropicale du monde ?", correct_answer: "Le Brésil", incorrect_answers: ["La République du Congo", "L'Indonésie", "La Colombie"] },
    { question: "Quel est le nom du premier homme à avoir marché sur la Lune ?", correct_answer: "Neil Armstrong", incorrect_answers: ["Buzz Aldrin", "Yuri Gagarine", "John Glenn"] },
    { question: "Combien de dents possède un adulte humain ?", correct_answer: "32", incorrect_answers: ["28", "30", "34"] },
    { question: "Quelle est la capitale du Brésil ?", correct_answer: "Brasília", incorrect_answers: ["Rio de Janeiro", "São Paulo", "Salvador"] },
    { question: "Quel gaz respirons-nous principalement dans l'air ?", correct_answer: "L'azote", incorrect_answers: ["L'oxygène", "Le dioxyde de carbone", "L'argon"] },
    { question: "Quelle est la capitale de la Chine ?", correct_answer: "Pékin", incorrect_answers: ["Shanghai", "Hong Kong", "Canton"] },
    { question: "Quel est le plus long os du corps humain ?", correct_answer: "Le fémur", incorrect_answers: ["Le tibia", "L'humérus", "Le radius"] },
    { question: "Quelle est la capitale de l'Allemagne ?", correct_answer: "Berlin", incorrect_answers: ["Munich", "Hambourg", "Francfort"] },
    { question: "Quel est l'instrument de musique le plus vendu au monde ?", correct_answer: "La guitare", incorrect_answers: ["Le piano", "La flûte", "Le violon"] },
    { question: "En quelle année a été construite la Tour Eiffel ?", correct_answer: "1889", incorrect_answers: ["1875", "1901", "1865"] },
    { question: "Quel pays a le plus de pyramides au monde ?", correct_answer: "Le Soudan", incorrect_answers: ["L'Égypte", "Le Mexique", "Le Peru"] },
    { question: "Quel est le plus grand lac d'Afrique ?", correct_answer: "Le lac Victoria", incorrect_answers: ["Le lac Tanganyika", "Le lac Malawi", "Le lac Tchad"] },
    { question: "Combien de couleurs y a-t-il dans un arc-en-ciel ?", correct_answer: "7", incorrect_answers: ["5", "6", "8"] },
    { question: "Quel est le continent le plus grand du monde ?", correct_answer: "L'Asie", incorrect_answers: ["L'Afrique", "L'Amérique", "L'Europe"] },
    { question: "Quelle est la capitale du Nigeria ?", correct_answer: "Abuja", incorrect_answers: ["Lagos", "Kano", "Ibadan"] },
    { question: "Quel est le sport national du Japon ?", correct_answer: "Le sumo", incorrect_answers: ["Le judo", "Le karaté", "Le baseball"] }
];

// =======================
// RÉCUPÉRER QUESTION
// =======================
async function fetchQuestion() {

    // ─── API 1 : QuizzAPI FR (Tentative agressive jusqu'à 3 fois si ça lag) ───
    for (let i = 0; i < 3; i++) {
        try {
            var res1 = await axios.get(
                'https://quizzapi.jomoreschi.fr/api/v1/quizzes?limit=1',
                { timeout: 4000 }
            );
            var q1 = res1.data.quizzes && res1.data.quizzes[0];
            if (q1 && q1.question && q1.answer && q1.badAnswers && q1.badAnswers.length >= 3) {
                console.log('[TRIVIA] Question via QuizzAPI FR ✅ (Tentative ' + (i + 1) + ')');
                return {
                    question: decodeHTML(q1.question),
                    correct_answer: decodeHTML(q1.answer),
                    incorrect_answers: q1.badAnswers.slice(0, 3).map(function(a) { return decodeHTML(a); })
                };
            }
        } catch (e) {
            console.warn('[TRIVIA] QuizzAPI tentative ' + (i + 1) + ' échouée');
        }
    }

    // ─── API 2 : OpenTriviaDB + Traduction automatique MyMemory (Sans clé) ───
    try {
        var resDb = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple', { timeout: 5000 });
        var qDb = resDb.data.results && resDb.data.results[0];
        
        if (qDb) {
            console.log('[TRIVIA] Question OpenTriviaDB reçue. Traduction en cours...');
            
            // Fonction interne de traduction ultra-rapide
            async function translateToFr(text) {
                try {
                    var tRes = await axios.get(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|fr`, { timeout: 3000 });
                    return tRes.data.responseData.translatedText || text;
                } catch(err) {
                    return text; // Fallback sur l'anglais si la traduction plante
                }
            }

            var questionFr = await translateToFr(decodeHTML(qDb.question));
            var correctFr = await translateToFr(decodeHTML(qDb.correct_answer));
            var incorrectsFr = await Promise.all(qDb.incorrect_answers.map(async function(ans) {
                return await translateToFr(decodeHTML(ans));
            }));

            console.log('[TRIVIA] Traduction réussie via MyMemory ✅');
            return {
                question: questionFr,
                correct_answer: correctFr,
                incorrect_answers: incorrectsFr.slice(0, 3)
            };
        }
    } catch (e) {
        console.warn('[TRIVIA] OpenTriviaDB ou Traduction échouée :', e.message);
    }

    // ─── Fallback : Si tout a foiré sur internet, on sort le tableau local ───
    console.warn('[TRIVIA] Récupération depuis le Fallback de secours local');
    return fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
}

// =======================
// START TRIVIA
// =======================
async function startTrivia(sock, chatId, message) {

    if (triviaGames[chatId]) {
        return sock.sendMessage(chatId, {
            text: '❌ Une partie de trivia est déjà en cours dans ce groupe.\n\n> BRINDI-XMD'
        }, { quoted: message });
    }

    try {
        var questionData = await fetchQuestion();

        if (!questionData) {
            return sock.sendMessage(chatId, {
                text: '❌ Impossible de charger une question pour le moment.\n\n> BRINDI-XMD'
            }, { quoted: message });
        }

        var question = questionData.question;
        var correctAnswer = questionData.correct_answer;

        var options = shuffle([
            questionData.incorrect_answers[0],
            questionData.incorrect_answers[1],
            questionData.incorrect_answers[2],
            correctAnswer
        ]);

        var letters = ['A', 'B', 'C', 'D'];
        var correctIndex = options.indexOf(correctAnswer);
        var correctLetter = letters[correctIndex];

        triviaGames[chatId] = {
            question: question,
            options: options,
            correctAnswer: correctAnswer,
            correctLetter: correctLetter,
            timeout: setTimeout(async function() {
                if (triviaGames[chatId]) {
                    await sock.sendMessage(chatId, {
                        text: '⏰ *Temps écoulé !*\n\n✅ La bonne réponse était :\n*' + correctLetter + ') ' + correctAnswer + '*\n\n> BRINDI-XMD'
                    });
                    delete triviaGames[chatId];
                }
            }, 60000)
        };

        var text = '🎮 *TRIVIA TIME*\n\n❓ *' + question + '*\n\n';
        options.forEach(function(option, index) {
            text += letters[index] + ') ' + option + '\n';
        });
        text += '\n📝 Répondez avec la lettre :\n*A, B, C ou D*\n\n⏳ Temps : 60 secondes\n\n> BRINDI-XMD';

        await sock.sendMessage(chatId, { text: text }, { quoted: message });

    } catch (error) {
        console.error('[TRIVIA ERROR]', error);
        await sock.sendMessage(chatId, {
            text: '❌ Une erreur critique est survenue lors du lancement.\n\n> BRINDI-XMD'
        }, { quoted: message });
    }
}

// =======================
// ANSWER TRIVIA
// =======================
async function answerTrivia(sock, chatId, answer, sender, message) {

    if (!triviaGames[chatId]) return;

    var game = triviaGames[chatId];
    answer = answer.trim().toUpperCase();

    if (!['A', 'B', 'C', 'D'].includes(answer)) {
        return sock.sendMessage(chatId, {
            text: '❌ Répondez seulement avec la lettre *A, B, C ou D*.\n\n> BRINDI-XMD'
        }, { quoted: message });
    }

    clearTimeout(game.timeout);

    var userName = sender.split('@')[0];

    if (answer === game.correctLetter) {
        await sock.sendMessage(chatId, {
            text: '✅ *Bonne réponse !*\n\n🎉 @' + userName + ' a gagné !\n\n✔️ Réponse : *' + game.correctLetter + ') ' + game.correctAnswer + '*\n\n> BRINDI-XMD',
            mentions: [sender]
        }, { quoted: message });
    } else {
        await sock.sendMessage(chatId, {
            text: '❌ *Mauvaise réponse !*\n\n✔️ La bonne réponse était :\n*' + game.correctLetter + ') ' + game.correctAnswer + '*\n\n> BRINDI-XMD'
        }, { quoted: message });
    }

    delete triviaGames[chatId];
}

// =======================
// EXPORTS
// =======================
module.exports = {
    startTrivia,
    answerTrivia
};

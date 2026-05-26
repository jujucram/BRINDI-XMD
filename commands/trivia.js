const axios = require('axios');

const triviaGames = {};

// =======================
// DÉCODER HTML
// =======================

function decodeHTML(text) {

    return text
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

    for (let i = array.length - 1; i > 0; i--) {

        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [array[i], array[j]] =
        [array[j], array[i]];
    }

    return array;
}

// =======================
// START TRIVIA
// =======================

async function startTrivia(
    sock,
    chatId
) {

    // Vérifie partie existante
    if (triviaGames[chatId]) {

        return sock.sendMessage(chatId, {
            text:
'❌ Une partie de trivia est déjà en cours.'
        });
    }

    try {

        const response =
            await axios.get(
                'https://opentdb.com/api.php?amount=1&type=multiple'
            );

        const questionData =
            response.data.results[0];

        // Question
        const question =
            decodeHTML(
                questionData.question
            );

        // Bonne réponse
        const correctAnswer =
            decodeHTML(
                questionData.correct_answer
            );

        // Options
        const options = shuffle([
            ...questionData.incorrect_answers.map(
                a => decodeHTML(a)
            ),
            correctAnswer
        ]);

        // Lettres
        const letters =
            ['A', 'B', 'C', 'D'];

        // Trouver bonne lettre
        const correctIndex =
            options.indexOf(correctAnswer);

        const correctLetter =
            letters[correctIndex];

        // Sauvegarde
        triviaGames[chatId] = {

            question,
            options,
            correctAnswer,
            correctLetter,

            timeout: setTimeout(async () => {

                if (triviaGames[chatId]) {

                    await sock.sendMessage(chatId, {
                        text:
`⏰ Temps écoulé !

✅ Bonne réponse :
${correctLetter}) ${correctAnswer}`
                    });

                    delete triviaGames[chatId];
                }

            }, 60000) // 60 sec
        };

        // Construction message
        let text =
`🎮 *TRIVIA TIME*

❓ ${question}

`;

        options.forEach((option, index) => {

            text +=
`${letters[index]}) ${option}\n`;
        });

        text +=
`\n📝 Réponds avec :
A / B / C / D

⏳ Temps : 60 secondes`;

        // Envoi
        await sock.sendMessage(chatId, {
            text
        });

    } catch (error) {

        console.error(error);

        await sock.sendMessage(chatId, {
            text:
'❌ Impossible de récupérer une question.'
        });
    }
}

// =======================
// ANSWER TRIVIA
// =======================

async function answerTrivia(
    sock,
    chatId,
    answer,
    sender
) {

    // Vérifie partie
    if (!triviaGames[chatId]) {

        return;
    }

    const game =
        triviaGames[chatId];

    // Nettoyage réponse
    answer =
        answer.trim().toUpperCase();

    // Mauvais format
    if (
        !['A', 'B', 'C', 'D']
            .includes(answer)
    ) {

        return sock.sendMessage(chatId, {
            text:
'❌ Réponds seulement avec A, B, C ou D.'
        });
    }

    // Stop timer
    clearTimeout(game.timeout);

    // Bonne réponse
    if (
        answer ===
        game.correctLetter
    ) {

        await sock.sendMessage(chatId, {
            text:
`✅ Bonne réponse !

🎉 ${sender.split('@')[0]} a gagné !

✔️ Réponse :
${game.correctLetter}) ${game.correctAnswer}`
        });

    } else {

        await sock.sendMessage(chatId, {
            text:
`❌ Mauvaise réponse !

✔️ Bonne réponse :
${game.correctLetter}) ${game.correctAnswer}`
        });
    }

    // Supprimer partie
    delete triviaGames[chatId];
}

// =======================
// EXPORTS
// =======================

module.exports = {
    startTrivia,
    answerTrivia
};
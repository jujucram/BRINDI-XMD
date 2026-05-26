const eightBallResponses = [
    "Oui, certainement !",
    "Pas du tout !",
    "Réessaie plus tard.",
    "C'est certain.",
    "Très douteux.",
    "Sans aucun doute.",
    "Ma réponse est non.",
    "Les signes indiquent que oui."
];

async function eightBallCommand(sock, chatId, question) {

    if (!question) {
        await sock.sendMessage(chatId, {
            text: '❓ Veuillez poser une question !\n> BRINDI-XMD'
        });
        return;
    }

    const randomResponse =
        eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];

    await sock.sendMessage(chatId, {
        text: `🎱 ${randomResponse}\n> BRINDI-XMD`
    });
}

module.exports = { eightBallCommand };
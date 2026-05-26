
const pickupLines = [
    "Tu es si belle que tu as fait oublier ma phrase d'accroche.",
    "Si les etoiles brillent, c'est pour eclairer ton chemin.",
    "Est-ce que ton nom est Google ? Parce que tu as tout ce que je cherche.",
    "Tu dois etre fatiguee... Tu cours dans mes pensees depuis ce matin.",
    "Si j'avais une fleur pour chaque fois que je pense a toi, j'aurais un jardin infini.",
    "Ton sourire est la plus belle chose que j'ai vue aujourd'hui.",
    "Je croyais que le bonheur n'existait pas... jusqu'a ce que je te voie.",
    "Tu es la preuve que Dieu aime nous gater.",
    "Si tu etais un livre, je te lirais toute ma vie.",
    "Tu fais battre mon coeur comme une notification WhatsApp a 3h du matin."
];

async function dragueCommand(sock, chatId, senderId, mentionedJids, message) {
    const target = mentionedJids?.[0];
    const line = pickupLines[Math.floor(Math.random() * pickupLines.length)];
    const name = target ? `@${target.split('@')[0]}` : 'toi';
    await sock.sendMessage(chatId, {
        text: `💘 *DRAGUE*\n\n${target ? `Pour ${name} :\n\n` : ''}${line}\n\n😘 De la part de @${senderId.split('@')[0]}\n\n> 🥷 Brandon`,
        mentions: target ? [target, senderId] : [senderId]
    }, { quoted: message });
}
module.exports = dragueCommand;

const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'data', 'messageCount.json');

// Charger les statistiques
function loadMessageCounts() {
    if (fs.existsSync(dataFilePath)) {
        try {
            return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
        } catch {
            return {};
        }
    }
    return {};
}

// Sauvegarder les statistiques
function saveMessageCounts(messageCounts) {
    fs.writeFileSync(dataFilePath, JSON.stringify(messageCounts, null, 2));
}

// Incrémenter le compteur de messages
function incrementMessageCount(groupId, userId) {
    const messageCounts = loadMessageCounts();

    if (!messageCounts[groupId]) {
        messageCounts[groupId] = {};
    }

    if (!messageCounts[groupId][userId]) {
        messageCounts[groupId][userId] = 0;
    }

    messageCounts[groupId][userId]++;

    saveMessageCounts(messageCounts);
}

// Commande .topmembers
async function topMembers(sock, chatId, isGroup) {
    if (!isGroup) {
        return sock.sendMessage(chatId, {
            text: '❌ Cette commande est réservée aux groupes.\n\n> BRINDI-XMD'
        });
    }

    const messageCounts = loadMessageCounts();
    const groupCounts = messageCounts[chatId] || {};

    const sortedMembers = Object.entries(groupCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    if (sortedMembers.length === 0) {
        return sock.sendMessage(chatId, {
            text: '📭 Aucun message enregistré pour le moment.\n\n> BRINDI-XMD'
        });
    }

    let message = `🏆 *TOP 5 MEMBRES LES PLUS ACTIFS*\n\n`;

    sortedMembers.forEach(([userId, count], index) => {
        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
        message += `${medals[index] || '•'} @${userId.split('@')[0]}\n`;
        message += `   💬 ${count} messages\n\n`;
    });

    message += `> BRINDI-XMD`;

    await sock.sendMessage(chatId, {
        text: message,
        mentions: sortedMembers.map(([userId]) => userId)
    });
}

module.exports = {
    incrementMessageCount,
    topMembers
};

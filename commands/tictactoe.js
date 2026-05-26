const TicTacToe = require('../lib/tictactoe');

// Stockage global des parties en cours
const games = {};

async function tictactoeCommand(sock, chatId, senderId, text) {
    try {
        // Vérifier si le joueur est déjà engagé dans une partie
        if (Object.values(games).find(room => 
            room.id.startsWith('tictactoe') && 
            [room.game.playerX, room.game.playerO].includes(senderId)
        )) {
            await sock.sendMessage(chatId, { 
                text: '❌ Tu es déjà dans une partie. Écris *surrender* pour abandonner avant d\'en lancer une autre.' 
            });
            return;
        }

        // Recherche d'une salle en attente
        let room = Object.values(games).find(room => 
            room.state === 'WAITING' && 
            (text ? room.name === text : true)
        );

        if (room) {
            // Un joueur rejoint la salle existante
            room.o = chatId;
            room.game.playerO = senderId;
            room.state = 'PLAYING';

            const arr = room.game.render().map(v => ({
                'X': '❎',
                'O': '⭕',
                '1': '1️⃣', '2': '2️⃣', '3': '3️⃣',
                '4': '4️⃣', '5': '5️⃣', '6': '6️⃣',
                '7': '7️⃣', '8': '8️⃣', '9': '9️⃣',
            }[v]));

            const str = `🎮 *La partie de TicTacToe commence !*

C'est au tour de @${room.game.currentTurn.split('@')[0]} de jouer...

${arr.slice(0, 3).join('')}
${arr.slice(3, 6).join('')}
${arr.slice(6).join('')}

▢ *ID Salon :* ${room.id}
▢ *Règles :*
• Aligne 3 symboles identiques pour gagner.
• Tape juste un chiffre entre *(1-9)* pour placer ton symbole.
• Écris *surrender* pour abandonner.`;

            await sock.sendMessage(chatId, { 
                text: str,
                mentions: [room.game.currentTurn, room.game.playerX, room.game.playerO]
            });

        } else {
            // Création d'une nouvelle salle d'attente
            room = {
                id: 'tictactoe-' + (+new Date()),
                x: chatId,
                o: '',
                game: new TicTacToe(senderId, 'o'),
                state: 'WAITING'
            };

            if (text) room.name = text;

            await sock.sendMessage(chatId, { 
                text: `⏳ *En attente d'un adversaire...*\nTape *.ttt ${text || ''}* pour rejoindre le salon !`
            });

            games[room.id] = room;
        }

    } catch (error) {
        console.error('Erreur commande tictactoe:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Erreur lors du lancement du jeu. Veuillez réessayer.' 
        });
    }
}

async function handleTicTacToeMove(sock, chatId, senderId, text) {
    try {
        // Trouver la partie active du joueur
        const room = Object.values(games).find(room => 
            room.id.startsWith('tictactoe') && 
            [room.game.playerX, room.game.playerO].includes(senderId) && 
            room.state === 'PLAYING'
        );

        if (!room) return; // Pas de partie active pour cet utilisateur

        const isSurrender = /^(surrender|give up)$/i.test(text.trim());
        
        if (!isSurrender && !/^[1-9]$/.test(text.trim())) return;

        // Gestion de l'abandon (possible à tout moment)
        if (isSurrender) {
            const winner = senderId === room.game.playerX ? room.game.playerO : room.game.playerX;
            
            await sock.sendMessage(chatId, { 
                text: `🏳️ @${senderId.split('@')[0]} a abandonné ! @${winner.split('@')[0]} remporte la victoire !`,
                mentions: [senderId, winner]
            });
            
            delete games[room.id];
            return;
        }

        // Vérifier si c'est bien le tour du joueur
        if (senderId !== room.game.currentTurn) {
            await sock.sendMessage(chatId, { 
                text: '❌ Ce n\'est pas ton tour de jouer !' 
            });
            return;
        }

        // Exécuter le coup sur la grille (on retire 1 car l'index va de 0 à 8)
        let moveSuccessful = room.game.turn(parseInt(text.trim()) - 1);

        if (!moveSuccessful) {
            await sock.sendMessage(chatId, { 
                text: '❌ Case invalide ou déjà occupée ! Choisissez un autre chiffre.' 
            });
            return;
        }

        let winner = room.game.winner;
        let isTie = room.game.turns === 9 && !winner;

        const arr = room.game.render().map(v => ({
            'X': '❎',
            'O': '⭕',
            '1': '1️⃣', '2': '2️⃣', '3': '3️⃣',
            '4': '4️⃣', '5': '5️⃣', '6': '6️⃣',
            '7': '7️⃣', '8': '8️⃣', '9': '9️⃣',
        }[v]));

        let gameStatus;
        if (winner) {
            gameStatus = `🎉 Félicitations @${winner.split('@')[0]} ! Tu gagnes la partie !`;
        } else if (isTie) {
            gameStatus = `🤝 Match nul ! Bien joué aux deux joueurs.`;
        } else {
            gameStatus = `🎲 Au tour de : @${room.game.currentTurn.split('@')[0]} (${room.game.currentTurn === room.game.playerX ? '❎' : '⭕'})`;
        }

        const str = `🎮 *TicTacToe*

${gameStatus}

${arr.slice(0, 3).join('')}
${arr.slice(3, 6).join('')}
${arr.slice(6).join('')}

▢ Joueur ❎ : @${room.game.playerX.split('@')[0]}
▢ Joueur ⭕ : @${room.game.playerO.split('@')[0]}

${!winner && !isTie ? '• Tape un chiffre *(1-9)* pour ton prochain coup\n• Écris *surrender* pour abandonner' : ''}`;

        const mentions = [
            room.game.playerX, 
            room.game.playerO,
            ...(winner ? [winner] : [room.game.currentTurn])
        ];

        // Envoyer la mise à jour sur le groupe
        await sock.sendMessage(room.x, { text: str, mentions: mentions });

        // Nettoyer la mémoire si la partie est terminée
        if (winner || isTie) {
            delete games[room.id];
        }

    } catch (error) {
        console.error('Erreur traitement coup tictactoe:', error);
    }
}

module.exports = {
    tictactoeCommand,
    handleTicTacToeMove
};

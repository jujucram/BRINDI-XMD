class TicTacToe {
    constructor(playerX = 'x', playerO = 'o') {
        this.playerX = playerX;
        this.playerO = playerO;
        this._currentTurn = false; // false = X (Premier joueur), true = O
        this._x = 0;
        this._o = 0;
        this.turns = 0;
    }

    get board() {
        return this._x | this._o;
    }

    get currentTurn() {
        return this._currentTurn ? this.playerO : this.playerX;
    }

    get winner() {
        // Combinaisons gagnantes en binaire
        const winningPatterns = [
            0b111000000, // Ligne du haut
            0b000111000, // Ligne du milieu
            0b000000111, // Ligne du bas
            0b100100100, // Colonne gauche
            0b010010010, // Colonne milieu
            0b001001001, // Colonne droite
            0b100010001, // Diagonale principale
            0b001010100  // Diagonale secondaire
        ];

        // Vérifier si X a gagné
        for (let pattern of winningPatterns) {
            if ((this._x & pattern) === pattern) {
                return this.playerX;
            }
        }

        // Vérifier si O a gagné
        for (let pattern of winningPatterns) {
            if ((this._o & pattern) === pattern) {
                return this.playerO;
            }
        }

        return null;
    }

    turn(pos) {
        // 1. Partie déjà finie
        if (this.winner) return false;

        // 2. Mauvaise position
        if (pos < 0 || pos > 8) return false;

        // 3. Position déjà occupée
        if ((this._x | this._o) & (1 << pos)) {
            return false;
        }

        const value = 1 << pos;

        // 4. Appliquer le symbole selon le tour actuel
        if (this._currentTurn) {
            this._o |= value;
        } else {
            this._x |= value;
        }

        this.turns++;

        // 5. Changer de tour
        this._currentTurn = !this._currentTurn;

        return true;
    }

    render() {
        return [...Array(9)].map((_, i) => {
            const bit = 1 << i;
            return this._x & bit ? 'X' : this._o & bit ? 'O' : i + 1;
        });
    }
}

module.exports = TicTacToe;

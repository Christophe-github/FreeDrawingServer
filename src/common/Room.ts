import { WebSocket, RawData } from 'ws';
import { Player } from "./Player";

export class Room {
    static readonly MAX_PLAYERS = 6;

    readonly id: string;
    readonly passwordRequired: boolean;
    readonly players: Player[] = [];

    private _isActive: boolean = true;

    get isActive() {
        return this._isActive;
    }

    // private _lastUpdateTime: number = Date.now();

    // get lastUpdateTime() {
    //     return this._lastUpdateTime;
    // }

    get playerCount() {
        return this.players.length;
    }

    get isEmpty() {
        return this.playerCount == 0;
    }

    constructor(id: string, passwordRequired: boolean = false) {
        this.id = id;
        this.passwordRequired = passwordRequired;
    }

    markAsInactive() {
        this._isActive = false;
    }

    /** Send a ping request to every player in the room. 
     * If at least one socket responds by calling [setIsActive], the room is marked as active
    */
    checkIsActive() {
        this.players.forEach(p => {
            p.socket.ping();
        })
    }

    /** Tells the room that a player is active.
     * This will mark the room as active as well.
     */
    setIsActive(player: Player) {
        this._isActive = true;
        const p = this.players.find((p) => p.userID === player.userID);
        if (p) {
            p.isActive = true;
        }
    }


    kickInactivePlayers() {
        this.players.filter(p => !p.isActive)?.forEach(p => {
            p.socket.terminate();
            this.removePlayer(p);
        });
    }


    closeConnection() {
        this.players.forEach(p => {
            p.socket.terminate();
            this.removePlayer(p);
        });
    }

    /**
     * @throws Error if the room is full or if the player is already in the room
     */
    addPlayer(player: Player) {
        if (this.playerCount >= Room.MAX_PLAYERS)
            throw new Error(`Room is full`);

        if (this.players.find((p) => p.userID === player.userID))
            throw new Error(`Player ${player.userID} is already in the room`);

        player.isActive = true;
        this._isActive = true; //The room is marked as active as well
        this.players.push(player);
    }

    /**
     * @throws Error if the {player} is not in the room
     */
    removePlayer(player: Player) {
        const index = this.players.indexOf(player);

        if (index == -1) {
            console.log(`Room.removePlayer(player) : player ${player} was not in the room`);
            return;
        }

        this.players.splice(index, 1);
    }

    broadcast(data: RawData, isBinary: boolean, exclude?: WebSocket) {
        if (this.playerCount <= 1)
            return;

        // this._lastUpdateTime = Date.now();

        this.players.forEach((player) => {
            if (player.socket !== exclude && player.socket.readyState === WebSocket.OPEN)
                player.socket.send(data, { binary: isBinary });
        });
    }

}


export function RoomSerializer(key: string, value: any) {
    // We don't want to include the 'socket' property of player in serialization
    if (key === 'socket' || key === '_isActive') {
        return undefined;
    }
    return value;
}
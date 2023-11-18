import { WebSocket } from 'ws';

export class Player {
    readonly userID: string;
    readonly socket: WebSocket;
    isActive : boolean = true



    constructor(userID: string, socket: WebSocket) {
        this.userID = userID;
        this.socket = socket;
    }
}
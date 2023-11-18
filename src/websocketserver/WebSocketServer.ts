import { WebSocketServer, WebSocket, RawData } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import { Room } from "../common/Room";
import { Player } from "../common/Player";
import { ServerState } from '../common/ServerState';
import { FreeDrawingSocketStatus } from '../common/FreeDrawingSocketStatus';



//Status code for web sockets as defined here https://www.rfc-editor.org/rfc/rfc6455.html#section-7.4.1
const WS_NORMAL_CLOSURE = 1000;
const WS_PROTOCOL_ERROR = 1002;

////////////////////////////////////////////////////////
//////////    Websocket server config         //////////
////////////////////////////////////////////////////////



export function createWebSocketServer(serverState: ServerState): WebSocketServer {

    const wss = new WebSocketServer({ path: "/room/join", noServer: true });

    wss.on('error', function (error) {
        console.log(error);
    });


    wss.on('connection', function connection(ws: WebSocket, req: IncomingMessage) {
        //The player is put into the room upon connection
        let room: Room
        let player: Player


        try {
            [room, player] = handleConnection(ws, req.url ?? "");
            console.log(`Connection accepted with user ${player.userID}`)
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : "An error occured when joining the room";
            console.log(msg);
            ws.close(WS_NORMAL_CLOSURE, msg);
            return;
        }

        //Connection was successfull, we can now add appropriate callbacks :
        //We want to broadcast the message of the user to everyone else in the room
        ws.on('message', function message(data: RawData, isBinary: boolean) {
            //We don't read the content of the message at all, we only broadcast it
            room.broadcast(data, isBinary, ws);
            // console.log((data as Buffer).toString());
        });

        ws.on('pong', function (data) {
            room.setIsActive(player);
        });

        ws.on('close', function close() {
            try {
                room.removePlayer(player);
                //destroy room if last player leaves
                if (room.isEmpty) {
                    serverState.removeRoom(room);
                }
            }
            catch (e) {
                console.log(e);
            }

            console.log(`Disconnected from user ${player.userID}`)
        });


    });



    /**
     * 
     * Establish the connection between the player and the server. The url must contain query parameter for authentication.
     * Upon successful connection, put the player in the room he requested and returns the room with the player
     * @returns The player and the room he has been put in
     * @throws Error when connection was unsuccessfull
     */
    function handleConnection(ws: WebSocket, url: string): [Room, Player] {
        const { roomID, userID } = parse(url, true).query;

        console.log(`Connection request from user ${userID}`)

        if (roomID === undefined || userID === undefined)
            throw new Error("roomID and userID must be specified as url query parameters in order to join a room");

        if (Array.isArray(roomID) || Array.isArray(userID))
            throw new Error("roomID and userID cannot be Arrays");


        const room = serverState.rooms.find((room) => room.id === roomID);


        if (room === undefined)
            throw new Error(`room with roomID ${roomID} not found `);

        if (room.players.find((p) => p.userID === userID))
            throw new Error(`player ${userID} is already in the room `);

        const player = new Player(userID, ws);
        room.addPlayer(player);

        sendConnectionStatus(ws, { accepted: true });


        return [room, player];
    }



    return wss;
}



function sendConnectionStatus(ws: WebSocket, status: FreeDrawingSocketStatus) {
    ws.send(JSON.stringify(status));
}
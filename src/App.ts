import * as dotenv from "dotenv";
import { Room } from "./common/Room";
import { ServerState } from "./common/ServerState";
import { createWebServer } from "./webserver/WebServer";
import { createWebSocketServer } from "./websocketserver/WebSocketServer";


dotenv.config({ path: __dirname + "/../.env" });


const port = (process.env.PORT || 8080) as number;

////////////////////////////////////////////////////////
//////////    Gobal state is a list of rooms  //////////
////////////////////////////////////////////////////////

const state: ServerState = new ServerState();


if (process.env.ENVIRONMENT == "DEV")
    state.rooms.push(new Room("test")); //For testing



////////////////////////////////////////////////////////
//////////    Starting the express server     //////////
////////////////////////////////////////////////////////

const app = createWebServer(state);
const wss = createWebSocketServer(state);



const server = app.listen(port, () => { console.log(`Server listening on localhost:${port}...`) });


// When a websocket request is received by express, we pass it to the web socket server
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (socket) => {
        wss.emit('connection', socket, request);
    });
});




function checkInactiveRooms() {
    console.log(`checkInactiveRooms()`);
    
    state.rooms.forEach((room) => {

        if (!room.isActive) {
            console.log(`Room ${room.id} is inactive , destroying`);
            room.closeConnection();
            state.removeRoom(room);
            return;
        }

        room.kickInactivePlayers();
        room.markAsInactive();
        room.checkIsActive();
    });

}

setInterval(() => {
    checkInactiveRooms();
}, 60_000);


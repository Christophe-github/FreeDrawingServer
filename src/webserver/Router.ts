import { Router } from 'express';
import { Room, RoomSerializer } from "../common/Room";
import { ServerState } from "../common/ServerState";


////////////////////////////////////////////////////////
//////////    Routes for express              //////////
////////////////////////////////////////////////////////

export function createRoomRouter(serverState: ServerState): Router {
    const roomRouter = Router();

    roomRouter.get('/', (_, res) => {
        res.send('FreeDrawing server to handle data transmission between clients with websockets')
    })

    roomRouter.get('/room/create/:id', (req, res) => {
        if (serverState.rooms.find(( r) => r.id === req.params.id)) {
            res.status(409).json({"message" : `Room with id ${req.params.id} already exists, use another id`});
            return;
        }
        
        const newRoom = new Room(req.params.id);
        serverState.rooms.push(newRoom);
        res.type('json').send(JSON.stringify(newRoom, RoomSerializer));
    })

    roomRouter.get('/room/all', (_, res) => {
        res.type('json').send(JSON.stringify(serverState.rooms, RoomSerializer));
    })



    return roomRouter;
}

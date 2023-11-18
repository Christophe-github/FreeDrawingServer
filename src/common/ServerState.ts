import { Room } from "./Room";

export class ServerState {
    readonly rooms: Room[] = [];

    removeRoom(room: Room) {
        const index = this.rooms.indexOf(room);
        if (index == -1) {
            console.log(`room ${room.id} not found, therefore cannot be removed`)
        }
        this.rooms.splice(index, 1);
    }
}
import express from 'express';
import { Express } from 'express';
import { ServerState } from "../common/ServerState";
import { createRoomRouter } from "../webserver/Router";


export function createWebServer(serverState: ServerState) : Express {
    return express().use(createRoomRouter(serverState)); 
}
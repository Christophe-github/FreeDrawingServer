# Free drawing server

### A web server for the [Free drawing android app](https://github.com/Christophe-github/FreeDrawing) allowing to draw in multiplayer  🖌🧑🖌🧑🖌🧑


## Features

* Create / join a multiplayer room with up to 6 people
* Transmit your drawing updates to all the other people in the room ➡
* Receive drawing updates from all the other people in the room ⬅
* Inactive players or empty rooms are automatically kicked / closed after 60 seconds
* See all rooms with an http GET query


## Architecture

This app was made with:

* Node.js
* Typescript
* Express 
* Websockets to deliver drawing updates to players (thanks to the [ws](https://www.npmjs.com/package/ws) package) 
* nodemon to watch for changes in the dist folder and reload the app



## Project setup
```
npm install
```

### Launch server in dev mode (watch for ts updates)

You will need two terminals (in VSCode you can also build a task regrouping these two tasks)
```
npx tsc -watch 
npx nodemon dist/App.js
```

### Launch server without dev mode
```
node dist/App.js
```


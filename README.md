# real-time-draw

*real-time-draw* is a Go/React application that enables its users to play a simple game of drawing and guessing. The app was designed and implemented with the stateful goroutines design pattern in mind and real-time client communication based on WebSocket.

## [Demo](http://golang-ui.s3-website-us-east-1.amazonaws.com/) on AWS 

## Installation
# Server
```bash
cd ./server
go get github.com/gorilla/websocket
go get github.com/google/uuid
go run ./*.go
```
Go server should be up at `http://localhost:3000`
# Client
*Node* and *NPM* are prerequisites for the client
Run theses commands into a shell:
```bash
npm install
npm start
```
and navigate to `http://localhost:3000`

## Documentation
State of the application is managed by a single routine and all the modifications of the state go through a `stateModifier` channel. The type of the messages in this channel is:
```go
type Message struct {
	origin  Origin
	cause   string
	payload string
}
```
* *Origin* is an interface that can be implemented either by *Client* or *Game* entity.
* *cause* is one of init, exit, broadcast, createNew, joinGame, startGame, nextRound, updateDrawing, guess. 
* *payload* is usually a JSON object that contains data specific to the message's purpose.

### Concurrency overview
![alt text](https://drive.google.com/uc?export=view&id=10kiw9U7B_wAhtg8TnWwKbeMqm3BVz8QE)

## Acknowledgment
*real-time-draw* uses a dataset for labels of drawings from [Quickdraw project](https://github.com/googlecreativelab/quickdraw-dataset)

## License
[MIT](https://github.com/SimeonAlexandrov/real-time-draw/blob/master/LICENSE)
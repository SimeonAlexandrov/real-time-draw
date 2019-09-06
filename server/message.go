package main

// Message causes:
// - init
// - exit
// - broadcast
// - createNew
// - joinGame
// - startGame
// - nextRound
// - updateDrawing
// - guess

// Origin - inteface of message sending entity
type Origin interface {
	getID() string
}

// Message - instances of this type are transferred between clients
type Message struct {
	origin  Origin
	cause   string
	payload string
}

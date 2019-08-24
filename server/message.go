package main

// Message causes:
// - init
// - draw
// - exit
// - broadcast
// - createNew
// - joinGame
// - nextRound

// Message - instances of this type are transferred between clients
type Message struct {
	origin  *Client
	cause   string
	payload string
}

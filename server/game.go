// Game phases

package main

// Game - represents state of a single drawing game
type Game struct {
	id      string
	status  string
	players []*Client
}

// TODO add receiver methods to update game
// in state and broadcast to players

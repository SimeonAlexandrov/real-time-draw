// Game phases
// - pending
// - inProgress

package main

import (
	"fmt"
	"time"
)

// Game - represents state of a single drawing game
type Game struct {
	ID            string
	Status        string
	Players       []*Client
	Creator       string
	stateModifier chan Message
	incoming      chan Message
}

// Implements Origin
func (g Game) getID() string {
	return g.ID
}

// TODO add receiver methods to update game
// in state and broadcast to players
func (g *Game) wait() {
	const waitSeconds = 30
	const requiredPlayers = 2
	for {
		// TODO research how select with timeout works
		fmt.Printf("Game will %v wait for %vs\n", g.ID, waitSeconds)
		time.Sleep(waitSeconds * time.Second)
		if len(g.Players) >= requiredPlayers {
			fmt.Printf("Number of players is greater than %v \n", requiredPlayers)
			stateModifier <- Message{
				origin:  g,
				cause:   "startGame",
				payload: "adf",
			}
			return
		}
	}
}

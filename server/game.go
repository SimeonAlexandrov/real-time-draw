// Game phases
// - pending
// - inProgress

package main

import (
	"fmt"
	"time"
)

// Guess - represents single guess
type Guess struct {
	origin    *Client
	guess     string
	isCorrect bool
}

// Round - represents state of a single round
type Round struct {
	ID             int
	targetLabel    string
	guesses        []Guess
	labelOptions   []string
	currentDrawing string
	drawer         *Client
}

// Game - represents state of a single drawing game
type Game struct {
	ID            string
	Status        string
	Players       []*Client
	Creator       string
	currentRound  Round
	stateModifier chan Message
	incoming      chan Message
}

// Implements Origin
func (g Game) getID() string {
	return g.ID
}

// NOTE modifing game in this function
// is not advised due to concurrency issues
func (g *Game) wait() {
	const waitSeconds = 30
	const requiredPlayers = 2

	// TODO Add a limit to waiting
	for {
		fmt.Printf("Game will %v wait for %vs\n", g.ID, waitSeconds)
		time.Sleep(waitSeconds * time.Second)
		if len(g.Players) >= requiredPlayers {
			fmt.Printf("Number of players is greater than %v \n", requiredPlayers)
			stateModifier <- Message{
				origin:  g,
				cause:   "startGame",
				payload: "",
			}
			return
		}
	}
}

func (g *Game) play() {
	for i, pl := range g.Players {
		// TODO do not use hardcoded values
		const targetLabel = "dog"
		labelOptions := []string{"cat", "dog", "mouse", "horse"}
		r := Round{
			ID:           i,
			drawer:       pl,
			labelOptions: labelOptions,
			targetLabel:  targetLabel,
		}
		fmt.Printf("Round: %+v\n", r)
		// TODO add message for new round
		// stateModifier <- Message{
		// 	origin:  g,
		// 	cause:   "newRound",
		// 	payload: "TODO",
		// }
		time.Sleep(60 * time.Second)
	}

	// TODO send endGame message
}

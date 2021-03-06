// Game phases
// - pending
// - inProgress

package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"time"
)

// Guess - represents single guess
type Guess struct {
	Origin    *Client
	Guess     string
	IsCorrect bool
}

// Round - represents state of a single round
type Round struct {
	ID             int
	TargetLabel    string
	LatestGuess    Guess
	LabelOptions   []string
	CurrentDrawing string
	Drawer         string
}

// Game - represents state of a single drawing game
type Game struct {
	ID            string
	Status        string
	Players       []*Client
	Creator       string
	CurrentRound  Round
	stateModifier chan Message
	incoming      chan Message
}

// Implements Origin
func (g Game) getID() string {
	return g.ID
}

// Wait - the main function of
// a shortlived goroutine that is responsible
// for waiting while enough players join a game
// NOTE modifing game in this function
// is not advised due to concurrency issues
func (g *Game) Wait() {
	const waitSeconds = 10
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

// Play - the main function of a short-lived
// goroutine that is responsible for changing rounds
// and ending a game
func (g *Game) Play(labels []string) {
	for i, pl := range g.Players {
		g.playRound(i, pl.UUID, labels)
	}
	g.end()
}

func (g Game) playRound(n int, uuid string, labels []string) {
	var targetLabel = GetRandomLabel(labels)
	labelOptions := []string{
		targetLabel,
		GetRandomLabel(labels),
		GetRandomLabel(labels),
		GetRandomLabel(labels),
	}

	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(labelOptions), func(i, j int) { labelOptions[i], labelOptions[j] = labelOptions[j], labelOptions[i] })

	r := Round{
		ID:           n + 1,
		Drawer:       uuid,
		LabelOptions: labelOptions,
		TargetLabel:  targetLabel,
	}

	msgPayload, err := json.Marshal(r)
	if err != nil {
		panic(err)
	}

	fmt.Printf("Round: %+v\n", r)
	// TODO add message for new round
	stateModifier <- Message{
		origin:  g,
		cause:   "newRound",
		payload: string(msgPayload),
	}
	time.Sleep(40 * time.Second)
}

func (g Game) end() {
	fmt.Println("Game ended!")
	// Think about how to determine a winner
	stateModifier <- Message{
		origin:  g,
		cause:   "endGame",
		payload: "",
	}
}

package main

import (
	"encoding/json"
	"fmt"
)

// State is managed only by a state manager
// We export State properties in order to JSON serialize them
type State struct {
	Clients map[string]*Client
	Games   map[string]*Game
	labels  []string
}

func manageState(writes chan Message) {
	s := State{
		Clients: make(map[string]*Client),
		Games:   make(map[string]*Game),
		labels:  GetLabels(),
	}
	fmt.Println("State manager routine has started.")
	for {
		select {
		case write := <-writes:
			err := s.handleStateWriteOp(write, writes)
			if err != nil {
				fmt.Println("Failed to handle state write operation")
			}
		}

	}
}

func (s State) broadcast(o Origin, audience []*Client) error {
	if audience != nil {
		fmt.Println("Broadcasting new state to specified audience")
		for _, c := range audience {
			err := s.sendMessage(c, o)
			if err != nil {
				return fmt.Errorf("Failed to broadcast to audience")
			}
		}
	} else {
		fmt.Println("Broadcasting new state to all clients")
		for _, c := range s.Clients {
			err := s.sendMessage(c, o)
			if err != nil {
				return fmt.Errorf("Failed to broadcast to all clients")
			}
		}
	}
	return fmt.Errorf("Failed to broadcast message")
}

func (s State) sendMessage(c *Client, o Origin) error {
	p, err := s.prepPayload()
	if err != nil {
		return fmt.Errorf("Failed to send message")
	}
	c.outgoing <- Message{
		origin:  o,
		cause:   "broadcast",
		payload: p,
	}
	return nil
}

func (s State) prepPayload() (string, error) {
	prepClients := make([]string, 0)
	for _, v := range s.Clients {
		cl, err := json.Marshal(*v)
		if err != nil {
			return "", fmt.Errorf("Error while preparing broadcast payload")
		}
		prepClients = append(prepClients, string(cl))
	}

	prepGames := make([]string, 0)
	for _, v := range s.Games {
		g, err := json.Marshal(*v)
		if err != nil {
			return "", fmt.Errorf("Error while preparing broadcast payload")
		}
		prepGames = append(prepGames, string(g))
	}

	payload := make(map[string][]string)
	payload["clients"] = prepClients
	payload["games"] = prepGames

	p, _ := json.Marshal(payload)

	return string(p), nil
}

func (s State) handleStateWriteOp(write Message, sModifier chan Message) error {
	fmt.Printf("Write operation of state: %+v\n", write)
	var audience []*Client
	var latestGuestCheck = false
	switch write.cause {
	case "init":
		// Type assertion
		if cl, ok := write.origin.(*Client); ok {
			s.Clients[write.origin.getID()] = cl
		} else {
			return fmt.Errorf("Init message is not sent by user")
		}
	case "createNewGame":
		err := s.handleCreateNewGame(write, sModifier)
		if err != nil {
			return fmt.Errorf("Failed to create new game")
		}
	case "joinGame":
		err := s.handleJoinGame(write)
		if err != nil {
			return fmt.Errorf("Failed to join game")
		}
	case "startGame":
		err := s.handleStartGame(write)
		if err != nil {
			return fmt.Errorf("Failed to start game")
		}
	case "newRound":
		err := s.handleNewRound(write)
		if err != nil {
			return fmt.Errorf("Failed to create new round")
		}
	case "updateDrawing":
		// Change audience only to involved players
		if cl, ok := write.origin.(*Client); ok {
			audience = s.Games[cl.JoinedGame].Players
		}
		err := s.handleUpdateDrawing(write)
		if err != nil {
			return fmt.Errorf("Failed to update drawing")
		}
	case "guess":
		// Change audience only to involved players
		if cl, ok := write.origin.(*Client); ok {
			audience = s.Games[cl.JoinedGame].Players
		}
		err := s.handleGuess(write)
		if err != nil {
			return fmt.Errorf("Failed to guess")
		}

		latestGuestCheck = true

	case "endGame":
		err := s.handleEndGame(write)
		if err != nil {
			return fmt.Errorf("Failed to end game")
		}
	case "exit":
		delete(s.Clients, write.origin.getID())
	default:
		fmt.Println("State error: unrecognized write cause: ", write.cause)
		return fmt.Errorf("Unable to recognize message cause")
	}
	// Every state change is broadcasted
	err := s.broadcast(write.origin, audience)
	if err != nil {
		return fmt.Errorf("Failed to broadcast")
	}

	// However after broadcast latest guess
	if latestGuestCheck {
		s.latestGuessCheck(write)
	}
	return nil
}

func (s State) handleCreateNewGame(write Message, sModifier chan Message) error {
	fmt.Println("Create new game event received")
	if cl, ok := write.origin.(*Client); ok {
		players := make([]*Client, 1)
		players[0] = cl

		gameID := write.payload
		game := Game{
			ID:            gameID,
			Status:        "pending",
			Creator:       write.origin.getID(),
			Players:       players,
			stateModifier: sModifier,
		}

		s.Games[gameID] = &game
		s.Clients[write.origin.getID()].Status = "waiting"
		s.Clients[write.origin.getID()].JoinedGame = gameID

		go game.Wait()
	} else {
		return fmt.Errorf("createNewGame message is not sent by user")
	}

	return nil
}

func (s State) handleJoinGame(write Message) error {
	if cl, ok := write.origin.(*Client); ok {
		originID := cl.getID()
		gameID := write.payload
		fmt.Printf("User %v requests to join %v \n", originID, gameID)
		s.Clients[originID].Status = "waiting"
		s.Clients[originID].JoinedGame = gameID

		updatedPlayers := append(s.Games[gameID].Players, cl)
		s.Games[gameID].Players = updatedPlayers
	} else {
		return fmt.Errorf("createNewGame message is not sent by user")
	}

	return nil
}

func (s State) handleStartGame(write Message) error {
	game := s.Games[write.origin.getID()]
	game.Status = "inProgress"
	go game.Play(s.labels)
	return nil
}

func (s State) handleNewRound(write Message) error {
	// TODO update game property with round
	r := Round{}
	err := json.Unmarshal([]byte(write.payload), &r)
	if err != nil {
		return fmt.Errorf("Failed to unmarshal new round data")
	}

	game := s.Games[write.origin.getID()]
	game.CurrentRound = r

	for _, pl := range game.Players {
		if pl.UUID == r.Drawer {
			pl.Status = "drawing"
		} else {
			pl.Status = "guessing"
		}
	}

	return nil
}

func (s State) handleUpdateDrawing(write Message) error {
	if cl, ok := write.origin.(*Client); ok {
		gameID := cl.JoinedGame
		game := s.Games[gameID]
		game.CurrentRound.CurrentDrawing = write.payload
		return nil
	}
	return fmt.Errorf("Origin is not client")
}

func (s State) handleEndGame(write Message) error {
	gameID := write.origin.getID()
	game := s.Games[gameID]
	for _, pl := range game.Players {
		pl.Status = "available"
		pl.JoinedGame = ""
	}
	delete(s.Games, gameID)
	return nil
}

func (s State) handleGuess(write Message) error {
	if cl, ok := write.origin.(*Client); ok {
		gameID := cl.JoinedGame
		game := s.Games[gameID]
		lg := Guess{
			Origin:    cl,
			Guess:     write.payload,
			IsCorrect: write.payload == game.CurrentRound.TargetLabel,
		}
		game.CurrentRound.LatestGuess = lg
		return nil
	}
	return fmt.Errorf("Origin is not client")
}

func (s State) latestGuessCheck(write Message) error {
	if cl, ok := write.origin.(*Client); ok {
		gameID := cl.JoinedGame
		game := s.Games[gameID]
		game.CurrentRound.LatestGuess = Guess{}
		return nil
	}
	return fmt.Errorf("Origin is not client")
}

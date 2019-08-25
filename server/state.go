package main

import (
	"encoding/json"
	"fmt"
)

// State is managed only by a state manager
// We export State properties in order to JSON serialize them
type State struct {
	Drawing string
	Clients map[string]*Client
	Games   map[string]*Game
}

func manageState(writes chan Message) {
	s := State{
		Clients: make(map[string]*Client),
		Games:   make(map[string]*Game),
	}
	fmt.Println("State manager routine has started.")
	for {
		select {
		case write := <-writes:
			s.handleStateWriteOp(write, writes)
		}

	}
}

// TODO broadcast to a target group
func (s State) broadcast(origin Origin) {
	fmt.Println("Broadcasting new state to clients")
	for _, client := range s.Clients {

		p, err := s.prepPayload()
		if err != nil {
			return
		}
		client.outgoing <- Message{
			origin:  origin,
			cause:   "broadcast",
			payload: p,
		}
	}
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

func (s State) handleStateWriteOp(write Message, sModifier chan Message) {
	fmt.Printf("Write operation of state: %+v\n", write)

	switch write.cause {
	case "init":
		// Type assertion
		if cl, ok := write.origin.(*Client); ok {
			s.Clients[write.origin.getID()] = cl
		} else {
			fmt.Printf("Init message is not sent by user!\n")
		}
	case "draw":
		// TODO This property should be part of Game at some point
	case "createNewGame":
		s.handleCreateNewGame(write, sModifier)
	case "startGame":
		s.handleStartGame(write)
	case "joinGame":
		s.handleJoinGame(write)
	case "exit":
		delete(s.Clients, write.origin.getID())
	default:
		fmt.Println("State error: unrecognized write cause: ", write.cause)
		return
	}

	fmt.Printf("Updated state: %+v\n", s)

	// Every state change is broadcasted

	s.broadcast(write.origin)

}

func (s State) handleCreateNewGame(write Message, sModifier chan Message) {
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
		go game.wait()
	} else {
		fmt.Printf("createNewGame message is not sent by user!\n")
	}
}

func (s State) handleJoinGame(write Message) {
	if cl, ok := write.origin.(*Client); ok {
		originID := cl.getID()
		gameID := write.payload
		fmt.Printf("User %v requests to join %v \n", originID, gameID)
		s.Clients[originID].Status = "waiting"
		s.Clients[originID].JoinedGame = gameID

		updatedPlayers := append(s.Games[gameID].Players, cl)
		s.Games[gameID].Players = updatedPlayers
	} else {
		fmt.Printf("createNewGame message is not sent by user!\n")
	}
}

func (s State) handleStartGame(write Message) {
	s.Games[write.origin.getID()].Status = "inProgress"
}

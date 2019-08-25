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
		Drawing: "",
		Clients: make(map[string]*Client),
		Games:   make(map[string]*Game),
	}
	fmt.Println("State manager routine has started.")
	fmt.Println(s)
	for {
		select {
		// case read := <-reads:
		// 	fmt.Println("Read operation of state with cause: ", read.cause)
		case write := <-writes:
			fmt.Println("Write operation of state")
			fmt.Println("Received message in state routine: ")
			fmt.Println(write)

			if write.cause == "init" {
				// Add Client to clients
				fmt.Println("Received init request")
				s.Clients[write.origin.UUID] = write.origin
			} else if write.cause == "draw" {
				fmt.Println("Received draw request")
				s.Drawing = write.payload
			} else if write.cause == "createNew" {
				fmt.Println("Create new game event received")
			} else if write.cause == "exit" {
				// Remove client from clients list
				fmt.Println("Removing user from state: ", write.origin.UUID)
				delete(s.Clients, write.origin.UUID)
			} else {
				fmt.Println("State error: unrecognized write cause: ", write.cause)
				return
			}

			fmt.Println("Updated state: ")
			fmt.Println(s)

			s.broadcast(write.origin)
		}

		// TODO broadcast all kinds of events
		// such as client joined/exited
	}
}

// TODO broadcast to a target group
func (s State) broadcast(origin *Client) {
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

	payload := make(map[string][]string)
	payload["clients"] = prepClients

	p, _ := json.Marshal(payload)

	return string(p), nil
}

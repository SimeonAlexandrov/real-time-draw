package main

import "fmt"

// State is managed only by a state manager
type State struct {
	drawing string
	clients map[string]*Client
	games   map[string]*Game
}

func manageState(writes chan Message) {
	s := State{
		drawing: "",
		clients: make(map[string]*Client),
		games:   make(map[string]*Game),
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
				s.clients[write.origin.uuid] = write.origin
			} else if write.cause == "draw" {
				fmt.Println("Received draw request")
				s.drawing = write.payload
			} else if write.cause == "createNew" {
				fmt.Println("Create new game event received")
			} else if write.cause == "exit" {
				// Remove client from clients list
				fmt.Println("Removing user from state: ", write.origin.uuid)
				delete(s.clients, write.origin.uuid)
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
	for _, client := range s.clients {
		if client.uuid != origin.uuid {
			client.outgoing <- Message{
				origin:  origin,
				cause:   "broadcast",
				payload: s.drawing,
			}
		}
	}
}

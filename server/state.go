package main

import "fmt"

// State is managed only by a state manager
type State struct {
	drawing string
	clients map[string]*Client
}

type readOp struct {
	key   int
	cause string
	resp  chan Message
}
type writeOp struct {
	key  int
	val  int
	resp chan bool
}

func manageState(writes chan Message) {
	s := State{
		drawing: "",
		clients: make(map[string]*Client),
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

			// For each write from user X,
			// a broadcast to all other users must be performed
			if write.cause == "init" {
				// Add Client to clients
				fmt.Println("Received init request")
				s.clients[write.origin.uuid] = write.origin
				fmt.Println("Updated state:")
				fmt.Println(s)
			} else if write.cause == "drawing" {
				// Update drawing in state
				// and broadcast its value to other clients
			} else if write.cause == "exit" {
				// Remove client from clients
				fmt.Println("Removing user from state: ", write.origin.uuid)
				delete(s.clients, write.origin.uuid)
				fmt.Println(s)
			} else {
				fmt.Println("State error: unrecognized write cause: ", write.cause)
				return
			}
			// response := Message{
			// 	origin:  cl.uuid,
			// 	cause:   "response",
			// 	payload: []byte("OK madafacka"),
			// }
			// outgoingCh <- response
		}

	}
}

func (s State) broadcast() {
	// TODO
}

package main

import (
	"fmt"

	"github.com/gorilla/websocket"
)

// Client - instances of this type handle WebSocket connections
// and read/mutate the application state
type Client struct {
	uuid     string
	role     string
	incoming chan Message
	outgoing chan Message
	conn     *websocket.Conn
}

func (c Client) handleIncoming() {
	defer func() {
		// TODO unregister from state
		fmt.Println("User leaving:", c.uuid)
		// Exit msg
		exitMsg := Message{
			origin:  &c,
			cause:   "exit",
			payload: []byte{},
		}

		c.incoming <- exitMsg
		c.conn.Close()
	}()
	fmt.Println("Reader routine started")
	for {
		_, wsm, err := c.conn.ReadMessage()

		if err != nil {
			fmt.Println("Ending websocket communication with: ", c.uuid)
			return
		}
		fmt.Println("Received message in reader goroutine", wsm)

		// Init message
		msg := Message{
			origin:  &c,
			cause:   "init",
			payload: []byte{},
		}

		// Draw message
		// msg := Message{
		// 	origin:  &c,
		// 	cause:   "draw",
		// 	payload: wsm,
		// }

		// Put message in stateModifier channel
		c.incoming <- msg
	}
}

func (c Client) handleOutgoing() {
	defer func() {
		c.conn.Close()
	}()
	fmt.Println("Writer routine started")
	for m := range c.outgoing {
		fmt.Println("Sending message to client with id:", c.uuid)
		fmt.Println("Message: ")
		fmt.Println(m)
		err := c.conn.WriteMessage(websocket.TextMessage, m.payload)
		if err != nil {
			fmt.Printf("Ending communication with %v because of:", c.uuid)
			fmt.Println(err)
		}
	}
}

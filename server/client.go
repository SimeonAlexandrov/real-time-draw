package main

import (
	"encoding/json"
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
			payload: "",
		}

		c.incoming <- exitMsg
		c.conn.Close()
	}()

	fmt.Println("Reader routine started")
	for {
		_, wsm, err := c.conn.ReadMessage()
		fmt.Println("Received message in reader goroutine: ")
		if err != nil {
			fmt.Println("Ending websocket communication with: ", c.uuid)
			return
		}

		var messageData map[string]string
		jsonErr := json.Unmarshal(wsm, &messageData)
		if jsonErr != nil {
			fmt.Println("Error occured during JSON unmarshal", err)
			return
		}

		msg := Message{
			origin:  &c,
			cause:   messageData["cause"],
			payload: messageData["payload"],
		}
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
		err := c.conn.WriteMessage(websocket.TextMessage, []byte(m.payload))
		if err != nil {
			fmt.Printf("Ending communication with %v because of:", c.uuid)
			fmt.Println(err)
		}
	}
}
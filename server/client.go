package main

import (
	"fmt"

	"github.com/gorilla/websocket"
)

type client struct {
	uuid   string
	role   string
	reader chan []byte
	writer chan []byte
	conn   *websocket.Conn
}

type state struct {
	drawing []byte
	clients map[string]client
}

type message struct {
	origin  string
	cause   string
	payload []byte
}

func (c client) read() {
	defer func() {
		// TODO unregister from hub
		c.conn.Close()
	}()
	for {
		_, msg, _ := c.conn.ReadMessage()
		fmt.Println(msg)
		// Put message in reader channel
	}
}

func (c client) write() {
	defer func() {
		// TODO unregister from hub
		c.conn.Close()
	}()

}

// func manageState(reads chan message, writes chan message) {
// 	var s = state{
// 		drawing: [],
// 		clients: make(map[string]client)
// 	}

// 	select {
// 	case read := <-reads:

// 	}
// }

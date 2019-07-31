package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

var clients = make(map[string]*websocket.Conn)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024 * 1024,
	WriteBufferSize: 1024 * 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func main() {
	http.HandleFunc("/", serveHome)
	http.HandleFunc("/ws", serveWebsocket)
	err := http.ListenAndServe(":8000", nil)

	if err != nil {
		fmt.Println("Fatal error with http server: ", err)
	}
}

func serveHome(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.URL)
	w.Write([]byte("OK"))
}

func serveWebsocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	defer conn.Close()

	if err != nil {
		fmt.Println("Failed to upgrade to websocket protocol", err)
		return
	}
	fmt.Println("Client connected: ", conn.RemoteAddr())

	// NOTE
	// Pass connection to a goroutine
	// Add user to list of clients

	// Read message from browser
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Failed to read message", err)
			return
		}
		if string(msg) == "sender" || string(msg) == "receiver" {
			clients[string(msg)] = conn
			fmt.Println("Clients map: ", clients)
		}

		fmt.Printf("%s sent: %s\n\n", conn.RemoteAddr(), string(msg))

		if clients["sender"] != nil && clients["receiver"] != nil {
			receiver := clients["receiver"]
			if string(msg) != "receiver" {
				err := receiver.WriteMessage(websocket.TextMessage, msg)
				if err != nil {
					fmt.Println("Failed to send message to receiver")
					return
				}
				fmt.Println("Successfully sent message to receiver.")
			}
		}
		// TODO decide how to write message
		// if err = conn.WriteMessage(msgType, msg); err != nil {
		// 	return
		// }
	}
}

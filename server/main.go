package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

var stateModifier = make(chan Message)

// var stateReader = make(chan Message)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024 * 1024,
	WriteBufferSize: 1024 * 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func main() {

	// Run state manager goroutine
	go manageState(stateModifier)

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
	// defer conn.Close()
	if err != nil {
		fmt.Println("Failed to upgrade to websocket protocol", err)
		return
	}
	fmt.Println("Client connected: ", conn.RemoteAddr())
	outgoingCh := make(chan Message)
	cl := Client{
		uuid:     conn.RemoteAddr().String(),
		role:     "sender", // TODO determine
		incoming: stateModifier,
		outgoing: outgoingCh,
		conn:     conn,
	}
	go cl.handleIncoming()
	go cl.handleOutgoing()

}

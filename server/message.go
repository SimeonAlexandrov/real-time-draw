package main

// Message - instances of this type are transferred between clients
type Message struct {
	origin  *Client
	cause   string
	payload []byte
}

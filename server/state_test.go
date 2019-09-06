package main

import (
	"testing"
)

func TestPrepPayloadWithEmptyState(t *testing.T) {
	s := State{}
	p, err := s.prepPayload()
	if err != nil {
		t.Errorf("prepPayload is not expected to throw error when state is empty	")
	}

	if p != "{\"clients\":[],\"games\":[]}" {
		t.Errorf("prepPayload result is expected to be \"\" but got %v", p)
	}

}

// func TestSendMessage(t *testing.T) {
// 	s := State{}
// 	outgoing := make(chan Message)
// 	c := Client{
// 		outgoing: outgoing,
// 	}
// 	o := Client{}
// 	go s.sendMessage(&c, o)

// 	select {
// 	case out := <-outgoing:
// 		t.Logf("OK, received %v", out)
// 	default:
// 		t.Errorf("Message was expected to be sent to channel")
// 	}
// }

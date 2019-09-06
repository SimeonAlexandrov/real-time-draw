package main

import (
	"fmt"
	"io/ioutil"
	"math/rand"
	"net/http"
	"strings"
	"time"
)

// GetLabels - acquire labels for the games
func GetLabels() []string {
	var res []string
	labelsURL := "https://raw.githubusercontent.com/googlecreativelab/quickdraw-dataset/master/categories.txt"
	resp, err := http.Get(labelsURL)
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Unable to fetch labels")
	}
	res = strings.Split(string(body), "\n")
	return res
}

// GetRandomLabel - returns a random label from the list
func GetRandomLabel(labels []string) string {
	rand.Seed(time.Now().UnixNano())
	random := labels[rand.Intn(len(labels))]
	return random
}

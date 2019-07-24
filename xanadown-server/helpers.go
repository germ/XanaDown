package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// Helper for pacaking up a JSON error response
func reportError(w http.ResponseWriter, code int, err error) {
	res, _ := json.Marshal(&RequestStatus{
		Code:  code,
		Error: err.Error(),
	})
	fmt.Printf("Error: %v %v\n", code, err)
	fmt.Fprintln(w, string(res))
}

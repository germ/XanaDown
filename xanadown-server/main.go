package main

// TODO: Use go-git or something 'proper'
// Right now this reads a bit like CGI.
// Hiding it behind a interface might be a good idea
// But the document server is fairly simple, so we'll get it working
// And wait for PRs/Fixing

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
)

type RequestStatus struct {
	Code  int
	Error string
}

func init() {
	// Register API Endpoint
	http.HandleFunc("/doc", serveDocument)
	http.HandleFunc("/add", addRepo)
	http.Handle("/",
		http.FileServer(http.Dir("./static/")))

	// Handle Ctrl-C cleanup
	c := make(chan os.Signal)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		gitUnmount()
		os.Exit(1)
	}()

	// TODO: Log last doc access time and
	// unmount after dur so we don't have
	// a billion connections
}
func main() {
	defer gitUnmount()
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// Api Endpoints
func serveDocument(w http.ResponseWriter, r *http.Request) {
	// Cors jazz
	w.Header().Set("Content-Type", "text/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	loc := r.FormValue("loc")
	if loc == "" {
		reportError(w, http.StatusBadRequest, errors.New("Blank Document Request"))
		return
	}

	// Populate resp obj
	req, err := GetDocument(loc)
	if err != nil {
		reportError(w, http.StatusBadRequest, err)
		return
	}

	rawResp, err := json.Marshal(&req)
	fmt.Fprintln(w, string(rawResp))
}
func addRepo(w http.ResponseWriter, r *http.Request) {
	// Try to process
	err := gitMount(r.FormValue("remote"))
	if err != nil {
		res, _ := json.Marshal(&RequestStatus{
			Error: err.Error(),
			Code:  http.StatusBadRequest,
		})
		fmt.Fprintf(w, string(res))
		return
	}

	res, _ := json.Marshal(&RequestStatus{Code: 200})
	fmt.Fprintln(w, string(res))
}

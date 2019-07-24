package main

// TODO: Full Go impl, this is cancer

import (
	"errors"
	"fmt"
	"io/ioutil"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// Document JSON structure
type DocReq struct {
	Doc       string
	IsLatest  bool
	LatestUrl string
	Url       string
}

// Parse a path to retr a doc
func GetDocument(path string) (Req DocReq, err error) {
	Req.Url = path

	// Verify that repo is mounted
	err = gitMount(path)
	if err != nil {
		return Req, fmt.Errorf("Error getting document: %v", err)
	}

	// Create a FS path from loc
	// Verify that it exists
	wd, _ := os.Getwd()
	reqLoc := wd + "/docs/" + path
	reqInfo, err := os.Stat(reqLoc)
	if err != nil {
		return Req, fmt.Errorf("Error getting document: %v", err)
	}

	// Check for latest rev
	if strings.Contains(reqLoc, ".git/current/") {
		Req.IsLatest = true
		Req.LatestUrl = path
	} else {
		// Find mod time from current commit, compare to request
		// Find the current Filename
		fmt.Println(reqLoc)
		sepPath := strings.Split(reqLoc, "/")
		for i, v := range sepPath {
			if v == "history" {
				if i+3 > len(sepPath) {
					return Req, errors.New("Malformed URL, Please try again.")
				}
				sepPath[i] = "current"
				sepPath = append(sepPath[:i+1], sepPath[i+3:]...)
				fmt.Println(sepPath)
				break
			}
			if i == len(sepPath) {
				return Req, errors.New("Malformed URL, Please try again.")
			}
		}
		curLoc := filepath.Join(sepPath...)

		fmt.Println("CurLoc", curLoc)
		fmt.Println("ReqLoc", reqLoc)
		//Compare modtimes
		curInfo, err := os.Stat(curLoc)
		if err != nil {
			panic(err)
		}
		if curInfo.ModTime().Equal(reqInfo.ModTime()) {
			Req.IsLatest = true
			Req.LatestUrl = path
		} else {
			Req.IsLatest = false
			Req.LatestUrl = strings.Split(curLoc, wd)[0]
		}
	}

	return
}

// Unmount all fuse drives
// They will be remounted as needed
func gitUnmount() (err error) {
	return exec.Command("mount -l | grep fuse.gitfs | cut -d ' ' -f 3").Run()
}

// Mount a given http git repo for access
func gitMount(u string) (err error) {
	// Simple case
	if u == "" {
		return errors.New("No repo specified")
	}

	// Try to parse
	loc, err := url.Parse(u)
	if err != nil {
		return
	}
	fmt.Println(loc)

	// Convert to FS path
	parts := strings.SplitAfter(loc.String(), ".git")
	if len(parts) != 2 {
		return errors.New("Error parsing location")
	}

	// Strip off the schema
	// Yes I know we already did some parsing and bullshit
	wd, _ := os.Getwd()
	gitRoot, _ := url.Parse(parts[0])
	gitPath := wd + "/doc/" + gitRoot.Host + gitRoot.Path
	fmt.Printf("Converted %v to %v\n", u, gitRoot)

	// It's sanitized but you never know
	if strings.Contains(gitPath, "../") || strings.Contains(gitRoot.String(), "../") {
		return errors.New("Can you fucking not?")
	}

	// Check if already mounted
	dirlist, err := ioutil.ReadDir(gitPath)
	if len(dirlist) != 0 {
		return
	}

	// Make directory and mount
	os.MkdirAll(gitPath, 0755)
	c := exec.Command("gitfs", gitRoot.String(), gitPath)
	fmt.Printf("Mounting %v to %v\n", gitRoot.String(), gitPath)

	out, err := c.Output()
	if err != nil {
		fmt.Printf("Error Mounting %v to %v: %v\n", gitRoot, gitPath, out)
	}

	return err
}

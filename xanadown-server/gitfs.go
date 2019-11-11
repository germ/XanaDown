package main

// TODO: Full Go impl, this is cancer
import (
	"errors"
	"fmt"
	"io/ioutil"
	"net/url"
	"os"
	"os/exec"
	"sort"
	"strings"

	"github.com/udhos/equalfile"
)

// Document JSON structure
type DocReq struct {
	Doc       string
	IsLatest  bool
	LatestUrl string
	Url       string
}

// Git infomation
type gitInfo struct {
	remote   string
	fullPath string
	basePath string
	filePath string
	fileName string
}

// Parse a path to retr a doc
func GetDocument(path string) (Req DocReq, err error) {
	Req.Url = path

	// Verify that repo is mounted
	info, err := gitMount(path)
	fmt.Println("Got info: ", info)
	if err != nil {
		return Req, fmt.Errorf("Error getting document: %v", err)
	}

	// Create a FS path from loc
	// Verify that it exists
	_, err = os.Stat(info.fullPath)
	if err != nil {
		return Req, fmt.Errorf("Error getting document: %v", err)
	}

	// Read doc in
	rawDoc, err := ioutil.ReadFile(info.fullPath)
	if err != nil {
		return Req, fmt.Errorf("Could not read file: %v", err)
	}
	Req.Doc = string(rawDoc)

	// Check for latest rev
	// Find path for current version
	curLoc := info.basePath + "/history/"
	curDate, err := getNewest(curLoc)
	curTime, err := getNewest(curLoc + curDate)
	curLoc = curLoc + curDate + "/" + curTime + info.filePath

	//Deep compare
	cmp := equalfile.New(nil, equalfile.Options{})
	Req.IsLatest, _ = cmp.CompareFile(info.fullPath, curLoc)

	// Point to newer resource
	Req.LatestUrl = info.remote + "/history/" + curDate + "/" + curTime + "/" + info.fileName
	return
}

// Unmount all fuse drives
// They will be remounted as needed
func gitUnmount() (err error) {
	out, err := exec.Command("bash", "-c", "mount -l | grep fuse.gitfs | cut -d ' ' -f 3 | xargs -n 1 fusermount -u").Output()
	if len(out) != 0 {
		fmt.Println(out)
	}

	return err
}

// Mount a given http git repo for access
// Returns the path to on-disk resource and any errors
// encountered
//func gitMount(u string) (localPath string, gitPath string, err error) {
func gitMount(u string) (info gitInfo, err error) {
	// TODO: Handle being passed non-historical urls
	// Simple case
	if u == "" {
		return info, errors.New("No repo specified")
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
		return info, errors.New("Error parsing location")
	}

	// Strip off the schema
	// Yes I know we already did some parsing and bullshit
	wd, _ := os.Getwd()
	gitBase, _ := url.Parse(parts[0])
	gitPath := wd + "/doc/" + gitBase.Host + gitBase.Path
	fmt.Printf("Converted %v to %v\n", u, gitBase)

	// It's sanitized but you never know
	if strings.Contains(gitPath, "../") || strings.Contains(gitBase.String(), "../") {
		return info, errors.New("Can you fucking not?")
	}

	// Update return struct
	info.remote = gitBase.String()
	info.basePath = gitPath
	info.filePath = parts[1]
	info.fullPath = info.basePath + info.filePath

	if strings.Contains(info.filePath, "/history/") {
		info.fileName = strings.Join(strings.Split(info.filePath, "/")[4:], "/")
	}

	// Check if already mounted
	dirlist, err := ioutil.ReadDir(gitPath)
	if len(dirlist) != 0 {
		return
	}

	// Make directory and mount
	os.MkdirAll(gitPath, 0755)
	c := exec.Command("gitfs", gitBase.String(), "-o idle_fetch_timeout=5,min_idle_times=200", gitPath)
	fmt.Printf("Mounting %v to %v\n", gitBase.String(), gitPath)

	out, err := c.Output()
	if err != nil {
		fmt.Printf("Error Mounting %v to %v: %v\n", gitBase, gitPath, out)
	}

	return
}

// Take a directory and return the newest by mod time
func getNewest(path string) (newest string, err error) {
	files, err := ioutil.ReadDir(path)
	fmt.Println("Finding Newest: ", path)
	if len(files) == 0 {
		err = fmt.Errorf("No Files")
	}
	if err != nil {
		return
	}

	// Sort by mod time
	sort.Slice(files, func(i, j int) bool {
		return files[i].ModTime().Before(files[j].ModTime())
	})

	// string base path
	return files[0].Name(), err
}

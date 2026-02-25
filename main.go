package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/", handler)
	http.HandleFunc("/health", healthHandler)

	log.Printf("StrangerLoops starting on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("ok"))
}

func handler(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/")
	path = strings.TrimSuffix(path, "/")

	// Root path - serve index.md
	if path == "" {
		serveMarkdown(w, "content/index.md")
		return
	}

	// Try exact path first
	fullPath := filepath.Join("content", path)
	
	// If it's a directory, look for index.md
	if info, err := os.Stat(fullPath); err == nil && info.IsDir() {
		indexPath := filepath.Join(fullPath, "index.md")
		if _, err := os.Stat(indexPath); err == nil {
			serveMarkdown(w, indexPath)
			return
		}
		// Directory without index.md - list contents
		serveDirListing(w, fullPath, path)
		return
	}

	// Try as-is (for .md files requested with extension)
	if _, err := os.Stat(fullPath); err == nil {
		serveFile(w, fullPath)
		return
	}

	// Try adding .md extension
	mdPath := fullPath + ".md"
	if _, err := os.Stat(mdPath); err == nil {
		serveMarkdown(w, mdPath)
		return
	}

	// 404
	http.NotFound(w, r)
}

func serveMarkdown(w http.ResponseWriter, path string) {
	data, err := os.ReadFile(path)
	if err != nil {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "text/markdown; charset=utf-8")
	w.Write(data)
}

func serveFile(w http.ResponseWriter, path string) {
	data, err := os.ReadFile(path)
	if err != nil {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}

	// Detect content type
	ext := strings.ToLower(filepath.Ext(path))
	switch ext {
	case ".md":
		w.Header().Set("Content-Type", "text/markdown; charset=utf-8")
	case ".json":
		w.Header().Set("Content-Type", "application/json")
	case ".txt":
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	case ".opus", ".mp3", ".wav":
		w.Header().Set("Content-Type", "audio/"+strings.TrimPrefix(ext, "."))
	default:
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	}
	w.Write(data)
}

func serveDirListing(w http.ResponseWriter, dirPath, urlPath string) {
	entries, err := os.ReadDir(dirPath)
	if err != nil {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "text/markdown; charset=utf-8")
	
	title := urlPath
	if title == "" {
		title = "StrangerLoops"
	}
	fmt.Fprintf(w, "# %s\n\n", title)

	// Separate dirs and files
	var dirs, files []string
	for _, entry := range entries {
		name := entry.Name()
		if strings.HasPrefix(name, ".") {
			continue
		}
		if entry.IsDir() {
			dirs = append(dirs, name)
		} else {
			files = append(files, name)
		}
	}

	// List directories
	for _, dir := range dirs {
		link := dir
		if urlPath != "" {
			link = urlPath + "/" + dir
		}
		fmt.Fprintf(w, "- [%s/](/%s/)\n", dir, link)
	}

	// List files
	for _, file := range files {
		link := strings.TrimSuffix(file, ".md")
		if urlPath != "" {
			link = urlPath + "/" + link
		}
		displayName := strings.TrimSuffix(file, ".md")
		fmt.Fprintf(w, "- [%s](/%s)\n", displayName, link)
	}
}

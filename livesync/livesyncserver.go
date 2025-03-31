package webhooks

import (
	"log"
	"net/http"
)

func webhookHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		log.Printf("Invalid method received: %s", r.Method)
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	log.Println("--- Notification Received ---")
	log.Printf("Host: %s", r.Host)
	log.Printf("User-Agent: %s", r.UserAgent())
	// Google sends metadata in X-Goog-* headers
	log.Printf("X-Goog-Channel-ID: %s", r.Header.Get("X-Goog-Channel-ID"))         // ID you created for the channel
	log.Printf("X-Goog-Resource-ID: %s", r.Header.Get("X-Goog-Resource-ID"))       // ID of the resource being watched (e.g., event ID)
	log.Printf("X-Goog-Resource-State: %s", r.Header.Get("X-Goog-Resource-State")) // e.g., "exists", "sync", "not_exists"
	log.Printf("X-Goog-Message-Number: %s", r.Header.Get("X-Goog-Message-Number")) // Sequence number for messages on this channel
	log.Printf("X-Goog-Resource-URI: %s", r.Header.Get("X-Goog-Resource-URI"))     // API URI of the changed resource
	log.Println("---------------------------")

	// 3. Acknowledge receipt *quickly*!
	// Google expects a 2xx response promptly. Don't do heavy processing here.
	// You would typically trigger a background job/queue message here
	// to fetch the actual changes using the Google Calendar API based
	// on the info received in the headers.
	w.WriteHeader(http.StatusOK) // Send 200 OK
}

func listenwebhooks() {
	port := "8080" // Default port
	log.Printf("Starting webhook listener on port %s", port)
	log.Println("Remember to run ngrok: ngrok http " + port)

	http.HandleFunc("/webhook", webhookHandler) // Register handler for the /webhook path

	// Start the HTTP server
	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

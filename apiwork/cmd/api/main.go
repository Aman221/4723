package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"

	"github.com/Aman221/4723/internal/database"
	"github.com/Aman221/4723/internal/handlers"
)

func main() {
	r := mux.NewRouter()
	err := database.InitDB()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.DB.Close() // Close the database connection when the program exits.

	// Define user-related endpoints
	r.HandleFunc("/user/{id}", handlers.GetUserHandler)
	// mux.HandleFunc("/user/{id}/calendar", handlers.GetUserCalendarHandler)
	// mux.HandleFunc("/user/{id}/events", handlers.GetUserEventsHandler)
	// mux.HandleFunc("/user/{id}/paymentinformation", handlers.GetUserPaymentHandler)
	// mux.HandleFunc("/user/{id}/endpointapi", handlers.EndpointAPIHandler)

	log.Println("Server starting on 127.0.0.1:8080...")
	http.ListenAndServe("127.0.0.1:8080", r)
}

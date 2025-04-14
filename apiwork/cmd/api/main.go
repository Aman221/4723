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
	err := database.InitUserDB()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.DB.Close() // Close the database connection when the program exits.

	// Apply CORS middleware
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	})

	// Define user-related endpoints
	r.HandleFunc("/user/{id}", handlers.GetUserHandler)
	r.HandleFunc("/login/{username}+{password}", handlers.LoginHandler)
	r.HandleFunc("/create/{username}+{password}+{email}", handlers.CreateUserHandler)
	// mux.HandleFunc("/user/{id}/calendar", handlers.GetUserCalendarHandler)
	// mux.HandleFunc("/user/{id}/events", handlers.GetUserEventsHandler)
	// mux.HandleFunc("/user/{id}/paymentinformation", handlers.GetUserPaymentHandler)
	// mux.HandleFunc("/user/{id}/endpointapi", handlers.EndpointAPIHandler)

	log.Println("Server starting on 127.0.0.1:8080...")
	http.ListenAndServe("127.0.0.1:8080", r)
}

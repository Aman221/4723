package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors" // Import the CORS middleware

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

	// r.HandleFunc("/user/{id}", handlers.GetUserHandler).Methods("GET")
	r.HandleFunc("/user/{id}/calendar", handlers.GetUserCalendarHandler).Methods("GET")
	r.HandleFunc("/user/{id}/events", handlers.GetUserEventsHandler).Methods("GET")
	r.HandleFunc("/user/{id}/paymentinformation", handlers.GetUserPaymentHandler).Methods("GET")
	r.HandleFunc("/user/{id}/endpointapi", handlers.EndpointAPIHandler).Methods("GET")

	// Calendar endpoints
	r.HandleFunc("/calendars", handlers.GetCalendarsHandler).Methods("GET")
	r.HandleFunc("/calendars", handlers.AddCalendarHandler).Methods("POST")
	r.HandleFunc("/calendars/{id}", handlers.UpdateCalendarHandler).Methods("PUT")
	r.HandleFunc("/calendars/{id}", handlers.DeleteCalendarHandler).Methods("DELETE")
	r.HandleFunc("/calendars/{id}/visibility", handlers.UpdateCalendarVisibilityHandler).Methods("PUT")

	// Event endpoints
	r.HandleFunc("/events", handlers.GetEventsHandler).Methods("GET")
	r.HandleFunc("/events/search", handlers.SearchEventsHandler).Methods("GET")
	r.HandleFunc("/events", handlers.AddEventHandler).Methods("POST")
	r.HandleFunc("/events/{eventId}", handlers.UpdateEventHandler).Methods("PUT")
	r.HandleFunc("/events/{eventId}", handlers.DeleteEventHandler).Methods("DELETE")

	// Calendar Navigation endpoints
	r.HandleFunc("/calendar/current-date", handlers.GetCurrentDateHandler).Methods("GET")
	r.HandleFunc("/calendar/navigate/{direction}", handlers.NavigateCalendarHandler).Methods("POST")

	// Enable CORS for all origins, methods, and headers
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"}, // You might want to restrict this in production
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders: []string{"Link"},
		// AllowCredentials: true, // If you need to handle cookies
		MaxAge: 86400, // Maximum age for preflight cache
	})

	handler := c.Handler(r)

	log.Println("Server starting on 127.0.0.1:8080...")
	http.ListenAndServe("127.0.0.1:8080", handler)
}

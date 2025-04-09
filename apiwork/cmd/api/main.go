package main

import (
    "log"
    "net/http"
    "github.com/Aman221/4723/internal/handlers"
)

func main() {
    mux := http.NewServeMux()

<<<<<<< Updated upstream
    // Define user-related endpoints
    mux.HandleFunc("/user/", handlers.GetUserHandler)
    mux.HandleFunc("/user/{id}/calendar", handlers.GetUserCalendarHandler)
    mux.HandleFunc("/user/{id}/events", handlers.GetUserEventsHandler)
    mux.HandleFunc("/user/{id}/paymentinformation", handlers.GetUserPaymentHandler)
    mux.HandleFunc("/user/{id}/endpointapi", handlers.EndpointAPIHandler)
=======
	// Define user-related endpoints
	r.HandleFunc("/user/{username}", handlers.GetUserHandler)
	r.HandleFunc("/user/new/{username}+{email}", handlers.PostUserHandler)
	// mux.HandleFunc("/user/{id}/calendar", handlers.GetUserCalendarHandler)
	// mux.HandleFunc("/user/{id}/events", handlers.GetUserEventsHandler)
	// mux.HandleFunc("/user/{id}/paymentinformation", handlers.GetUserPaymentHandler)
	// mux.HandleFunc("/user/{id}/endpointapi", handlers.EndpointAPIHandler)
>>>>>>> Stashed changes

    log.Println("Server starting on :8080...")
    http.ListenAndServe(":8080", mux)
}

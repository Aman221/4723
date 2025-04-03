package api

// boilerplate code for api.go
import (
	"log"
	"net/http"

	"github.com/Aman221/4723/internal/handlers"
)

// SetupRouter initializes the API routes
func SetupRouter() *http.ServeMux {
	mux := http.NewServeMux()

	// User-related endpoints
	mux.HandleFunc("/user", handlers.GetUserHandler)
	// mux.HandleFunc("/user/{id}/calendar", handlers.GetUserCalendarHandler)
	// mux.HandleFunc("/user/{id}/events", handlers.GetUserEventsHandler)
	// mux.HandleFunc("/user/{id}/paymentinformation", handlers.GetUserPaymentHandler)
	// mux.HandleFunc("/user/{id}/endpointapi", handlers.EndpointAPIHandler)

	return mux
}

// StartServer runs the API server on the specified port
func StartServer() {
	mux := SetupRouter()
	log.Println("🚀 Server starting on port 8080...")
	err := http.ListenAndServe(":8080", mux)
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

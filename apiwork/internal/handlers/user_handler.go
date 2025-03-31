package handlers

import (
    "encoding/json"
    "net/http"
    "github.com/Aman221/4723/internal/models"
)

// GetUserHandler handles requests to fetch a user
func GetUserHandler(w http.ResponseWriter, r *http.Request) {
    user := models.User{ID: 1, Name: "Arjun", Email: "arjun@example.com"}

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}

package handlers

import (
<<<<<<< Updated upstream:apiwork/internal/handlers/user_handler.go
    "encoding/json"
    "net/http"
    "github.com/Aman221/4723/internal/models"
=======
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/Aman221/4723/internal/database" // Import your database package
	"github.com/Aman221/4723/internal/models"
	"github.com/gorilla/mux" // Import gorilla mux for route variables
>>>>>>> Stashed changes:apiwork/internal/handlers/user_fetch.go
)

// GetUserHandler handles requests to fetch a user
func GetUserHandler(w http.ResponseWriter, r *http.Request) {
<<<<<<< Updated upstream:apiwork/internal/handlers/user_handler.go
    user := models.User{ID: 1, Name: "Arjun", Email: "arjun@example.com"}

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
=======
	vars := mux.Vars(r)
	username, ok := vars["username"]
	if !ok {
		http.Error(w, "Username", http.StatusBadRequest)
		return
	}

	row := database.DB.QueryRow("SELECT id, username, email FROM users WHERE username = $1", username)
	var user models.User
	err := row.Scan(&user.ID, &user.Name, &user.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
>>>>>>> Stashed changes:apiwork/internal/handlers/user_fetch.go
}

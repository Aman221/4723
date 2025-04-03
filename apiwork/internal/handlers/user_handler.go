package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/Aman221/4723/internal/database" // Import your database package
	"github.com/Aman221/4723/internal/models"
	"github.com/gorilla/mux" // Import gorilla mux for route variables
)

// GetUserHandler handles requests to fetch a user
func GetUserHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr, ok := vars["id"]
	if !ok {
		http.Error(w, "User ID not provided", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	row := database.DB.QueryRow("SELECT id, username, email FROM users WHERE id = $1", id)
	var user models.User
	err = row.Scan(&user.ID, &user.Name, &user.Email)
	fmt.Print(err)
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
}

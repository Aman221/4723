package handlers

import (
	"net/http"

	"github.com/Aman221/4723/internal/database" // Import your database package
	"github.com/gorilla/mux"                    // Import gorilla mux for route variables
)

func PostUserHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username, ok1 := vars["username"]
	email, ok2 := vars["email"]

	if !ok1 {
		http.Error(w, "Username not provided", http.StatusBadRequest)
		return
	}
	if !ok2 {
		http.Error(w, "Email not provided", http.StatusBadRequest)
		return
	}

	_, perror := database.DB.Exec("INSERT INTO users (username, email, registration_date, is_active) VALUES ($1, $2, CURRENT_DATE, TRUE)", username, email)
	if perror != nil {
		print((perror))
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
}

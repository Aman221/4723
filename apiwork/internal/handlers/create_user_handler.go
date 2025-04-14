package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Aman221/4723/internal/database" // Import your database package
	"github.com/google/uuid"
	"github.com/gorilla/mux"     // Import gorilla mux for route variables
	"golang.org/x/crypto/bcrypt" // Import bcrypt for password hashing
)

// CreateUserHandler handles requests to create a new user.
func CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Use gorilla/mux to get URL parameters
	vars := mux.Vars(r)
	username, ok1 := vars["username"]
	password, ok2 := vars["password"]
	email, ok3 := vars["email"]

	// 2. Validate the user data
	if !ok1 {
		http.Error(w, "Username not provided", http.StatusBadRequest)
		return
	}
	if !ok2 {
		http.Error(w, "Password not provided", http.StatusBadRequest)
		return
	}
	if !ok3 {
		http.Error(w, "Email not provided", http.StatusBadRequest)
		return
	}

	// 3.  Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to hash password: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 4.  Generate a UUID for the user.
	userID := uuid.New().String()
	createdAt := time.Now().Format(time.RFC3339)

	// 5. Store the new user in the database
	_, err = database.DB.Exec(
		"INSERT INTO user_logins (username, password, email) VALUES ($1, $2, $3)",
		username, string(hashedPassword), email,
	)
	if err != nil {
		http.Error(w, "Failed to create user in database: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 7.  Send back the new user data (without the password hash)
	//  Create a separate struct without the password.
	type UserForClient struct {
		ID          string `json:"id"`
		Username    string `json:"username"`
		Email       string `json:"email"`
		DateCreated string `json:"date_created"`
	}

	userForClient := UserForClient{
		ID:          userID,
		Username:    username,
		Email:       email,
		DateCreated: createdAt,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated) //  201 Created
	err = json.NewEncoder(w).Encode(userForClient)
	if err != nil {
		http.Error(w, "Failed to encode JSON: "+err.Error(), http.StatusInternalServerError)
		return // Important: Return after setting error status
	}
}

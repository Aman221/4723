package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/Aman221/4723/internal/database" // Import your database package
	"github.com/Aman221/4723/internal/models"
	"github.com/gorilla/mux"
	"golang.org/x/crypto/bcrypt"
)

// LoginHandler handles requests to authenticate a user
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username, ok1 := vars["username"]
	password, ok2 := vars["password"]

	if !ok1 {
		http.Error(w, "Username not provided", http.StatusBadRequest)
		return
	}

	if !ok2 {
		http.Error(w, "Password not provided", http.StatusBadRequest)
		return
	}

	// 1. Fetch the user from the database by username
	row := database.DB.QueryRow("SELECT uid, username, password, email, date_created FROM user_logins WHERE username = $1", username)
	var user models.UClient
	err := row.Scan(&user.ID, &user.Username, &user.Password, &user.Email, &user.DateCreated) // Note that we scan the passwordHash into user.Password
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized) // Use 401 for authentication failures
			return
		}
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// 2. Compare the provided password with the stored hash
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		// Password does not match
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// 3. If the password matches, send the user data (without the password hash)
	//  Important:  Do not send the password hash to the client.  Create a new object.
	userForClient := models.UClient{
		ID:          user.ID,
		Username:    user.Username,
		Email:       user.Email,
		DateCreated: user.DateCreated,
		Password:    "", //  Explicitly set Password to empty
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userForClient) //  Encode the safe user data
}

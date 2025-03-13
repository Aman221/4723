package services

import (
    "github.com/Aman221/4723/internal/models"
)

// GetUser fetches user details
func GetUser(id int) models.User {
    return models.User{ID: id, Name: "Arjun", Email: "arjun@example.com"}
}

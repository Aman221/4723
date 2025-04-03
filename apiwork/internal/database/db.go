package database

import (
	"database/sql"

	_ "github.com/lib/pq" // PostgreSQL driver
)

var DB *sql.DB

func InitDB() error {
	var err error
	DB, err = sql.Open("postgres", "postgres://amanuel:@localhost/users?sslmode=disable")
	return err
}

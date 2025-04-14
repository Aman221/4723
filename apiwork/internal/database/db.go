package database

import (
	"database/sql"

	_ "github.com/lib/pq" // PostgreSQL driver
)

var DB *sql.DB

func InitUserDB() error {
	var err error
	DB, err = sql.Open("postgres", "postgres://amanuel:@localhost/user_logins?sslmode=disable")
	return err
}

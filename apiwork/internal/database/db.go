package database

import (
    "database/sql"
    _ "github.com/lib/pq" // PostgreSQL driver
)

var DB *sql.DB

func InitDB() error {
    var err error
    DB, err = sql.Open("postgres", "postgres://user:password@localhost/dbname?sslmode=disable")
    return err
}

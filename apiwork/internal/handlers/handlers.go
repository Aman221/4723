package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/lib/pq"

	"github.com/Aman221/4723/internal/database" // Import your database package
	"github.com/gorilla/mux"                    // Import gorilla mux for route variables
)

// Define the Go structs based on your TypeScript interfaces
type CalendarEvent struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	StartTime   string   `json:"startTime"`
	EndTime     string   `json:"endTime"`
	Color       string   `json:"color"`
	Day         int      `json:"day"`
	Description string   `json:"description"`
	Location    string   `json:"location"`
	Attendees   []string `json:"attendees"`
	Organizer   string   `json:"organizer"`
	CalendarID  string   `json:"calendarId"`
	Date        *string  `json:"date,omitempty"` // Use pointer to handle optional field
}

type NCalendarEvent struct {
	Title       string   `json:"title"`
	StartTime   string   `json:"startTime"`
	EndTime     string   `json:"endTime"`
	Color       string   `json:"color"`
	Day         int      `json:"day"`
	Description string   `json:"description"`
	Location    string   `json:"location"`
	Attendees   []string `json:"attendees"`
	Organizer   string   `json:"organizer"`
	CalendarID  string   `json:"calendarId"`
	Date        *string  `json:"date,omitempty"` // Use pointer to handle optional field
}

type Calendar struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Color   string `json:"color"`
	Visible bool   `json:"visible"`
}

type NCalendar struct {
	Name    string `json:"name"`
	Color   string `json:"color"`
	Visible bool   `json:"visible"`
}

// GetUserCalendarHandler handles requests to fetch a user's calendar (example)
func GetUserCalendarHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userIDStr, ok := vars["id"]
	if !ok {
		http.Error(w, "User ID not provided", http.StatusBadRequest)
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Example database query (adjust based on your schema)
	rows, err := database.DB.Query("SELECT id, name, color, visible FROM calendars WHERE user_id = $1", userID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var calendars []Calendar
	for rows.Next() {
		var cal Calendar
		if err := rows.Scan(&cal.ID, &cal.Name, &cal.Color, &cal.Visible); err != nil {
			http.Error(w, "Error scanning calendar data", http.StatusInternalServerError)
			return
		}
		calendars = append(calendars, cal)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(calendars)
}

// GetUserEventsHandler handles requests to fetch a user's events (example)
func GetUserEventsHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userIDStr, ok := vars["id"]
	if !ok {
		http.Error(w, "User ID not provided", http.StatusBadRequest)
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Example database query (adjust based on your schema)
	rows, err := database.DB.Query("SELECT id, title, start_time, end_time, color, day, description, location, attendees, organizer, calendar_id, date FROM calendar_events WHERE user_id = $1", userID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var events []CalendarEvent
	for rows.Next() {
		var event CalendarEvent
		var attendeesStr string // Assuming attendees are stored as a string in the DB
		var date sql.NullString

		if err := rows.Scan(&event.ID, &event.Title, &event.StartTime, &event.EndTime, &event.Color, &event.Day, &event.Description, &event.Location, &attendeesStr, &event.Organizer, &event.CalendarID, &date); err != nil {
			http.Error(w, "Error scanning event data", http.StatusInternalServerError)
			return
		}
		if date.Valid {
			event.Date = &date.String
		}
		if err := json.Unmarshal([]byte(attendeesStr), &event.Attendees); err != nil {
			fmt.Println("Error unmarshalling attendees:", err) // Log the error, might need more robust handling
			event.Attendees = []string{}                       // Initialize to empty slice in case of error
		}
		events = append(events, event)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

// GetUserPaymentHandler handles requests to fetch a user's payment information (example - replace with actual logic)
func GetUserPaymentHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userIDStr, ok := vars["id"]
	if !ok {
		http.Error(w, "User ID not provided", http.StatusBadRequest)
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// In a real application, you would query your database for payment information
	paymentInfo := fmt.Sprintf("Payment information for user ID: %d (Not fully implemented)", userID)

	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(paymentInfo))
}

// EndpointAPIHandler handles requests to a generic endpoint API (example - replace with actual logic)
func EndpointAPIHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userIDStr, ok := vars["id"]
	if !ok {
		http.Error(w, "User ID not provided", http.StatusBadRequest)
		return
	}

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Replace this with your actual logic for this generic endpoint
	responseData := fmt.Sprintf("Data from the generic API endpoint for user ID: %d (Not fully implemented)", userID)

	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(responseData))
}

// GetCalendarsHandler handles requests to get all calendars
func GetCalendarsHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query("SELECT id, name, color, visible FROM calendars")
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var calendars []Calendar
	for rows.Next() {
		var cal Calendar
		if err := rows.Scan(&cal.ID, &cal.Name, &cal.Color, &cal.Visible); err != nil {
			http.Error(w, "Error scanning calendar data", http.StatusInternalServerError)
			return
		}
		calendars = append(calendars, cal)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(calendars)
}

// AddCalendarHandler handles requests to add a new calendar
func AddCalendarHandler(w http.ResponseWriter, r *http.Request) {
	var newCalendar NCalendar
	err := json.NewDecoder(r.Body).Decode(&newCalendar)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// Example database insertion (adjust based on your schema)
	_, err = database.DB.Exec("INSERT INTO calendars (name, color, visible) VALUES ($1, $2, $3)",
		newCalendar.Name, newCalendar.Color, newCalendar.Visible)
	if err != nil {
		http.Error(w, fmt.Sprintf("Database error: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newCalendar)
}

// UpdateCalendarHandler handles requests to update a calendar
func UpdateCalendarHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, ok := vars["id"]
	if !ok {
		http.Error(w, "Calendar ID not provided", http.StatusBadRequest)
		return
	}

	var updatedCalendar Calendar
	err := json.NewDecoder(r.Body).Decode(&updatedCalendar)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// Example database update (adjust based on your schema)
	_, err = database.DB.Exec("UPDATE calendars SET name = $1, color = $2, visible = $3 WHERE id = $4",
		updatedCalendar.Name, updatedCalendar.Color, updatedCalendar.Visible, id)
	if err != nil {
		http.Error(w, fmt.Sprintf("Database error: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(updatedCalendar)
}

// DeleteCalendarHandler handles requests to delete a calendar
func DeleteCalendarHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, ok := vars["id"]
	if !ok {
		http.Error(w, "Calendar ID not provided", http.StatusBadRequest)
		return
	}

	// Example database deletion (adjust based on your schema)
	_, err := database.DB.Exec("DELETE FROM calendars WHERE id = $1", id)
	if err != nil {
		http.Error(w, fmt.Sprintf("Database error: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent) // 204 No Content for successful deletion
}

// UpdateCalendarVisibilityHandler handles requests to update calendar visibility
func UpdateCalendarVisibilityHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, ok := vars["id"]
	if !ok {
		http.Error(w, "Calendar ID not provided", http.StatusBadRequest)
		return
	}

	var visibilityData struct {
		Visible bool `json:"visible"`
	}
	err := json.NewDecoder(r.Body).Decode(&visibilityData)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// Example database update (adjust based on your schema)
	_, err = database.DB.Exec("UPDATE calendars SET visible = $1 WHERE id = $2", visibilityData.Visible, id)
	if err != nil {
		http.Error(w, fmt.Sprintf("Database error: %v", err), http.StatusInternalServerError)
		return
	}

	// Optionally return the updated calendar or a success message
	w.WriteHeader(http.StatusOK)
	// You might want to fetch and return the updated calendar here
}

// GetEventsHandler handles requests to get events filtered by calendar IDs
func GetEventsHandler(w http.ResponseWriter, r *http.Request) {
	calendarIDs := r.URL.Query()["calendarIds[]"] // Get multiple calendarIds

	if len(calendarIDs) == 0 {
		http.Error(w, "calendarIds parameter is required", http.StatusBadRequest)
		return
	}

	// Construct the SQL query dynamically based on the number of calendar IDs
	query := "SELECT id, title, start_time, end_time, color, day, description, location, attendees, organizer, calendar_id, date FROM calendar_events WHERE calendar_id IN ("
	for i := range calendarIDs {
		if i > 0 {
			query += ","
		}
		query += "$" + strconv.Itoa(i+1)
	}
	query += ")"

	args := make([]interface{}, len(calendarIDs))
	for i, id := range calendarIDs {
		args[i] = id
	}

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var events []CalendarEvent
	for rows.Next() {
		var event CalendarEvent
		var attendeesStr string
		var date sql.NullString

		if err := rows.Scan(&event.ID, &event.Title, &event.StartTime, &event.EndTime, &event.Color, &event.Day, &event.Description, &event.Location, &attendeesStr, &event.Organizer, &event.CalendarID, &date); err != nil {
			http.Error(w, "Error scanning event data", http.StatusInternalServerError)
			return
		}
		if date.Valid {
			event.Date = &date.String
		}
		if err := json.Unmarshal([]byte(attendeesStr), &event.Attendees); err != nil {
			fmt.Println("Error unmarshalling attendees:", err)
			event.Attendees = []string{}
		}
		events = append(events, event)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

// SearchEventsHandler handles requests to search events
func SearchEventsHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("query")
	includeHiddenStr := r.URL.Query().Get("includeHidden")
	includeHidden := false
	if includeHiddenStr == "true" {
		includeHidden = true
	}

	if query == "" {
		http.Error(w, "query parameter is required", http.StatusBadRequest)
		return
	}

	// Example database query (adjust based on your schema and search logic)
	searchQuery := "%" + query + "%"
	var rows *sql.Rows
	var err error

	if includeHidden {
		rows, err = database.DB.Query("SELECT id, title, start_time, end_time, color, day, description, location, attendees, organizer, calendar_id, date FROM calendar_events WHERE title LIKE $1 OR description LIKE $1 OR location LIKE $1", searchQuery)
	} else {
		rows, err = database.DB.Query(`
			SELECT e.id, e.title, e.start_time, e.end_time, e.color, e.day, e.description, e.location, e.attendees, e.organizer, e.calendar_id, e.date
			FROM calendar_events e
			JOIN calendars c ON e.calendar_id = c.id
			WHERE (e.title LIKE $1 OR e.description LIKE $1 OR e.location LIKE $1) AND c.visible = TRUE
		`, searchQuery)
	}

	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var events []CalendarEvent
	for rows.Next() {
		var event CalendarEvent
		var attendeesStr string
		var date sql.NullString

		if err := rows.Scan(&event.ID, &event.Title, &event.StartTime, &event.EndTime, &event.Color, &event.Day, &event.Description, &event.Location, &attendeesStr, &event.Organizer, &event.CalendarID, &date); err != nil {
			http.Error(w, "Error scanning event data", http.StatusInternalServerError)
			return
		}
		if date.Valid {
			event.Date = &date.String
		}
		if err := json.Unmarshal([]byte(attendeesStr), &event.Attendees); err != nil {
			fmt.Println("Error unmarshalling attendees:", err)
			event.Attendees = []string{}
		}
		events = append(events, event)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

func AddEventHandler(w http.ResponseWriter, r *http.Request) {
	var newEvent NCalendarEvent
	err := json.NewDecoder(r.Body).Decode(&newEvent)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()
	if newEvent.Date != nil && newEvent.Day == 0 {
		date, err := time.Parse(time.RFC3339, *newEvent.Date+"T00:00:00Z")
		if err == nil {
			newEvent.Day = int(date.Weekday())
			if newEvent.Day == 0 {
				newEvent.Day = 7
			}
		}
	}
	_, err = database.DB.Exec(`
        INSERT INTO calendar_events (title, start_time, end_time, color, day, description, location, attendees, organizer, calendar_id, date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, newEvent.Title, newEvent.StartTime, newEvent.EndTime, newEvent.Color, newEvent.Day, newEvent.Description, newEvent.Location,
		pq.Array(newEvent.Attendees),
		newEvent.Organizer, newEvent.CalendarID, newEvent.Date)
	if err != nil {
		http.Error(w, fmt.Sprintf("Database error: %v", err), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newEvent)
}

func UpdateEventHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	eventID, _ := vars["eventId"]
	var updatedEvent CalendarEvent
	err := json.NewDecoder(r.Body).Decode(&updatedEvent)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()
	if updatedEvent.Date != nil && updatedEvent.Day == 0 {
		date, err := time.Parse(time.RFC3339, *updatedEvent.Date+"T00:00:00Z")
		if err == nil {
			updatedEvent.Day = int(date.Weekday())
			if updatedEvent.Day == 0 {
				updatedEvent.Day = 7
			}
		}
	}
	_, err = database.DB.Exec(`
		UPDATE calendar_events
		SET title = $1, start_time = $2, end_time = $3, color = $4, day = $5, description = $6, location = $7, attendees = $8, organizer = $9, calendar_id = $10, date = $11
		WHERE id = $12
	`, updatedEvent.Title, updatedEvent.StartTime, updatedEvent.EndTime, updatedEvent.Color, updatedEvent.Day, updatedEvent.Description, updatedEvent.Location,
		`[]`, updatedEvent.Organizer, updatedEvent.CalendarID, updatedEvent.Date, eventID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Database error: %v", err), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(updatedEvent)
}

func DeleteEventHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	eventID, _ := vars["eventId"]
	_, err := database.DB.Exec("DELETE FROM calendar_events WHERE id = $1", eventID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Database error: %v", err), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func GetCurrentDateHandler(w http.ResponseWriter, r *http.Request) {
	now := time.Now().In(time.FixedZone("America/New_York", -4*60*60)) // Atlanta is in EDT (UTC-4)
	response := map[string]string{"currentDate": now.Format(time.RFC3339)}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func NavigateCalendarHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	direction, ok := vars["direction"]
	if !ok {
		http.Error(w, "Navigation direction not provided", http.StatusBadRequest)
		return
	}

	// In a real application, you would likely have a way to track the current
	// calendar view (e.g., in a session or request context). For this example,
	// we'll just manipulate the current date.

	now := time.Now().In(time.FixedZone("America/New_York", -4*60*60))
	var newDate time.Time

	switch direction {
	case "prev":
		newDate = now.AddDate(0, 0, -7) // Go back 7 days (example)
	case "next":
		newDate = now.AddDate(0, 0, 7) // Go forward 7 days (example)
	case "today":
		newDate = time.Now().In(time.FixedZone("America/New_York", -4*60*60))
	default:
		http.Error(w, "Invalid navigation direction", http.StatusBadRequest)
		return
	}

	response := map[string]string{"currentDate": newDate.Format(time.RFC3339)}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

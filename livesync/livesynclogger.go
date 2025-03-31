package webhooks

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid" // go get github.com/google/uuid
	"google.golang.org/api/calendar/v3"
	"google.golang.org/api/option"
	// --- OAuth 2.0 Dependencies (Need full implementation) ---
	// "golang.org/x/oauth2"
	// "golang.org/x/oauth2/google"
	// "os"
	// --------------------------------------------------------
)

// !!! --- Placeholder for OAuth 2.0 Client --- !!!
// In a real application, you would implement the full OAuth 2.0 flow
// (web flow or service account) to get an authorized http.Client.
// This function is a placeholder. Replace with your actual implementation.
func getOAuthClient(ctx context.Context) (*http.Client, error) {
	// --- Example using placeholder credentials/token ---
	// b, err := os.ReadFile("path/to/your/credentials.json")
	// if err != nil {
	//     log.Fatalf("Unable to read client secret file: %v", err)
	// }
	// config, err := google.ConfigFromJSON(b, calendar.CalendarEventsScope, calendar.CalendarReadonlyScope)
	// if err != nil {
	//     log.Fatalf("Unable to parse client secret file to config: %v", err)
	// }
	// // The file token.json stores the user's access and refresh tokens, and is
	// // created automatically when the authorization flow completes for the first time.
	// tokFile := "token.json"
	// tok, err := tokenFromFile(tokFile) // Need tokenFromFile helper
	// if err != nil {
	//     tok = getTokenFromWeb(config) // Need getTokenFromWeb helper
	//     saveToken(tokFile, tok) // Need saveToken helper
	// }
	// return config.Client(context.Background(), tok), nil
	// --- End Example ---

	log.Println("WARNING: Using default unauthenticated HTTP client. API calls requiring auth will fail.")
	log.Println("Replace getOAuthClient with your actual OAuth 2.0 implementation.")
	// Returning default client WILL NOT WORK for watching private calendars.
	// It *might* work for watching public calendars if you don't need auth.
	return http.DefaultClient, fmt.Errorf("OAuth 2.0 client setup required") // Indicate error - needs implementation
}

// --- End Placeholder ---

func main() {
	ctx := context.Background()

	// 1. Get Authenticated HTTP Client (Replace with real OAuth flow)
	client, err := getOAuthClient(ctx)
	if err != nil {
		// If you only need to watch public resources, you *might* skip auth,
		// but it's generally required for user-specific data.
		log.Printf("Warning: Failed to get OAuth client, proceeding unauthenticated: %v", err)
		// Handle the error appropriately, maybe exit if auth is mandatory
		// return
	}

	// 2. Create Calendar Service
	calendarService, err := calendar.NewService(ctx, option.WithHTTPClient(client))
	if err != nil {
		log.Fatalf("Unable to retrieve Calendar client: %v", err)
	}

	// 3. Configure the Watch Channel
	channelID := uuid.New().String()             // Generate a unique ID for this channel
	webhookURL := "YOUR_NGROK_HTTPS_URL/webhook" // !!! REPLACE THIS !!! (e.g., https://abcd-1234.ngrok.io/webhook)

	if webhookURL == "YOUR_NGROK_HTTPS_URL/webhook" {
		log.Fatal("FATAL: You must replace YOUR_NGROK_HTTPS_URL with your actual public ngrok HTTPS URL.")
	}

	channel := &calendar.Channel{
		Id:      channelID,
		Type:    "web_hook",
		Address: webhookURL,
		// Token: "optional-secure-token-to-verify-request", // Optional: verify requests
		// Params: map[string]string{"ttl": "3600"}, // Optional: Time-to-live in seconds (default varies)
	}

	// 4. Call the Watch method (Watching 'primary' calendar events here)
	log.Printf("Registering watch on 'primary' calendar...")
	log.Printf("Channel ID: %s", channelID)
	log.Printf("Webhook URL: %s", webhookURL)

	// Replace "primary" with a specific calendar ID if needed
	watchCall := calendarService.Events.Watch("primary", channel)
	createdChannel, err := watchCall.Do()
	if err != nil {
		log.Fatalf("Error calling Events.Watch: %v", err)
	}

	// 5. Log Results
	log.Println("--- Watch Registered Successfully ---")
	log.Printf("Channel ID: %s", createdChannel.Id)
	log.Printf("Resource ID: %s", createdChannel.ResourceId) // ID of the resource being watched (calendar)
	log.Printf("Expiration: %d (%s)", createdChannel.Expiration, time.UnixMilli(createdChannel.Expiration).Format(time.RFC1123))
	log.Println("-----------------------------------")
	log.Println("Your webhook server should now start receiving notifications at /webhook.")
	log.Println("Remember channels expire! You need to renew them periodically before expiration.")
}

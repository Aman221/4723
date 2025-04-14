import type { NextApiRequest, NextApiResponse } from 'next';

const GO_API_URL = 'http://localhost:8080'; //  Replace with your Go API's URL

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { username, password } = req.body;
        console.log(req.body);

        //  Validation
        if (!username || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        try {
            //  1.  Forward the request to your Go API
            const goResponse = await fetch(`${GO_API_URL}/login/${username}+${password}`, { //  Adjust the endpoint if needed
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            //  2.  Get the data from the Go API response
            const goData = await goResponse.json();

             // 3.  Relay the status code and data from the Go API
            res.status(goResponse.status).json(goData);

        } catch (error: any) {
            //  Handle network errors or other issues when communicating with the Go API
            console.error('Error communicating with Go API:', error);
            res.status(500).json({ message: 'Failed to connect to Go API: ' + error.message });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}

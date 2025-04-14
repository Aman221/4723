import type { NextApiRequest, NextApiResponse } from 'next';

const GO_API_URL = 'http://localhost:8080'; //  Replace with your Go API's URL

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { username, password, email } = req.body;
        console.log("Creating...");

        //  Validation
        if (!username || !password || !email) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        try {
            const goResponse = await fetch(`${GO_API_URL}/create/${username}+${password}+${email}`, { //  Construct the URL
                method: 'POST', //  Use GET since the Go API expects it in the path
            });

            //  2.  Check the response status from the Go API
            if (!goResponse.ok) {
                //  Handle Go API errors appropriately
                const goData = await goResponse.json(); //  Attempt to get error message from Go API
                return res.status(goResponse.status).json(goData); //  Relay Go API error
            }

            //  3.  Get the data from the Go API response
            const goData = await goResponse.json();

            // 4.  Relay the data from the Go API back to the client
            res.status(200).json(goData);

        } catch (error: any) {
            //  Handle network errors or other issues when communicating with the Go API
            console.error('Error communicating with Go API:', error);
            res.status(500).json({ message: 'Failed to connect to Go API: ' + error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
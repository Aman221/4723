import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    // Replace this with your actual authentication logic (e.g., database check)
    if (username === 'test' && password === 'password') {
      res.status(200).json({ message: 'Login successful' });
      // In a real app, you'd typically set a session or JWT here
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
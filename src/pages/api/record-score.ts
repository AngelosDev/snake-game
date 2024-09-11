import { NextApiRequest, NextApiResponse } from 'next'

// This would typically be stored in a database
const scores: { [key: string]: number } = {}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { nickname, score } = req.body

    if (!nickname || typeof score !== 'number') {
      return res.status(400).json({ message: 'Nickname and score are required' })
    }

    // Record the score
    if (!scores[nickname] || score > scores[nickname]) {
      scores[nickname] = score
    }

    return res.status(200).json({ message: 'Score recorded successfully' })
  }

  if (req.method === 'GET') {
    // Return all scores
    return res.status(200).json(scores)
  }

  res.setHeader('Allow', ['POST', 'GET'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
import { NextApiRequest, NextApiResponse } from 'next'

// This would typically be a database call
const usedNicknames = new Set<string>()

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { nickname } = req.body

    if (!nickname) {
      return res.status(400).json({ message: 'Nickname is required' })
    }

    if (usedNicknames.has(nickname)) {
      // Generate a suggestion by appending a number
      let suggestion = nickname
      let counter = 1
      while (usedNicknames.has(suggestion)) {
        suggestion = `${nickname}${counter}`
        counter++
      }
      return res.status(409).json({ 
        message: 'Nickname already taken', 
        suggestion 
      })
    }

    // Register the nickname
    usedNicknames.add(nickname)
    return res.status(200).json({ message: 'Nickname registered successfully' })
  }

  res.setHeader('Allow', ['POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
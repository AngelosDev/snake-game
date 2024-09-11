'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"

// Define types
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type Position = [number, number]
type LeaderboardEntry = { nickname: string; score: number }

// Define a custom Window interface that includes webkitAudioContext
interface CustomWindow extends Window {
  webkitAudioContext?: new () => AudioContext;
}

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SNAKE: Position[] = [[5, 5]]
const INITIAL_DIRECTION: Direction = 'RIGHT'
const INITIAL_FOOD: Position = [10, 10]
const GAME_SPEED = 100 // milliseconds
const RAINBOW_DURATION = 3000 // milliseconds

// Rainbow colors
const RAINBOW_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']

// Fruit colors
const FRUIT_COLORS = ['#FF0000', '#FF69B4', '#800080', '#4B0082', '#0000FF', '#00FFFF', '#008080', '#008000', '#00FF00', '#FFFF00', '#FFA500', '#FF4500']

// Snake Head component
const SnakeHead: React.FC<{ position: Position; direction: Direction }> = ({ position, direction }) => {
  const [x, y] = position
  const rotate = {
    'UP': 'rotate-180',
    'DOWN': 'rotate-0',
    'LEFT': '-rotate-90',
    'RIGHT': 'rotate-90'
  }[direction]

  return (
    <div
      className={`absolute ${rotate} transition-transform`}
      style={{
        left: x * CELL_SIZE,
        top: y * CELL_SIZE,
        width: CELL_SIZE,
        height: CELL_SIZE,
      }}
    >
      <div className="relative w-full h-full bg-green-600 rounded-full">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full"></div>
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white rounded-full"></div>
        <div className="absolute bottom-1/4 left-1/3 right-1/3 h-1 bg-red-500 rounded-full"></div>
      </div>
    </div>
  )
}

export default function EnhancedSnakeGame() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION)
  const [food, setFood] = useState<Position>(INITIAL_FOOD)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isRainbow, setIsRainbow] = useState(false)
  const [fruitColor, setFruitColor] = useState(FRUIT_COLORS[0])
  const [isMuted, setIsMuted] = useState(false)
  const [nickname, setNickname] = useState('')
  const [gameStarted, setGameStarted] = useState(false)
  const [nicknameError, setNicknameError] = useState('')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    const savedNickname = localStorage.getItem('snakeGameNickname')
    if (savedNickname) {
      setNickname(savedNickname)
    }
  }, [])

  useEffect(() => {
    if (gameOver) {
      const timer = setTimeout(() => {
        fetchLeaderboard()
      }, 500) // Delay of 500ms to ensure the score is recorded before fetching
      return () => clearTimeout(timer)
    }
  }, [gameOver])

  const handleNicknameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/register-nickname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname }),
      })
      const data = await response.json()
      if (response.ok) {
        localStorage.setItem('snakeGameNickname', nickname)
        setGameStarted(true)
        setNicknameError('')
      } else {
        setNicknameError(data.message)
        if (data.suggestion) {
          setNickname(data.suggestion)
        }
      }
    } catch (error) {
      console.error('Error registering nickname:', error)
      setNicknameError('An error occurred. Please try again.')
    }
  }

  // Generate beep sound
  const playBeep = useCallback(() => {
    if (isMuted) return
    if (!audioContextRef.current) {
      const customWindow = window as CustomWindow
      const AudioContextClass = window.AudioContext || customWindow.webkitAudioContext
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass()
      } else {
        console.warn('AudioContext not supported')
        return
      }
    }
    const oscillator = audioContextRef.current.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime) // 440 Hz = A4 note
    oscillator.connect(audioContextRef.current.destination)
    oscillator.start()
    oscillator.stop(audioContextRef.current.currentTime + 0.1) // Beep for 100ms
  }, [isMuted])

  // Generate new food position and color
  const generateFood = useCallback((): Position => {
    let newFood: Position
    do {
      newFood = [
        Math.floor(Math.random() * GRID_SIZE),
        Math.floor(Math.random() * GRID_SIZE),
      ]
    } while (snake.some(segment => segment[0] === newFood[0] && segment[1] === newFood[1]))
    setFruitColor(FRUIT_COLORS[Math.floor(Math.random() * FRUIT_COLORS.length)])
    return newFood
  }, [snake])

  // Move the snake
  const moveSnake = useCallback(() => {
    if (gameOver) return

    const newSnake = [...snake]
    const head = [...newSnake[0]] as Position

    switch (direction) {
      case 'UP':
        head[1] = (head[1] - 1 + GRID_SIZE) % GRID_SIZE
        break
      case 'DOWN':
        head[1] = (head[1] + 1) % GRID_SIZE
        break
      case 'LEFT':
        head[0] = (head[0] - 1 + GRID_SIZE) % GRID_SIZE
        break
      case 'RIGHT':
        head[0] = (head[0] + 1) % GRID_SIZE
        break
    }

    newSnake.unshift(head)

    // Check if snake ate food
    if (head[0] === food[0] && head[1] === food[1]) {
      setScore(prevScore => prevScore + 1)
      setFood(generateFood())
      setIsRainbow(true)
      setTimeout(() => setIsRainbow(false), RAINBOW_DURATION)
      playBeep()
    } else {
      newSnake.pop()
    }

    // Check for collision with self
    if (newSnake.slice(1).some(segment => segment[0] === head[0] && segment[1] === head[1])) {
      setGameOver(true)
      sendScore()
      return
    }

    setSnake(newSnake)
  }, [snake, direction, food, gameOver, generateFood, playBeep])

  // Handle key presses
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        if (direction !== 'DOWN') setDirection('UP')
        break
      case 'ArrowDown':
        if (direction !== 'UP') setDirection('DOWN')
        break
      case 'ArrowLeft':
        if (direction !== 'RIGHT') setDirection('LEFT')
        break
      case 'ArrowRight':
        if (direction !== 'LEFT') setDirection('RIGHT')
        break
    }
  }, [direction])

  // Set up game loop and event listener
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const gameLoop = setInterval(moveSnake, GAME_SPEED)
      window.addEventListener('keydown', handleKeyPress)

      return () => {
        clearInterval(gameLoop)
        window.removeEventListener('keydown', handleKeyPress)
      }
    }
  }, [moveSnake, handleKeyPress, gameStarted, gameOver])

  // Reset game
  const resetGame = () => {
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    setFood(INITIAL_FOOD)
    setScore(0)
    setGameOver(false)
    setIsRainbow(false)
    setFruitColor(FRUIT_COLORS[0])
    setGameStarted(true)
    setLeaderboard([])
  }

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  // Send score to server
  const sendScore = async () => {
    try {
      await fetch('/api/record-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname, score }),
      })
    } catch (error) {
      console.error('Error recording score:', error)
    }
  }

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/record-score')
      const data = await response.json()
      const sortedLeaderboard = Object.entries(data)
        .map(([nickname, score]) => ({ nickname, score: score as number }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
      setLeaderboard(sortedLeaderboard)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    }
  }

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800">
        <h1 className="text-5xl font-bold mb-4 text-white shadow-lg">Snake Game</h1>
        <form onSubmit={handleNicknameSubmit} className="flex flex-col items-center">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter your nickname"
            className="px-4 py-2 mb-2 rounded"
          />
          {nicknameError && <p className="text-red-500 mb-2">{nicknameError}</p>}
          <Button type="submit">Start Game</Button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800">
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        .shake {
          animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
      <h1 className="text-5xl font-bold mb-4 text-white shadow-lg">Snake Game</h1>
      <div className="mb-4 flex items-center bg-gray-700 p-2 rounded-lg shadow-md">
        <span className="mr-4 text-xl font-semibold text-white">Score: {score}</span>
        <Button onClick={toggleMute} variant="ghost" size="icon" className="text-white hover:text-gray-300">
          {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        </Button>
      </div>
      <div 
        className={`border-2 border-gray-400 relative ${gameOver ? 'shake' : ''} bg-gray-900`}
        style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
      >
        {snake.map((segment, index) => (
          index === 0 ? (
            <SnakeHead key="head" position={segment} direction={direction} />
          ) : (
            <div
              key={index}
              className={`absolute rounded-full ${isRainbow ? 'animate-pulse' : ''}`}
              style={{
                left: segment[0] * CELL_SIZE,
                top: segment[1] * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: isRainbow ? RAINBOW_COLORS[index % RAINBOW_COLORS.length] : 'green',
              }}
            />
          )
        ))}
        <div
          className="absolute rounded-full"
          style={{
            left: food[0] * CELL_SIZE,
            top: food[1] * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
            backgroundColor: fruitColor,
          }}
        />
      </div>
      {gameOver && (
        <div className="mt-4 text-center">
          <h2 className="text-3xl font-bold mb-2 text-white">Game Over!</h2>
          <p className="text-xl text-white mb-4">Your score: {score}</p>
          {leaderboard.length > 0 && (
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-white mb-2">Leaderboard</h3>
              <ul className="bg-gray-700 rounded-lg p-2">
                {leaderboard.map((entry, index) => (
                  <li key={index} className="text-white">
                    {index + 1}. {entry.nickname}: {entry.score}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Button onClick={resetGame} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
            Play Again
          </Button>
        </div>
      )}
      <div className="mt-4 text-sm text-gray-300">
        Use arrow keys to control the snake
      </div>
    </div>
  )
}
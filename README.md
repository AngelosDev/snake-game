# Snake Game

A modern implementation of the classic Snake game using Next.js, React, and TypeScript.

## Features

- Classic Snake gameplay with a modern twist
- Nickname registration with uniqueness check
- Local storage to remember the player's nickname
- Leaderboard to display top scores
- Responsive design
- Sound effects (with mute option)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/snake-game.git
   cd snake-game
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Run the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to play the game.

## How to Play

1. Enter your nickname when prompted.
2. Use the arrow keys to control the snake's direction.
3. Eat the colorful fruits to grow and increase your score.
4. Avoid colliding with the walls or the snake's own body.
5. Try to achieve the highest score and make it to the leaderboard!

## Development

The game is built using Next.js, React, and TypeScript. Here's an overview of the project structure:

- `src/app/page.tsx`: The main game component
- `src/pages/api/register-nickname.ts`: API route for nickname registration
- `src/pages/api/record-score.ts`: API route for recording and retrieving scores

To add new features or modify the game:

1. Make your changes in the relevant files.
2. Test your changes using the development server.
3. Build the project using `npm run build` or `yarn build`.
4. Deploy the `out` directory to your preferred hosting platform.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

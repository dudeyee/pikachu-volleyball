import React, { useState, useEffect, useCallback, useRef } from 'react';

const PikachuVolleyball: React.FC = () => {
    const [pikachuX, setPikachuX] = useState(150);
    const [opponentX, setOpponentX] = useState(150);
    const [ballX, setBallX] = useState(200);
    const [ballY, setBallY] = useState(160);
    const [ballSpeedX, setBallSpeedX] = useState(2);
    const [ballSpeedY, setBallSpeedY] = useState(-2);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [speedMultiplier, setSpeedMultiplier] = useState(1);
    const gameAreaRef = useRef<HTMLDivElement>(null);

    const GAME_WIDTH = 384;
    const GAME_HEIGHT = 320;
    const PLAYER_WIDTH = 48;
    const PLAYER_HEIGHT = 48;
    const BALL_SIZE = 32;

    const updateGame = useCallback(() => {
        if (gameOver) return;

        // Update ball position
        setBallX(x => {
            const newX = x + ballSpeedX * speedMultiplier;
            if (newX <= 0 || newX >= GAME_WIDTH - BALL_SIZE) {
                setBallSpeedX(speed => -speed);
                return x;
            }
            return newX;
        });

        setBallY(y => {
            const newY = y + ballSpeedY * speedMultiplier;
            if (newY <= PLAYER_HEIGHT) {
                // Ball hits the top (opponent's area)
                if (ballX + BALL_SIZE > opponentX && ballX < opponentX + PLAYER_WIDTH) {
                    setBallSpeedY(speed => Math.abs(speed)); // Ensure downward direction
                    return PLAYER_HEIGHT;
                }
            } else if (newY >= GAME_HEIGHT - PLAYER_HEIGHT - BALL_SIZE) {
                // Ball hits the bottom (player's area)
                if (ballX + BALL_SIZE > pikachuX && ballX < pikachuX + PLAYER_WIDTH) {
                    setBallSpeedY(speed => -Math.abs(speed)); // Ensure upward direction
                    setScore(s => s + 1);
                    return GAME_HEIGHT - PLAYER_HEIGHT - BALL_SIZE;
                } else if (newY >= GAME_HEIGHT - BALL_SIZE) {
                    // Ball touches the ground, game over
                    setGameOver(true);
                    return GAME_HEIGHT - BALL_SIZE;
                }
            }
            return newY;
        });

        // Simple AI for opponent
        setOpponentX(x => {
            const targetX = ballX - PLAYER_WIDTH / 2 + BALL_SIZE / 2;
            const diff = targetX - x;
            const speed = 3 * speedMultiplier; // Adjust AI speed based on multiplier
            return Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, x + Math.sign(diff) * Math.min(Math.abs(diff), speed)));
        });

    }, [ballSpeedX, ballSpeedY, pikachuX, opponentX, gameOver, ballX, speedMultiplier]);

    useEffect(() => {
        const gameLoop = setInterval(updateGame, 1000 / 60);
        return () => clearInterval(gameLoop);
    }, [updateGame]);

    useEffect(() => {
        const speedIncreaseInterval = setInterval(() => {
            setSpeedMultiplier(prev => prev + 0.1);
        }, 10000); // Increase speed every 10 seconds

        return () => clearInterval(speedIncreaseInterval);
    }, []);

    const movePikachu = (newX: number) => {
        setPikachuX(Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, newX)));
    };

    const handleInteraction = useCallback((clientX: number) => {
        if (gameAreaRef.current) {
            const rect = gameAreaRef.current.getBoundingClientRect();
            const relativeX = clientX - rect.left;
            movePikachu(relativeX - PLAYER_WIDTH / 2);
        }
    }, []);

    const handleTouch = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        handleInteraction(e.touches[0].clientX);
    }, [handleInteraction]);

    const handleMouse = useCallback((e: React.MouseEvent) => {
        handleInteraction(e.clientX);
    }, [handleInteraction]);

    const resetGame = () => {
        setPikachuX(150);
        setOpponentX(150);
        setBallX(200);
        setBallY(160);
        setBallSpeedX(2);
        setBallSpeedY(-2);
        setScore(0);
        setGameOver(false);
        setSpeedMultiplier(1);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-yellow-100 overflow-hidden">
            <h1 className="text-3xl font-bold mb-4">DUDEYEE小恐龍 打排球</h1>
            <p className="text-lg font-bold mb-4">我DUDEYEE小恐龍編啦，老闆說行銷要學會用AI輔助工作，我這不就來了。</p>
            <div
                ref={gameAreaRef}
                className="relative w-96 h-80 bg-blue-200 border-4 border-blue-500 cursor-none touch-none"
                onTouchStart={handleTouch}
                onTouchMove={handleTouch}
                onMouseMove={handleMouse}
            >
                <div className="absolute left-1/2 top-1/2 w-0.5 h-full bg-white transform -translate-x-1/2 -translate-y-1/2"></div>
                <div
                    className="absolute w-12 h-12 bg-red-500"
                    style={{ left: `${opponentX}px`, top: '0' }}
                ></div>
                <div
                    className="absolute w-8 h-8 bg-yellow-400 rounded-full"
                    style={{ left: `${ballX}px`, top: `${ballY}px` }}
                ></div>
                <div
                    className="absolute w-12 h-12 bg-yellow-500"
                    style={{ left: `${pikachuX}px`, bottom: '0' }}
                ></div>
            </div>
            <p className="mt-4 text-xl">分數: {score}</p>
            <p className="text-sm">速度: x{speedMultiplier.toFixed(1)}</p>
            {gameOver && (
                <div className="mt-4">
                    <a href="https://dudeyee.pitchat.co/zh-Hant" className="text-xl text-blue-600 dark:text-blue-500 hover:underline font-bold">休息一下，點我了解更多DUDEYEE杜得譯LINE翻譯服務喔：）</a>
                    <button
                        className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
                        onClick={resetGame}
                    >
                        再來一次
                    </button>
                </div>
            )}
        </div>
    );
};

export default PikachuVolleyball;
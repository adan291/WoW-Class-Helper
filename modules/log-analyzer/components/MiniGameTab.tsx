import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LogSummary, AIMiniGameConfig } from '../types';
import { generateMiniGameConfig } from '../services/geminiService';

interface Props {
  data: LogSummary;
}

interface GameObject {
  id: number;
  x: number;
  y: number;
  radius: number;
  type: 'player' | 'boss' | 'danger' | 'safe';
  color: string;
  createdAt: number;
  duration?: number;
}

const MiniGameTab: React.FC<Props> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [config, setConfig] = useState<AIMiniGameConfig | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(100);
  const [loading, setLoading] = useState(false);
  const [incomingMechanic, setIncomingMechanic] = useState<{
    name: string;
    type: string;
    color: string;
  } | null>(null);

  const playerPos = useRef({ x: 300, y: 300 });
  const keysPressed = useRef<Record<string, boolean>>({});
  const gameObjects = useRef<GameObject[]>([]);
  const lastFrameTime = useRef(0);
  const nextMechanicTime = useRef(0);
  const animationFrameId = useRef<number>(0);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const conf = await generateMiniGameConfig(data);
      setConfig(conf);
      setLoading(false);
    };
    init();
  }, [data]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  const update = useCallback(
    (dt: number, time: number) => {
      const speed = 0.3 * dt;
      if (keysPressed.current['w'] || keysPressed.current['ArrowUp']) playerPos.current.y -= speed;
      if (keysPressed.current['s'] || keysPressed.current['ArrowDown'])
        playerPos.current.y += speed;
      if (keysPressed.current['a'] || keysPressed.current['ArrowLeft'])
        playerPos.current.x -= speed;
      if (keysPressed.current['d'] || keysPressed.current['ArrowRight'])
        playerPos.current.x += speed;

      playerPos.current.x = Math.max(20, Math.min(580, playerPos.current.x));
      playerPos.current.y = Math.max(20, Math.min(580, playerPos.current.y));

      if (time > nextMechanicTime.current && config) {
        const mechanic = config.mechanics[Math.floor(Math.random() * config.mechanics.length)];
        const isSoak = mechanic.type === 'soak';

        setIncomingMechanic({ name: mechanic.name, type: mechanic.type, color: mechanic.color });
        setTimeout(() => setIncomingMechanic(null), 1500);

        const mx = 50 + Math.random() * 500;
        const my = 50 + Math.random() * 500;

        gameObjects.current.push({
          id: Math.random(),
          x: mx,
          y: my,
          radius: mechanic.radius,
          type: isSoak ? 'safe' : 'danger',
          color: mechanic.color,
          createdAt: time,
          duration: 2500,
        });

        nextMechanicTime.current = time + mechanic.interval;
      }

      gameObjects.current = gameObjects.current.filter((obj) => {
        if (obj.type === 'boss') return true;

        const age = time - obj.createdAt;
        if (obj.duration && age > obj.duration) {
          const dx = playerPos.current.x - obj.x;
          const dy = playerPos.current.y - obj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (obj.type === 'danger' && dist < obj.radius + 10) {
            setHp((prev) => Math.max(0, prev - 20));
          } else if (obj.type === 'safe') {
            if (dist > obj.radius) {
              setHp((prev) => Math.max(0, prev - 20));
            } else {
              setScore((prev) => prev + 100);
            }
          } else if (obj.type === 'danger' && dist >= obj.radius + 10) {
            setScore((prev) => prev + 50);
          }
          return false;
        }
        return true;
      });
    },
    [config]
  );

  const draw = useCallback((time: number) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f0f11';
    ctx.fillRect(0, 0, 600, 600);

    ctx.strokeStyle = '#1a1a20';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 600; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 600);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(600, i);
      ctx.stroke();
    }

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 596, 596);

    gameObjects.current.forEach((obj) => {
      if (obj.type === 'boss') {
        const pulse = (Math.sin(time / 200) + 1) / 2;
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5 * pulse;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius + 10 + pulse * 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.shadowBlur = 30;
        ctx.shadowColor = obj.color;
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = obj.color;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('BOSS', obj.x, obj.y);
      } else {
        const age = time - obj.createdAt;
        const progress = Math.min(1, age / (obj.duration || 2000));

        ctx.fillStyle = obj.color + '33';
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = obj.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius * progress, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    const px = playerPos.current.x;
    const py = playerPos.current.y;

    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ff00';
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(px, py, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px - 18, py);
    ctx.lineTo(px + 18, py);
    ctx.moveTo(px, py - 18);
    ctx.lineTo(px, py + 18);
    ctx.stroke();
  }, []);

  // Use refs for the game loop to avoid stale closures
  const updateRef = useRef(update);
  const drawRef = useRef(draw);

  useEffect(() => {
    updateRef.current = update;
    drawRef.current = draw;
  }, [update, draw]);

  // Game loop using refs to avoid self-reference issues
  const runGameLoop = useCallback(() => {
    const gameLoop = (time: number) => {
      if (!isPlayingRef.current) return;

      const dt = time - lastFrameTime.current;
      lastFrameTime.current = time;

      updateRef.current(dt, time);
      drawRef.current(time);

      animationFrameId.current = requestAnimationFrame(gameLoop);
    };
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, []);

  // Handle game over when hp reaches 0
  const handleGameOver = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
  }, []);

  // Check for game over condition
  useEffect(() => {
    if (hp <= 0 && isPlaying) {
      // Use setTimeout to avoid synchronous setState in effect
      const timeoutId = setTimeout(handleGameOver, 0);
      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [hp, isPlaying, handleGameOver]);

  const startGame = () => {
    if (!config) return;
    setScore(0);
    setHp(100);
    setIsPlaying(true);
    isPlayingRef.current = true;
    playerPos.current = { x: 300, y: 400 };
    gameObjects.current = [
      {
        id: -1,
        x: 300,
        y: 100,
        radius: 40,
        type: 'boss',
        color: '#f8b700',
        createdAt: 0,
      },
    ];
    lastFrameTime.current = performance.now();
    nextMechanicTime.current = performance.now() + 1000;

    cancelAnimationFrame(animationFrameId.current);
    runGameLoop();
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-1 flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            className="bg-gray-950 rounded cursor-crosshair"
          />

          {isPlaying && (
            <>
              <div className="absolute top-6 left-6 flex flex-col w-64 bg-black/80 p-3 rounded-lg border border-gray-700">
                <div className="flex justify-between items-end mb-2 text-white font-bold">
                  <span className="text-sm text-gray-400 uppercase">❤️ Player HP</span>
                  <span
                    className={`text-2xl ${hp < 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}
                  >
                    {Math.ceil(hp)}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden border border-gray-600">
                  <div
                    className={`h-full transition-all ${hp < 30 ? 'bg-red-600' : 'bg-gradient-to-r from-green-600 to-green-400'}`}
                    style={{ width: `${hp}%` }}
                  />
                </div>
              </div>

              <div className="absolute top-6 right-6 flex flex-col items-end bg-black/80 p-3 px-5 rounded-lg border border-gray-700">
                <span className="text-xs text-yellow-500 font-bold uppercase mb-1">🏆 Score</span>
                <span className="text-3xl font-mono text-white font-bold">
                  {score.toLocaleString()}
                </span>
              </div>
            </>
          )}

          {incomingMechanic && isPlaying && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 pointer-events-none">
              <span
                className="text-6xl font-black uppercase"
                style={{ color: incomingMechanic.color, WebkitTextStroke: '2px black' }}
              >
                {incomingMechanic.type === 'soak' ? 'SOAK!' : 'DODGE!'}
              </span>
              <div
                className="mt-2 bg-black/80 text-white px-6 py-2 rounded-full border-2"
                style={{ borderColor: incomingMechanic.color }}
              >
                <span className="text-xl font-bold">{incomingMechanic.name}</span>
              </div>
            </div>
          )}
        </div>

        {!isPlaying && hp > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
            <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700 text-center max-w-md">
              <span className="text-5xl mb-4 block">🛡️</span>
              <h3 className="text-2xl font-bold text-white mb-2">Ready Check</h3>
              <p className="text-gray-400 mb-8">
                Survive the mechanics of {data.encounterName}. Use WASD to move.
              </p>
              <button
                onClick={startGame}
                className="px-8 py-3 font-bold text-black bg-yellow-500 rounded-full hover:bg-yellow-400 transition-colors"
              >
                ▶️ Start Encounter
              </button>
            </div>
          </div>
        )}

        {hp <= 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 z-10">
            <span className="text-7xl mb-4">💀</span>
            <h3 className="text-6xl font-black text-white mb-2 uppercase">You Died</h3>
            <div className="bg-black/40 px-8 py-4 rounded-xl border border-red-900/50 mb-8 mt-4">
              <p className="text-3xl text-red-200 font-mono font-bold">
                🏆 Score: {score.toLocaleString()}
              </p>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200"
            >
              🔄 Release Spirit
            </button>
          </div>
        )}
      </div>

      <div className="w-full lg:w-80 bg-gray-900 border border-gray-700 rounded-xl p-6 flex flex-col">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 pb-4 border-b border-gray-800">
          🛡️ Dungeon Journal
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-gray-500 text-sm">Parsing encounter logic...</div>
          </div>
        ) : (
          <>
            <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2">
              {config?.mechanics.map((m, i) => (
                <div
                  key={i}
                  className="flex gap-3 text-sm text-gray-300 bg-gray-800 p-3 rounded-lg border border-gray-700"
                >
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-white/10 flex items-center justify-center font-bold text-xs text-black"
                    style={{ backgroundColor: m.color }}
                  >
                    {m.type === 'dodge' ? '!' : '✓'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-base">{m.name}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-mono mb-1">
                      {m.type}
                    </span>
                    <span className="text-xs text-gray-400">{m.description}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-6">
              <div className="p-4 bg-blue-900/10 rounded-lg border border-blue-900/30 text-xs text-blue-200">
                <p className="font-bold mb-2 text-blue-100 uppercase">🎯 Controls</p>
                <div className="flex gap-2 mb-2">
                  <span className="bg-blue-900/40 px-2 py-1 rounded border border-blue-800 font-mono text-white">
                    WASD
                  </span>
                  <span className="opacity-50">or</span>
                  <span className="bg-blue-900/40 px-2 py-1 rounded border border-blue-800 font-mono text-white">
                    Arrows
                  </span>
                </div>
                <p className="opacity-70">Avoid red zones. Stand in green zones.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MiniGameTab;

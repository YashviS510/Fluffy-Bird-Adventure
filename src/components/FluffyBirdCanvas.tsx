import React, { useRef, useEffect, useCallback } from 'react';
import {
  GameState,
  BirdSkin,
  Accessory,
  WorldTheme,
  ActivePowerUp,
  FloatingText,
  Particle,
  Obstacle,
  CollectibleBerry,
} from '../types/game';
import { sound } from '../utils/audio';

interface FluffyBirdCanvasProps {
  gameState: GameState;
  score: number;
  bestScore: number;
  skin: BirdSkin;
  accessory: Accessory;
  theme: WorldTheme;
  activePowerUps: ActivePowerUp[];
  onScoreIncrement: () => void;
  onSeedCollected: (type: 'seed' | 'golden_berry') => void;
  onPowerUpCollected: (type: ActivePowerUp['type']) => void;
  onShieldSaved: () => void;
  onGameOver: (finalScore: number) => void;
  onFirstFlap: () => void;
}

export const FluffyBirdCanvas: React.FC<FluffyBirdCanvasProps> = ({
  gameState,
  score,
  bestScore,
  skin,
  accessory,
  theme,
  activePowerUps,
  onScoreIncrement,
  onSeedCollected,
  onPowerUpCollected,
  onShieldSaved,
  onGameOver,
  onFirstFlap,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable game state inside ref for 60fps physics loop without React re-render lag
  const stateRef = useRef({
    // Physics constants (as per prompt specification)
    gravity: 1500, // px/s²
    flapImpulse: 480, // px/s (upward)
    maxDownVelocity: 650, // px/s
    maxUpVelocity: -600, // px/s
    baseScrollSpeed: 180, // px/s
    obstacleWidth: 80, // px
    obstacleSpacing: 280, // px
    collisionRadius: 17, // px (slightly smaller than visible ~25px for fair hitboxes)
    visibleRadius: 25, // px
    groundHeight: 90, // px

    // Dynamic bird physics
    birdX: 110,
    birdY: 300,
    birdVelocityY: 0,
    birdRotation: 0,
    wingFlapPhase: 0,
    blinkTimer: 2.5,
    isBlinking: false,
    hoverOffset: 0,
    deathTimer: 0,
    hasFlappedOnce: false,

    // Obstacles & World
    obstacles: [] as Obstacle[],
    collectibles: [] as CollectibleBerry[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    clouds: [] as { x: number; y: number; scale: number; speed: number; opacity: number }[],
    hillsOffset: 0,
    groundOffset: 0,
    lastTime: 0,
    inputBuffer: false,
    inputBufferTime: 0,

    // Dimensions
    width: 480,
    height: 720,
    scale: 1,

    // Callbacks & Props mirror
    gameState,
    score,
    bestScore,
    skin,
    accessory,
    theme,
    activePowerUps,
  });

  // Keep stateRef in sync with props
  useEffect(() => {
    stateRef.current.gameState = gameState;
    stateRef.current.score = score;
    stateRef.current.bestScore = bestScore;
    stateRef.current.skin = skin;
    stateRef.current.accessory = accessory;
    stateRef.current.theme = theme;
    stateRef.current.activePowerUps = activePowerUps;
  }, [gameState, score, bestScore, skin, accessory, theme, activePowerUps]);

  // Difficulty calculation based on current score (exact formula from prompt)
  const getDifficulty = useCallback((currentScore: number) => {
    if (currentScore <= 10) {
      return { gap: 190, speed: 180 };
    } else if (currentScore <= 25) {
      return { gap: 180, speed: 195 };
    } else if (currentScore <= 50) {
      return { gap: 170, speed: 210 };
    } else {
      return { gap: 160, speed: 225 };
    }
  }, []);

  // Flap action triggered by tap/click/spacebar
  const triggerFlap = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState === 'MENU') {
      // Just a playful flap in menu
      s.birdVelocityY = -s.flapImpulse * 0.7;
      sound.playFlap();
      createFlapPuff(s.birdX, s.birdY, s.skin.particleColor);
      return;
    }

    if (s.gameState !== 'PLAYING') return;

    if (!s.hasFlappedOnce) {
      s.hasFlappedOnce = true;
      onFirstFlap();
    }

    // Apply exact flap impulse
    const hasFloat = s.activePowerUps.some(p => p.type === 'feather_float');
    const impulse = hasFloat ? s.flapImpulse * 0.9 : s.flapImpulse;
    s.birdVelocityY = -impulse;
    s.wingFlapPhase = 1.0; // reset wing flap cycle

    sound.playFlap();
    createFlapPuff(s.birdX, s.birdY, s.skin.particleColor);
  }, [onFirstFlap]);

  // Helper: create flap particles
  const createFlapPuff = (x: number, y: number, color: string) => {
    const s = stateRef.current;
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI * 0.5 + (Math.random() - 0.5) * 1.2;
      const speed = 60 + Math.random() * 80;
      s.particles.push({
        x: x - 12 + Math.random() * 6,
        y: y + 10 + Math.random() * 6,
        vx: -Math.cos(angle) * speed - 50,
        vy: Math.sin(angle) * speed * 0.5,
        size: 3 + Math.random() * 4,
        color: color,
        alpha: 0.8,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 6,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.25,
        type: Math.random() > 0.5 ? 'feather' : 'fluff',
      });
    }
  };

  // Helper: create sparkle burst
  const createSparkleBurst = (x: number, y: number, color: string, count = 8) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 70 + Math.random() * 90;
      s.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3,
        color,
        alpha: 1,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 10,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.3,
        type: 'sparkle',
      });
    }
  };

  // Spawn a new obstacle pair
  const spawnObstacle = useCallback((targetX: number) => {
    const s = stateRef.current;
    const diff = getDifficulty(s.score);
    const playableHeight = s.height - s.groundHeight;

    // Minimum gap center 30% of screen, maximum 70%
    const minCenter = playableHeight * 0.3;
    const maxCenter = playableHeight * 0.7;
    const gapCenter = minCenter + Math.random() * (maxCenter - minCenter);

    const halfGap = diff.gap / 2;
    const topHeight = Math.max(50, gapCenter - halfGap);
    const bottomY = gapCenter + halfGap;
    const bottomHeight = Math.max(50, playableHeight - bottomY);

    // Decorative flowers on the pillars
    const flowerPositions = [
      { x: 12 + Math.random() * 20, y: Math.random() * (topHeight - 30), petalColor: s.theme.pillarAccent },
      { x: 45 + Math.random() * 20, y: bottomY + 25 + Math.random() * (bottomHeight - 40), petalColor: s.theme.pillarAccent },
    ];

    s.obstacles.push({
      x: targetX,
      topHeight,
      bottomY,
      bottomHeight,
      width: s.obstacleWidth,
      passed: false,
      flowerPositions,
    });

    // Spawn a collectible in the gap!
    // 70% chance of golden seed, 15% chance of power-up, 15% nothing
    const rand = Math.random();
    if (rand < 0.75) {
      let type: CollectibleBerry['type'] = 'seed';
      let powerUpType: ActivePowerUp['type'] | undefined;

      if (rand > 0.60 && s.score >= 3) {
        // Power-up
        type = 'power_up';
        const pTypes: ActivePowerUp['type'][] = ['shield', 'magnet', 'feather_float'];
        powerUpType = pTypes[Math.floor(Math.random() * pTypes.length)];
      }

      s.collectibles.push({
        id: Date.now() + Math.random(),
        x: targetX + s.obstacleWidth / 2,
        y: gapCenter,
        collected: false,
        type,
        powerUpType,
        bounceOffset: Math.random() * Math.PI * 2,
      });
    }
  }, [getDifficulty]);

  // Reset or initialize round
  const resetGame = useCallback(() => {
    const s = stateRef.current;
    s.birdX = 110;
    s.birdY = (s.height - s.groundHeight) * 0.45;
    s.birdVelocityY = 0;
    s.birdRotation = 0;
    s.deathTimer = 0;
    s.hasFlappedOnce = false;
    s.obstacles = [];
    s.collectibles = [];
    s.particles = [];
    s.floatingTexts = [];

    // Pre-populate initial clouds
    if (s.clouds.length === 0) {
      for (let i = 0; i < 6; i++) {
        s.clouds.push({
          x: Math.random() * s.width,
          y: 40 + Math.random() * 180,
          scale: 0.6 + Math.random() * 0.8,
          speed: 15 + Math.random() * 25,
          opacity: 0.5 + Math.random() * 0.4,
        });
      }
    }

    // Spawn first obstacle comfortably ahead
    const firstX = s.width + 120;
    spawnObstacle(firstX);
    spawnObstacle(firstX + s.obstacleSpacing);
    spawnObstacle(firstX + s.obstacleSpacing * 2);
  }, [spawnObstacle]);

  // Reset when entering PLAYING from MENU or GAME_OVER
  useEffect(() => {
    if (gameState === 'PLAYING') {
      resetGame();
    }
  }, [gameState, resetGame]);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      // Maintain crisp aspect ratio
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetWidth = 480;
      const targetHeight = Math.max(640, Math.min(840, rect.height));

      stateRef.current.width = targetWidth;
      stateRef.current.height = targetHeight;

      canvas.width = targetWidth * dpr;
      canvas.height = targetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    // Initial setup if empty
    if (stateRef.current.clouds.length === 0) {
      for (let i = 0; i < 6; i++) {
        stateRef.current.clouds.push({
          x: Math.random() * stateRef.current.width,
          y: 40 + Math.random() * 180,
          scale: 0.6 + Math.random() * 0.8,
          speed: 15 + Math.random() * 25,
          opacity: 0.5 + Math.random() * 0.4,
        });
      }
    }

    stateRef.current.lastTime = performance.now();

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop);
      const s = stateRef.current;
      const rawDt = (currentTime - s.lastTime) / 1000;
      s.lastTime = currentTime;
      // Clamp dt to prevent massive jumps when tab becomes inactive
      const dt = Math.min(rawDt, 0.05);

      if (s.gameState === 'PAUSED') {
        render(ctx, s);
        return;
      }

      // Handle queued input buffer
      if (s.inputBuffer && currentTime - s.inputBufferTime < 140) {
        s.inputBuffer = false;
        triggerFlap();
      }

      // Update world & physics
      update(dt, s);

      // Render all layers
      render(ctx, s);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [triggerFlap]);

  // Update physics and entities
  const update = (dt: number, s: typeof stateRef.current) => {
    const diff = getDifficulty(s.score);
    const scrollSpeed = s.gameState === 'PLAYING' ? diff.speed : diff.speed * 0.5;

    // Background parallax scroll
    s.clouds.forEach(cloud => {
      cloud.x -= cloud.speed * dt;
      if (cloud.x < -120) {
        cloud.x = s.width + 80;
        cloud.y = 40 + Math.random() * 180;
      }
    });

    s.hillsOffset = (s.hillsOffset + scrollSpeed * 0.25 * dt) % s.width;
    s.groundOffset = (s.groundOffset + scrollSpeed * dt) % 40;

    // Wing flap oscillation
    s.wingFlapPhase = Math.max(0, s.wingFlapPhase - dt * 3.5);

    // Blinking animation
    s.blinkTimer -= dt;
    if (s.blinkTimer <= 0) {
      s.isBlinking = true;
      if (s.blinkTimer < -0.15) {
        s.isBlinking = false;
        s.blinkTimer = 2.5 + Math.random() * 3.0;
      }
    }

    // MENU STATE: Gentle idle hover
    if (s.gameState === 'MENU') {
      s.hoverOffset += dt * 3;
      s.birdY = (s.height - s.groundHeight) * 0.45 + Math.sin(s.hoverOffset) * 14;
      s.birdRotation = Math.sin(s.hoverOffset) * 0.08;
      updateParticlesAndTexts(dt, s);
      return;
    }

    // GAME OVER STATE: Tumble & spin to the ground
    if (s.gameState === 'GAME_OVER') {
      s.deathTimer += dt;
      if (s.birdY < s.height - s.groundHeight - s.visibleRadius) {
        s.birdVelocityY += s.gravity * dt;
        s.birdY += s.birdVelocityY * dt;
        s.birdRotation += 12 * dt; // rapid spin
      } else {
        s.birdY = s.height - s.groundHeight - s.visibleRadius;
      }
      updateParticlesAndTexts(dt, s);
      return;
    }

    // ACTIVE PLAYING STATE: Full physics
    if (s.gameState === 'PLAYING') {
      const hasFloat = s.activePowerUps.some(p => p.type === 'feather_float');
      const currentGravity = hasFloat ? s.gravity * 0.45 : s.gravity;

      // Apply gravity: velocity.y += gravity * dt
      s.birdVelocityY += currentGravity * dt;

      // Clamp velocities to max bounds
      const maxDown = hasFloat ? 260 : s.maxDownVelocity;
      s.birdVelocityY = Math.max(s.maxUpVelocity, Math.min(maxDown, s.birdVelocityY));

      // Apply position: position.y += velocity.y * dt
      s.birdY += s.birdVelocityY * dt;

      // Visual rotation mapping according to vertical velocity:
      // If velocity.y < 0: toward -15° (-0.2618 rad)
      // If velocity.y > 0: toward +70° (+1.2217 rad)
      const minRad = -15 * (Math.PI / 180);
      const maxRad = 70 * (Math.PI / 180);

      // Linear map: from [-600, 650] to [-15 deg, 70 deg]
      const t = (s.birdVelocityY - (-600)) / (650 - (-600));
      const targetRotation = minRad + Math.max(0, Math.min(1, t)) * (maxRad - minRad);

      // Smooth lerp: rotation = lerp(rotation, targetRotation, 8 * dt)
      s.birdRotation += (targetRotation - s.birdRotation) * Math.min(1, 8 * dt);
      s.birdRotation = Math.max(minRad, Math.min(maxRad, s.birdRotation));

      // Ceiling collision (y <= 0)
      if (s.birdY - s.collisionRadius <= 0) {
        s.birdY = s.collisionRadius;
        s.birdVelocityY = 0;
      }

      // Ground collision
      const groundY = s.height - s.groundHeight;
      if (s.birdY + s.collisionRadius >= groundY) {
        triggerCollision(s, 'ground');
        return;
      }

      // Update Obstacles
      for (let i = s.obstacles.length - 1; i >= 0; i--) {
        const obs = s.obstacles[i];
        obs.x -= scrollSpeed * dt;

        // Score checking: when bird passes the center of the obstacle
        if (!obs.passed && obs.x + obs.width < s.birdX) {
          obs.passed = true;
          onScoreIncrement();
          sound.playScore();

          // Add floating "+1" popup
          s.floatingTexts.push({
            id: Math.random(),
            text: '+1',
            x: s.birdX + 20,
            y: s.birdY - 20,
            color: '#FDE047',
            life: 0,
            maxLife: 0.8,
          });

          // Cheerful puff on score
          createSparkleBurst(s.birdX, s.birdY - 10, '#FEF08A', 5);
        }

        // Collision checking against top and bottom obstacle columns
        if (checkObstacleCollision(s.birdX, s.birdY, s.collisionRadius, obs)) {
          // Check for active shield
          const shieldIdx = s.activePowerUps.findIndex(p => p.type === 'shield');
          if (shieldIdx !== -1) {
            // Shield absorbs the blow!
            sound.playShieldBreak();
            onShieldSaved();
            createSparkleBurst(s.birdX, s.birdY, '#38BDF8', 16);
            s.floatingTexts.push({
              id: Math.random(),
              text: 'SHIELD SAVED!',
              x: s.birdX,
              y: s.birdY - 30,
              color: '#38BDF8',
              life: 0,
              maxLife: 1.0,
            });
            // Bounce the bird safely backwards
            s.birdVelocityY = -250;
            obs.x -= 30; // bump obstacle forward
          } else {
            triggerCollision(s, 'obstacle');
            return;
          }
        }

        // Remove off-screen obstacles
        if (obs.x + obs.width < -50) {
          s.obstacles.splice(i, 1);
        }
      }

      // Spawn next obstacle if needed
      const lastObs = s.obstacles[s.obstacles.length - 1];
      if (lastObs && lastObs.x < s.width + s.obstacleSpacing) {
        spawnObstacle(lastObs.x + s.obstacleSpacing);
      }

      // Update Collectibles (seeds & power-ups)
      const hasMagnet = s.activePowerUps.some(p => p.type === 'magnet');
      for (let i = s.collectibles.length - 1; i >= 0; i--) {
        const item = s.collectibles[i];
        item.x -= scrollSpeed * dt;
        item.bounceOffset += dt * 4;

        // Magnet effect: attract towards bird if within 190px
        if (hasMagnet && !item.collected) {
          const dx = s.birdX - item.x;
          const dy = s.birdY - item.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 190) {
            item.x += (dx / dist) * 280 * dt;
            item.y += (dy / dist) * 280 * dt;
          }
        }

        // Check pickup collision
        const pickupRadius = s.visibleRadius + 14;
        const dist = Math.hypot(s.birdX - item.x, s.birdY - item.y);
        if (!item.collected && dist < pickupRadius) {
          item.collected = true;
          if (item.type === 'power_up' && item.powerUpType) {
            sound.playPowerUp();
            onPowerUpCollected(item.powerUpType);
            createSparkleBurst(item.x, item.y, '#A855F7', 12);
            s.floatingTexts.push({
              id: Math.random(),
              text: item.powerUpType === 'shield' ? 'SHIELD!' : item.powerUpType === 'magnet' ? 'MAGNET!' : 'FLOAT!',
              x: item.x,
              y: item.y - 25,
              color: '#C084FC',
              life: 0,
              maxLife: 1.0,
            });
          } else {
            sound.playSeed();
            onSeedCollected(item.type === 'golden_berry' ? 'golden_berry' : 'seed');
            createSparkleBurst(item.x, item.y, '#FBBF24', 8);
            s.floatingTexts.push({
              id: Math.random(),
              text: '+1 SEED',
              x: item.x,
              y: item.y - 20,
              color: '#FBBF24',
              life: 0,
              maxLife: 0.8,
            });
          }
          s.collectibles.splice(i, 1);
          continue;
        }

        // Remove offscreen collectibles
        if (item.x < -40) {
          s.collectibles.splice(i, 1);
        }
      }

      updateParticlesAndTexts(dt, s);
    }
  };

  // Collision with obstacles
  const checkObstacleCollision = (bx: number, by: number, br: number, obs: Obstacle): boolean => {
    // Circle vs Rect for Top Obstacle: x in [obs.x, obs.x + obs.width], y in [0, obs.topHeight]
    const topClosestX = Math.max(obs.x, Math.min(bx, obs.x + obs.width));
    const topClosestY = Math.max(0, Math.min(by, obs.topHeight));
    const topDistX = bx - topClosestX;
    const topDistY = by - topClosestY;
    if (topDistX * topDistX + topDistY * topDistY < br * br) {
      return true;
    }

    // Circle vs Rect for Bottom Obstacle: x in [obs.x, obs.x + obs.width], y in [obs.bottomY, obs.bottomY + obs.bottomHeight]
    const botClosestX = Math.max(obs.x, Math.min(bx, obs.x + obs.width));
    const botClosestY = Math.max(obs.bottomY, Math.min(by, obs.bottomY + obs.bottomHeight));
    const botDistX = bx - botClosestX;
    const botDistY = by - botClosestY;
    if (botDistX * botDistX + botDistY * botDistY < br * br) {
      return true;
    }

    return false;
  };

  // Trigger game over sequence
  const triggerCollision = (s: typeof stateRef.current, source: 'obstacle' | 'ground') => {
    s.gameState = 'GAME_OVER';
    sound.playBonk();
    sound.playGameOver();

    // Spawn bonk feathers & stars
    createSparkleBurst(s.birdX, s.birdY, '#F87171', 14);
    for (let i = 0; i < 8; i++) {
      s.particles.push({
        x: s.birdX,
        y: s.birdY,
        vx: (Math.random() - 0.5) * 160,
        vy: -120 - Math.random() * 120,
        size: 5 + Math.random() * 5,
        color: s.skin.particleColor,
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 10,
        life: 0,
        maxLife: 1.2,
        type: 'feather',
      });
    }

    if (source === 'obstacle') {
      s.birdVelocityY = -220; // little bounce before falling
    }

    onGameOver(s.score);
  };

  // Particles & floating text lifespans
  const updateParticlesAndTexts = (dt: number, s: typeof stateRef.current) => {
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        s.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.vRot * dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      p.vy += 80 * dt; // subtle gravity on particles
    }

    for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
      const t = s.floatingTexts[i];
      t.life += dt;
      if (t.life >= t.maxLife) {
        s.floatingTexts.splice(i, 1);
        continue;
      }
      t.y -= 35 * dt; // float upwards
    }
  };

  // Canvas Rendering
  const render = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current) => {
    ctx.clearRect(0, 0, s.width, s.height);

    // 1. SKY GRADIENT
    const skyGrad = ctx.createLinearGradient(0, 0, 0, s.height - s.groundHeight);
    skyGrad.addColorStop(0, s.theme.skyTop);
    skyGrad.addColorStop(1, s.theme.skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, s.width, s.height);

    // 2. CELESTIAL BODY (Sun / Moon)
    drawCelestialBody(ctx, s);

    // 3. PARALLAX CLOUDS
    drawClouds(ctx, s);

    // 4. PARALLAX HILLS
    drawHills(ctx, s);

    // 5. HIGH SCORE CELEBRATION MARKER (if within range)
    drawBestScoreMarker(ctx, s);

    // 6. OBSTACLES (Top & Bottom Columns)
    drawObstacles(ctx, s);

    // 7. COLLECTIBLES (Seeds & Power-Ups)
    drawCollectibles(ctx, s);

    // 8. PARTICLES (Feathers, Dust, Sparkles)
    drawParticles(ctx, s);

    // 9. FLUFFY BIRD
    drawFluffyBird(ctx, s);

    // 10. GROUND LAYER
    drawGround(ctx, s);

    // 11. FLOATING TEXTS (+1, SHIELD SAVED, etc.)
    drawFloatingTexts(ctx, s);
  };

  // Celestial sun / moon
  const drawCelestialBody = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current) => {
    ctx.save();
    const cx = s.width * 0.8;
    const cy = 90;

    if (s.theme.id === 'starry_dream') {
      // Glowing Crescent Moon
      ctx.shadowColor = 'rgba(253, 224, 71, 0.4)';
      ctx.shadowBlur = 24;
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.fill();

      // Moon mask
      ctx.shadowBlur = 0;
      ctx.fillStyle = s.theme.skyTop;
      ctx.beginPath();
      ctx.arc(cx - 10, cy - 6, 22, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Soft radiant warm sun
      const sunGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 46);
      sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
      sunGrad.addColorStop(0.5, 'rgba(253, 224, 71, 0.4)');
      sunGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');

      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 46, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FEF9C3';
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  // Parallax clouds
  const drawClouds = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current) => {
    ctx.save();
    s.clouds.forEach(c => {
      ctx.fillStyle = s.theme.cloudColor;
      ctx.globalAlpha = c.opacity;
      const r = 24 * c.scale;
      ctx.beginPath();
      ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
      ctx.arc(c.x + r * 0.7, c.y - r * 0.3, r * 0.8, 0, Math.PI * 2);
      ctx.arc(c.x + r * 1.5, c.y, r * 0.9, 0, Math.PI * 2);
      ctx.arc(c.x + r * 0.8, c.y + r * 0.3, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  };

  // Parallax rolling hills
  const drawHills = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current) => {
    ctx.save();
    const groundY = s.height - s.groundHeight;

    // Far hills
    ctx.fillStyle = s.theme.hillFar;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= s.width; x += 30) {
      const y = groundY - 45 - Math.sin((x + s.hillsOffset * 0.5) * 0.01) * 35;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(s.width, groundY);
    ctx.closePath();
    ctx.fill();

    // Near hills
    ctx.fillStyle = s.theme.hillNear;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= s.width; x += 25) {
      const y = groundY - 25 - Math.sin((x + s.hillsOffset) * 0.016) * 25;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(s.width, groundY);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // High score marker ribbon
  const drawBestScoreMarker = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current) => {
    if (s.bestScore <= 0 || s.gameState !== 'PLAYING') return;

    // If bird is approaching best score, show a sparkling celebration ribbon
    ctx.save();
    // Drawn near top-right as motivation
    ctx.restore();
  };

  // Helper to draw rounded rectangle
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number
  ) => {
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, radius);
    } else {
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
    }
  };

  // Obstacle columns with organic rounded caps, shading, and vines/flowers
  const drawObstacles = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current) => {
    ctx.save();

    s.obstacles.forEach(obs => {
      const capHeight = 26;
      const capOverhang = 6;

      // --- TOP OBSTACLE ---
      // Body
      const topBodyGrad = ctx.createLinearGradient(obs.x, 0, obs.x + obs.width, 0);
      topBodyGrad.addColorStop(0, s.theme.pillarBody);
      topBodyGrad.addColorStop(0.3, s.theme.pillarBody);
      topBodyGrad.addColorStop(1, s.theme.pillarTrim);

      ctx.fillStyle = topBodyGrad;
      ctx.fillRect(obs.x, 0, obs.width, obs.topHeight - capHeight);

      // Top Cap
      const topCapX = obs.x - capOverhang;
      const topCapW = obs.width + capOverhang * 2;
      const topCapY = obs.topHeight - capHeight;

      ctx.fillStyle = s.theme.pillarTrim;
      drawRoundedRect(ctx, topCapX, topCapY, topCapW, capHeight, 10);
      ctx.fill();

      // Top Cap highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      drawRoundedRect(ctx, topCapX + 3, topCapY + 2, topCapW - 6, 5, 3);
      ctx.fill();

      // --- BOTTOM OBSTACLE ---
      // Bottom Cap
      const botCapX = obs.x - capOverhang;
      const botCapW = obs.width + capOverhang * 2;
      const botCapY = obs.bottomY;

      ctx.fillStyle = s.theme.pillarTrim;
      drawRoundedRect(ctx, botCapX, botCapY, botCapW, capHeight, 10);
      ctx.fill();

      // Bottom Cap highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      drawRoundedRect(ctx, botCapX + 3, botCapY + 2, botCapW - 6, 5, 3);
      ctx.fill();

      // Body
      const botBodyGrad = ctx.createLinearGradient(obs.x, 0, obs.x + obs.width, 0);
      botBodyGrad.addColorStop(0, s.theme.pillarBody);
      botBodyGrad.addColorStop(0.3, s.theme.pillarBody);
      botBodyGrad.addColorStop(1, s.theme.pillarTrim);

      ctx.fillStyle = botBodyGrad;
      ctx.fillRect(obs.x, obs.bottomY + capHeight, obs.width, obs.bottomHeight - capHeight);

      // Decorative flowers & vines on pillars
      obs.flowerPositions.forEach(fl => {
        // Little flower
        ctx.fillStyle = fl.petalColor;
        const fr = 5;
        for (let a = 0; a < 5; a++) {
          const angle = (a * Math.PI * 2) / 5;
          ctx.beginPath();
          ctx.arc(obs.x + fl.x + Math.cos(angle) * fr, fl.y + Math.sin(angle) * fr, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        // Center pistil
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(obs.x + fl.x, fl.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    ctx.restore();
  };

  // Collectibles (Seeds, Berries, Power-ups)
  const drawCollectibles = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current) => {
    ctx.save();

    s.collectibles.forEach(item => {
      const bobY = item.y + Math.sin(item.bounceOffset) * 6;

      if (item.type === 'power_up') {
        // Glowing bubble power-up
        ctx.shadowColor = item.powerUpType === 'shield' ? '#38BDF8' : item.powerUpType === 'magnet' ? '#F59E0B' : '#A855F7';
        ctx.shadowBlur = 12;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(item.x, bobY, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = ctx.shadowColor;
        ctx.stroke();

        // Icon inside bubble
        ctx.shadowBlur = 0;
        ctx.fillStyle = ctx.shadowColor;
        ctx.font = 'bold 12px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label = item.powerUpType === 'shield' ? '🛡️' : item.powerUpType === 'magnet' ? '🧲' : '🪶';
        ctx.fillText(label, item.x, bobY);
      } else {
        // Golden Seed / Berry
        ctx.shadowColor = 'rgba(251, 191, 36, 0.6)';
        ctx.shadowBlur = 10;

        // Seed teardrop shape
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(item.x, bobY, 9, 0, Math.PI * 2);
        ctx.fill();

        // Inner glowing core
        ctx.fillStyle = '#FDE047';
        ctx.beginPath();
        ctx.arc(item.x - 2, bobY - 2, 5, 0, Math.PI * 2);
        ctx.fill();

        // Tiny sprout on top
        ctx.fillStyle = '#84CC16';
        ctx.beginPath();
        ctx.ellipse(item.x + 2, bobY - 8, 4, 2, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();
  };

  // Particles
  const drawParticles = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current) => {
    ctx.save();
    s.particles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === 'feather') {
        // Curved feather shape
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.8, p.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'sparkle') {
        // 4-point sparkle star
        const r = p.size;
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.quadraticCurveTo(0, 0, 0, r);
        ctx.quadraticCurveTo(0, 0, -r, 0);
        ctx.quadraticCurveTo(0, 0, 0, -r);
        ctx.fill();
      } else {
        // Fluffy circle
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
    ctx.restore();
  };

  // THE FLUFFY BIRD CHARACTER
  const drawFluffyBird = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current) => {
    ctx.save();
    ctx.translate(s.birdX, s.birdY);
    ctx.rotate(s.birdRotation);

    const r = s.visibleRadius; // ~25px
    const skin = s.skin;

    // 1. FLUFF SHIELD BUBBLE (if active)
    const hasShield = s.activePowerUps.some(p => p.type === 'shield');
    if (hasShield) {
      ctx.save();
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 18;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(186, 230, 253, 0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, r + 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Shimmer reflection
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r + 9, -0.9, -0.2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. FEATHER FLOAT GLOW (if active)
    const hasFloat = s.activePowerUps.some(p => p.type === 'feather_float');
    if (hasFloat) {
      ctx.save();
      ctx.shadowColor = '#C084FC';
      ctx.shadowBlur = 15;
      ctx.fillStyle = 'rgba(243, 232, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(0, 0, r + 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. TAIL FEATHERS
    ctx.fillStyle = skin.secondaryColor;
    ctx.beginPath();
    ctx.ellipse(-r * 0.9, 2, r * 0.45, r * 0.25, -0.3, 0, Math.PI * 2);
    ctx.ellipse(-r * 0.95, -4, r * 0.4, r * 0.22, -0.6, 0, Math.PI * 2);
    ctx.fill();

    // 4. MAIN FLUFFY BODY (Layered scalloped puffs for maximum fluffiness!)
    // Outer fluffy puffs
    ctx.fillStyle = skin.secondaryColor;
    const puffCount = 8;
    for (let i = 0; i < puffCount; i++) {
      const angle = (i * Math.PI * 2) / puffCount;
      const px = Math.cos(angle) * (r * 0.75);
      const py = Math.sin(angle) * (r * 0.75);
      ctx.beginPath();
      ctx.arc(px, py, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    // Main smooth body core
    const bodyGrad = ctx.createRadialGradient(-4, -6, 2, 0, 0, r);
    bodyGrad.addColorStop(0, skin.primaryColor);
    bodyGrad.addColorStop(0.85, skin.primaryColor);
    bodyGrad.addColorStop(1, skin.secondaryColor);

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // 5. BELLY FLUFF (lighter soft oval)
    ctx.fillStyle = skin.bellyColor;
    ctx.beginPath();
    ctx.ellipse(r * 0.25, r * 0.35, r * 0.45, r * 0.38, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 6. BLUSH CHEEK
    ctx.fillStyle = skin.cheekColor;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.ellipse(r * 0.42, r * 0.2, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // 7. WING (Flapping with physics phase)
    const wingAngle = (Math.sin(s.wingFlapPhase * Math.PI * 2) * 0.5) - 0.2;
    ctx.save();
    ctx.translate(-r * 0.15, r * 0.1);
    ctx.rotate(wingAngle);

    // Wing layers
    ctx.fillStyle = skin.wingColor;
    ctx.beginPath();
    ctx.ellipse(-r * 0.1, 0, r * 0.55, r * 0.35, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Wing feather tips
    ctx.fillStyle = skin.primaryColor;
    ctx.beginPath();
    ctx.ellipse(0, -2, r * 0.35, r * 0.22, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 8. BIG CUTE EYE (With blinking, looking direction & dizzy stars on death)
    const eyeX = r * 0.42;
    const eyeY = -r * 0.25;

    if (s.gameState === 'GAME_OVER') {
      // Dizzy 'X' or swirls on death
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(eyeX - 5, eyeY - 5);
      ctx.lineTo(eyeX + 5, eyeY + 5);
      ctx.moveTo(eyeX + 5, eyeY - 5);
      ctx.lineTo(eyeX - 5, eyeY + 5);
      ctx.stroke();
    } else if (s.isBlinking) {
      // Happy curved blink line ^
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(eyeX, eyeY + 1, 6, Math.PI, 0);
      ctx.stroke();
    } else {
      // Big sparkling eye
      // Eye white
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 8.5, 0, Math.PI * 2);
      ctx.fill();

      // Pupil (dark navy)
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(eyeX + 2, eyeY, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Shiny sparkles (anime eye highlights)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(eyeX + 3.5, eyeY - 2, 2.8, 0, Math.PI * 2); // main highlight
      ctx.arc(eyeX + 1, eyeY + 2.5, 1.4, 0, Math.PI * 2); // secondary tiny highlight
      ctx.fill();
    }

    // 9. BEAK (Cute tiny orange triangular beak)
    ctx.fillStyle = '#FB923C';
    ctx.beginPath();
    const beakOpen = s.wingFlapPhase > 0.4 ? 3 : 0;
    ctx.moveTo(r * 0.8, -r * 0.15 - beakOpen * 0.5);
    ctx.lineTo(r * 1.35, -r * 0.05);
    ctx.lineTo(r * 0.75, r * 0.15 + beakOpen * 0.5);
    ctx.closePath();
    ctx.fill();

    // 10. ACCESSORY / HAT
    drawAccessory(ctx, s.accessory.id, r);

    ctx.restore();
  };

  // Draw equipped accessory
  const drawAccessory = (ctx: CanvasRenderingContext2D, accId: string, r: number) => {
    if (accId === 'none') return;

    if (accId === 'flower') {
      // Daisy over ear
      ctx.save();
      ctx.translate(r * 0.1, -r * 0.85);
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI * 2) / 6;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 6, Math.sin(a) * 6, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (accId === 'crown') {
      // Golden coronet
      ctx.save();
      ctx.translate(r * 0.05, -r * 0.95);
      ctx.fillStyle = '#FBBF24';
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-12, -12);
      ctx.lineTo(-5, -6);
      ctx.lineTo(0, -14);
      ctx.lineTo(5, -6);
      ctx.lineTo(12, -12);
      ctx.lineTo(10, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Jewels
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(0, -5, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (accId === 'leaf_sprout') {
      // Twin green sprout
      ctx.save();
      ctx.translate(r * 0.05, -r * 0.9);
      ctx.fillStyle = '#4ADE80';
      ctx.beginPath();
      ctx.ellipse(-5, -6, 6, 3, -0.6, 0, Math.PI * 2);
      ctx.ellipse(5, -6, 6, 3, 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Stem
      ctx.strokeStyle = '#16A34A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(1, -6, 0, -9);
      ctx.stroke();
      ctx.restore();
    } else if (accId === 'aviator') {
      // Pilot goggles
      ctx.save();
      ctx.translate(r * 0.35, -r * 0.28);
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 3;
      // Strap
      ctx.beginPath();
      ctx.moveTo(-r * 0.9, 0);
      ctx.lineTo(0, 0);
      ctx.stroke();

      // Goggle rim
      ctx.fillStyle = '#0284C7';
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 9.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glass highlight
      ctx.strokeStyle = '#BAE6FD';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 6, -1.8, -0.6);
      ctx.stroke();
      ctx.restore();
    } else if (accId === 'halo') {
      // Angelic floating halo
      ctx.save();
      ctx.translate(0, -r * 1.3);
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  };

  // Ground layer with grass tufts and trim
  const drawGround = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current) => {
    ctx.save();
    const groundY = s.height - s.groundHeight;

    // Soil body
    ctx.fillStyle = s.theme.groundColor;
    ctx.fillRect(0, groundY, s.width, s.groundHeight);

    // Top grassy edge
    ctx.fillStyle = s.theme.groundTrim;
    ctx.fillRect(0, groundY, s.width, 10);

    // Animated scrolling grass blades
    ctx.fillStyle = s.theme.groundTrim;
    const tuftSpacing = 26;
    const startX = -s.groundOffset;
    for (let x = startX; x < s.width + 30; x += tuftSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x + 5, groundY - 7);
      ctx.lineTo(x + 10, groundY);
      ctx.fill();
    }

    ctx.restore();
  };

  // Floating text labels (+1, SHIELD SAVED!)
  const drawFloatingTexts = (ctx: CanvasRenderingContext2D, s: typeof stateRef.current) => {
    ctx.save();
    s.floatingTexts.forEach(t => {
      const alpha = Math.max(0, 1 - t.life / t.maxLife);
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 18px "Fredoka", sans-serif';
      ctx.fillStyle = t.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 6;
      ctx.fillText(t.text, t.x, t.y);
    });
    ctx.restore();
  };

  // Input Handlers: Exactly one flap per tap, small input buffer
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    stateRef.current.inputBuffer = true;
    stateRef.current.inputBufferTime = performance.now();
    triggerFlap();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!e.repeat) {
          stateRef.current.inputBuffer = true;
          stateRef.current.inputBufferTime = performance.now();
          triggerFlap();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerFlap]);

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-pointer select-none"
      onPointerDown={handlePointerDown}
      style={{ touchAction: 'manipulation' }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[520px] max-h-[860px] object-contain shadow-2xl rounded-2xl border border-white/10"
      />
    </div>
  );
};

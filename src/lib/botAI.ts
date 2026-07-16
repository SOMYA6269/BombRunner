// Bot AI — drives bot players toward/away from bomb holder
import type { LocalPlayer, LocalGameState } from './gameStore';
import { PLAYER_SPEED, BOT_SPEED_MULTIPLIER, BOMB_PASS_RADIUS, MAP_WIDTH, MAP_HEIGHT } from '../game/constants';
import { resolveCollisions, clampToMap } from '../game/collisionUtils';
import { COLLISION_RECTS } from '../game/mapData';
import { distanceSq } from '../game/gameLogic';

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

export function updateBotPlayer(
  bot: LocalPlayer,
  state: LocalGameState,
  dtMs: number,
): LocalPlayer {
  if (!bot.isAlive || bot.frozenUntil > Date.now()) return bot;

  const dt = Math.min(dtMs / 1000, 0.05);
  const now = Date.now();
  const speed = PLAYER_SPEED * BOT_SPEED_MULTIPLIER * (bot.activePowerup === 'speed_boost' ? 1.5 : 1);

  const alivePlayers = state.players.filter(p => p.isAlive && p.deviceId !== bot.deviceId);
  const bombHolder = state.players.find(p => p.hasBomb && p.isAlive);

  let targetX = bot.botTargetX;
  let targetY = bot.botTargetY;

  // Reassign target periodically or when close
  if (now > bot.botChangeTargetAt || dist(bot.posX, bot.posY, targetX, targetY) < 80) {
    if (bot.hasBomb && alivePlayers.length > 0) {
      // Has bomb → run toward nearest other player to pass it
      let closest = alivePlayers[0];
      let minD = dist(bot.posX, bot.posY, closest.posX, closest.posY);
      for (const p of alivePlayers) {
        const d = dist(bot.posX, bot.posY, p.posX, p.posY);
        if (d < minD && !p.shieldActive) { minD = d; closest = p; }
      }
      targetX = closest.posX;
      targetY = closest.posY;
    } else if (bombHolder) {
      // No bomb → flee from bomb holder
      const dx = bot.posX - bombHolder.posX;
      const dy = bot.posY - bombHolder.posY;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      targetX = bot.posX + (dx / len) * 400 + rand(-150, 150);
      targetY = bot.posY + (dy / len) * 400 + rand(-150, 150);
      targetX = Math.max(200, Math.min(MAP_WIDTH - 200, targetX));
      targetY = Math.max(200, Math.min(MAP_HEIGHT - 200, targetY));
    } else {
      // Wander
      targetX = rand(300, MAP_WIDTH - 300);
      targetY = rand(300, MAP_HEIGHT - 300);
    }
    const changeDelay = bot.hasBomb ? 300 : 800;
    const newChangeAt = now + changeDelay + rand(-100, 100);
    const dx = targetX - bot.posX;
    const dy = targetY - bot.posY;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = dx / len;
    const ny = dy / len;
    let px = bot.posX + nx * speed * dt;
    let py = bot.posY + ny * speed * dt;
    const clamped = clampToMap(px, py, MAP_WIDTH, MAP_HEIGHT);
    px = clamped.px; py = clamped.py;
    const resolved = resolveCollisions(px, py, COLLISION_RECTS);
    px = resolved.px; py = resolved.py;
    const isMoving = Math.abs(nx) > 0.05 || Math.abs(ny) > 0.05;
    const frameDur = isMoving ? 110 : 500;
    const frames = isMoving ? 4 : 2;
    return {
      ...bot,
      posX: px, posY: py,
      vx: nx * speed, vy: ny * speed,
      facing: nx < -0.05 ? 'left' : nx > 0.05 ? 'right' : bot.facing,
      animState: bot.hasBomb ? 'carrying' : isMoving ? 'running' : 'idle',
      animClock: (bot.animClock + dtMs) % (frameDur * frames),
      botTargetX: targetX, botTargetY: targetY,
      botChangeTargetAt: newChangeAt,
    };
  }

  const dx = targetX - bot.posX;
  const dy = targetY - bot.posY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = dx / len;
  const ny = dy / len;
  let px = bot.posX + nx * speed * dt;
  let py = bot.posY + ny * speed * dt;
  const clamped = clampToMap(px, py, MAP_WIDTH, MAP_HEIGHT);
  px = clamped.px; py = clamped.py;
  const resolved = resolveCollisions(px, py, COLLISION_RECTS);
  px = resolved.px; py = resolved.py;
  const isMoving = len > 10;
  const frameDur = isMoving ? 110 : 500;
  const frames = isMoving ? 4 : 2;
  return {
    ...bot,
    posX: px, posY: py,
    vx: nx * speed, vy: ny * speed,
    facing: nx < -0.05 ? 'left' : nx > 0.05 ? 'right' : bot.facing,
    animState: bot.hasBomb ? 'carrying' : isMoving ? 'running' : 'idle',
    animClock: (bot.animClock + dtMs) % (frameDur * frames),
  };
}

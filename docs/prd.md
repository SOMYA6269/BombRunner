# Requirements Document

## 1. Application Overview

**Application Name**: Premium 2D Party Game Prototype

**Description**: A landscape-oriented mobile party game featuring a single playable character navigating a test arena. The player collects a bomb with a countdown timer, and the game ends when the timer reaches zero. This is the first playable prototype focusing on core mechanics: movement, camera follow, collision detection, and basic game loop.

---

## 2. Users and Usage Scenarios

**Target Users**: Mobile game players who enjoy casual party games with cartoon aesthetics.

**Core Usage Scenario**: Players test the basic game mechanics by controlling a character, picking up a bomb, and experiencing the countdown-to-explosion game loop in a small test arena.

---

## 3. Screen Structure and Functional Description

### 3.1 Screen Structure

```
Game Screen (Landscape Only)
├── Game Canvas (Full-screen)
│   ├── Map (Test Arena)
│   │   ├── Ground (Grass)
│   │   ├── Obstacles (Walls, Crates, Bushes, Ladders, Trees)
│   │   ├── Bomb (Spawned on Map)
│   │   └── Player Character
│   └── Camera (Follows Player)
├── UI Overlay
│   ├── FPS Counter (Top-left, Development Only)
│   ├── Countdown Timer (Top-center, Visible After Bomb Pickup)
│   ├── Pause Button (Top-right)
│   └── Game Over Overlay (「You Lose」, Displayed After Explosion)
└── Virtual Joystick (Bottom-left)
```

### 3.2 Functional Description

#### 3.2.1 Game Canvas

**Map - Test Arena**
- Display a small test arena with cartoon-style visual elements
- Include ground texture (grass)
- Place static obstacles: stone walls, wooden crates, bushes, small ladders, decorative trees
- Apply simple shadows to objects for depth perception
- Visual style resembles fun cartoon party games

**Player Character**
- Display one cute cartoon character at the center of the map upon game start
- Character automatically faces the direction of movement
- Play running animation when moving
- Play idle animation when stationary
- When bomb is picked up, display bomb attached to character's hand

**Bomb**
- Spawn one bomb at a fixed location on the map
- Bomb remains visible until player walks over it
- When player collides with bomb, bomb disappears from map and attaches to player

**Camera**
- Camera follows player smoothly with slight delay
- Player remains near the center of the screen during movement
- Camera shakes when explosion occurs

#### 3.2.2 Virtual Joystick (Bottom-left)

- Display a virtual joystick control on the bottom-left corner
- Player drags joystick to control character movement
- Support 360-degree movement in all directions
- Character moves smoothly based on joystick input
- Movement speed is consistent

#### 3.2.3 UI Overlay

**FPS Counter (Top-left)**
- Display current frames per second
- Update in real-time
- Visible during development only

**Countdown Timer (Top-center)**
- Hidden by default
- Appears when player picks up bomb
- Display remaining time in seconds (starting at 20)
- Decrease by 1 every second
- When timer reaches 0, trigger explosion

**Pause Button (Top-right)**
- Display a pause icon button
- When tapped, pause the game (freeze all game logic and animations)

**Game Over Overlay**
- Hidden by default
- Display「You Lose」message when explosion occurs
- Cover the game canvas
- No restart or exit options in this prototype

---

## 4. Business Rules and Logic

### 4.1 Movement Logic

- Player character moves in response to virtual joystick input
- Movement is smooth and continuous (60 FPS rendering)
- Character rotation updates to face movement direction
- Animation switches between idle and running based on movement state

### 4.2 Collision Detection

- Player cannot pass through stone walls
- Player cannot pass through wooden crates
- Player can move freely around obstacles
- Collision boundaries match visual appearance of obstacles
- Player can walk over grass, bushes, ladders, and trees (no collision)

### 4.3 Bomb Pickup and Countdown

- When player character overlaps with bomb position, bomb is picked up
- Bomb attaches to player's hand (visual representation)
- Countdown timer appears at top-center, starting at 20 seconds
- Timer decreases by 1 every second
- Timer continues counting down regardless of player movement

### 4.4 Explosion Logic

- When countdown timer reaches 0:
  1. Play explosion animation at player's position
  2. Trigger camera shake effect
  3. Display「You Lose」overlay
  4. Freeze all game logic (player cannot move, timer stops)

### 4.5 Camera Follow Logic

- Camera position updates smoothly to keep player near screen center
- Camera movement has slight delay for smooth tracking
- Camera bounds are limited to map edges (camera does not show area outside map)

---

## 5. Exceptions and Edge Cases

| Scenario | Handling |
|----------|----------|
| Player attempts to move outside map boundaries | Collision detection prevents movement beyond map edges |
| Player pauses game during countdown | Timer freezes, all animations and logic pause |
| Player picks up bomb while already holding bomb | Not applicable (only one bomb exists in this prototype) |
| Explosion animation plays while player is moving | Player movement freezes immediately when timer reaches 0 |
| FPS drops below 60 | Game continues to run, FPS counter reflects actual performance |
| Player taps pause button multiple times rapidly | Only first tap registers, subsequent taps ignored while paused |

---

## 6. Acceptance Criteria

The prototype is considered complete when the following user flow can be executed without errors:

1. Launch the game, player character appears at the center of the test arena in landscape orientation
2. Use virtual joystick to move the character in any direction, character faces movement direction and plays running animation
3. Move character to collide with a wall or crate, character stops and cannot pass through
4. Move character to the bomb location, bomb attaches to character's hand and countdown timer appears showing 20 seconds
5. Wait for countdown timer to decrease to 0, explosion animation plays, camera shakes, and「You Lose」overlay appears

---

## 7. Out of Scope for This Release

The following features are explicitly excluded from this prototype and will not be implemented:

- Multiplayer functionality (real-time or turn-based)
- Backend services and data storage
- User authentication and account system
- In-app purchases, shop, or virtual currency (coins)
- Advertisements integration
- Main menu, settings menu, or level selection
- Multiple maps or levels
- Additional game modes
- Sound effects and background music
- Character customization or unlockable skins
- Leaderboards or achievements
- Social features (sharing, inviting friends)
- Tutorial or onboarding flow
- Restart or exit functionality after game over
- Multiple bombs or power-ups
- Enemy characters or AI opponents
- Health system or damage mechanics
- Scoring system
- Network connectivity checks
- Analytics or crash reporting
- Localization (multi-language support)
- Accessibility features (colorblind mode, text scaling)
- Portrait orientation support
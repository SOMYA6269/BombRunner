# Requirements Document

## 1. Application Overview

**Application Name**: Bomb Runner

**Description**: A landscape-oriented online multiplayer mobile game for up to 8 players. Players compete in real-time matches where one player holds a bomb with a countdown timer. The bomb holder must touch another player to pass the bomb before the timer expires. When the timer reaches zero, the bomb holder is eliminated. The last surviving player wins. Built with React Native and Expo SDK 55.

---

## 2. Users and Usage Scenarios

**Target Users**: Mobile game players who enjoy fast-paced multiplayer party games with cartoon aesthetics.

**Core Usage Scenarios**:
- Players join online matches with up to 8 participants
- Compete to survive by passing the bomb to other players
- Collect power-ups to gain tactical advantages
- Unlock characters, skins, and cosmetic items through gameplay
- Track progress through leaderboards and missions

---

## 3. Screen Structure and Functional Description

### 3.1 Screen Structure

```
Bomb Runner App
├── Login Screen
├── Home Screen
│   ├── Left Sidebar (Shop, Characters, Ranking, Missions, Friends, Daily Reward)
│   ├── Main Area (QUICK PLAY, ROOM MATCH, PRIVATE MATCH)
│   ├── Top Bar (Player Profile, Coins, Gems)
│   └── Bottom Navigation (Home, Events, Play, Leaderboard, Profile)
├── Create/Join Room Screen
├── Lobby Screen
├── Character Selection Screen
├── Gameplay Screen
├── Pause Screen
├── Spectator Screen
├── Victory Screen
├── Defeat Screen
├── Leaderboard Screen
├── Shop Screen
├── Settings Screen
├── Profile Screen
├── Inventory Screen
└── Missions Screen
```

### 3.2 Functional Description

#### 3.2.1 Login Screen

- Display app logo and title
- Provide username or email input field
- Provide password input field
- Display login button
- User enters credentials and taps login to authenticate via Supabase
- Upon successful authentication, navigate to Home Screen

#### 3.2.2 Home Screen

**Top Bar**
- Display player profile picture and username (top-left)
- Display current coins count
- Display current gems count

**Main Area**
- Display three primary action buttons:
  + QUICK PLAY: Join random match immediately
  + ROOM MATCH: Browse and join existing rooms
  + PRIVATE MATCH: Create private room with room code

**Left Sidebar**
- Shop: Navigate to Shop Screen
- Characters: Navigate to Character Selection Screen
- Ranking: Navigate to Leaderboard Screen
- Missions: Navigate to Missions Screen
- Friends: View friends list
- Daily Reward: Claim daily login rewards

**Bottom Navigation**
- Home: Current screen
- Events: View limited-time events
- Play: Quick access to game modes
- Leaderboard: Navigate to Leaderboard Screen
- Profile: Navigate to Profile Screen

#### 3.2.3 Create/Join Room Screen

**Create Room**
- Display room settings: Max players (2-8), Map selection, Match duration
- Generate unique room code
- Display START button (host only)

**Join Room**
- Provide room code input field
- Display JOIN button
- Show error message if room code is invalid or room is full

#### 3.2.4 Lobby Screen

**Room Information**
- Display room ID at top
- Display host indicator

**Player List**
- Show all players in room (up to 8)
- Display each player's username, character, and ready status
- Each player can toggle ready status

**Information Panels**
- How to Play: Explain core gameplay mechanics
- Game Flow: Describe match progression
- Power-ups List: Show available power-ups and their effects

**Actions**
- START GAME button (visible to host only, enabled when all players are ready)
- LEAVE ROOM button

#### 3.2.5 Character Selection Screen

**Character Grid**
- Display 8 characters: PlayerOne (Red jacket, brown hair), Speedy (Green hoodie, green hair), Shadow (Purple outfit, purple hair), Blaze (Blue suit, blue hair), Hunter (Orange vest, orange hair), Flash (Pink outfit, pink hair), Nova (Teal suit, teal hair), Zed (Gray armor, white hair)
- Each character card shows character preview and name

**Character Details**
- Display selected character's stats: Power, Speed, Bomb Count, Range
- Show character preview with animations

**Actions**
- Tap character to select
- Display CONFIRM button

#### 3.2.6 Gameplay Screen

**Game Canvas (Landscape 16:9)**
- Display Ancient Ruins map with top-down view
- Map elements: Stone walls, bushes, wooden crates, decorative barrels, broken pillars, torches, grass patches, small ponds, stone pathways, glowing power-up spawn points
- Render all 8 players at random spawn positions
- Camera follows local player smoothly
- Display player characters with running/idle/bomb carrying animations
- Show bomb attached to current bomb holder
- Display power-ups at spawn points

**Top-Left HUD**
- Player ranking list
- Alive players count

**Top-Center HUD**
- Large countdown timer (starts at 20 seconds when bomb is assigned)

**Top-Right HUD**
- Mini-map showing all players and map layout
- Ping indicator
- Settings button

**Bottom-Left Control**
- Virtual joystick for 360-degree movement

**Bottom-Right Control**
- Three ability buttons: Shield, Freeze, Speed Boost
- Each button shows cooldown status

**Center Notifications**
- Display messages: \"You have the bomb!\", \"Bomb Passed!\", \"Player Eliminated!\"

**Visual Effects**
- Bomb fuse sparks on bomb holder
- Explosion animation when timer reaches zero
- Screen shake on explosion
- Camera zoom effect on elimination
- Glowing effects on power-ups
- Trail effects while running with speed boost
- Smoke particles after explosion

#### 3.2.7 Pause Screen

- Display semi-transparent overlay
- Show RESUME button
- Show SETTINGS button
- Show LEAVE MATCH button
- Freeze all gameplay when displayed

#### 3.2.8 Spectator Screen

- Display gameplay from eliminated player's perspective
- Show all remaining players
- Display spectator indicator
- Allow camera to follow any remaining player
- Show match progress and remaining players count

#### 3.2.9 Victory Screen

- Display winner celebration animation
- Show #1 indicator
- Display match statistics: Eliminations, Bombs passed, Survival time
- Show rewards earned: Coins, Experience points
- Display CONTINUE button

#### 3.2.10 Defeat Screen

- Display elimination message
- Show final placement (2nd, 3rd, etc.)
- Display match statistics
- Show rewards earned
- Display CONTINUE button

#### 3.2.11 Leaderboard Screen

**Tabs**
- Global: Top 100 players worldwide
- Friends: Friends ranking
- Weekly: Current week rankings

**Leaderboard List**
- Display rank, player name, wins, total matches, win rate
- Highlight local player's position

#### 3.2.12 Shop Screen

**Top Bar**
- Display current coins count
- Display current gems count

**Tabs**
- Offers: Limited-time bundles
- Skins: Character skins and bomb skins
- Power-ups: Purchasable power-ups
- Currency: Coin and gem packs

**Item Grid**
- Display items with preview, name, and price
- Show owned indicator for purchased items
- Display BUY button for each item

**Shop Items**
- Characters (unlockable)
- Bomb skins (visual customization)
- Trails (running effect customization)
- Emotes (in-game expressions)
- Animations (victory/defeat animations)

#### 3.2.13 Settings Screen

**Audio Settings**
- Music volume slider
- Sound effects volume slider

**Graphics Settings**
- Quality preset selection (Low, Medium, High)

**Controls Settings**
- Joystick sensitivity slider

**Account Settings**
- Display username
- LOGOUT button

#### 3.2.14 Profile Screen

**Player Information**
- Display profile picture
- Display username
- Display player level and experience bar

**Statistics**
- Total matches played
- Total wins
- Win rate percentage
- Total eliminations
- Favorite character

**Actions**
- EDIT PROFILE button

#### 3.2.15 Inventory Screen

**Tabs**
- Characters: Owned characters
- Skins: Owned bomb skins and character skins
- Trails: Owned trail effects
- Emotes: Owned emotes

**Item Grid**
- Display owned items with preview
- Show equipped indicator
- Tap item to equip

#### 3.2.16 Missions Screen

**Tabs**
- Daily: Reset every 24 hours
- Weekly: Reset every 7 days
- Achievements: Permanent challenges

**Mission List**
- Display mission description
- Show progress bar
- Display reward (coins/gems/items)
- Show CLAIM button when completed

---

## 4. Business Rules and Logic

### 4.1 Match Flow

1. Players join lobby and select ready status
2. Host starts match when all players ready
3. All players spawn at random positions on Ancient Ruins map
4. 3-second countdown displayed
5. One random player receives bomb, countdown timer starts at 20 seconds
6. Bomb holder must chase and touch another player to pass bomb
7. On touch, bomb instantly transfers to touched player, timer continues
8. If timer reaches zero: Explosion animation plays, bomb holder eliminated, enters spectator mode
9. Remaining players continue, new random player receives bomb, timer resets to 20 seconds
10. Repeat until only one player remains
11. Winner displayed, all players see Victory/Defeat screen
12. Rewards distributed, players return to Home Screen

### 4.2 Movement and Collision

- Players move using virtual joystick in 360 degrees
- Character faces movement direction
- Running animation plays when moving
- Idle animation plays when stationary
- Players cannot pass through stone walls, wooden crates, broken pillars
- Players can move freely over grass, bushes, ponds, pathways
- Collision detection uses character hitbox

### 4.3 Bomb Transfer

- Bomb holder has bomb visually attached to character
- When bomb holder's hitbox overlaps with another player's hitbox, bomb transfers instantly
- Previous bomb holder becomes safe (no longer at risk)
- New bomb holder receives notification \"You have the bomb!\"
- All players see notification \"Bomb Passed!\"
- Countdown timer continues without interruption

### 4.4 Elimination

- When countdown timer reaches 0:
  + Explosion animation plays at bomb holder's position
  + Screen shakes for all players
  + Camera zooms on explosion
  + Bomb holder is eliminated
  + Eliminated player enters spectator mode
  + All players see notification \"Player Eliminated!\"
  + Remaining players count updates
  + New random player (from remaining players) receives bomb
  + Timer resets to 20 seconds

### 4.5 Power-ups

**Shield**
- Protects player from receiving bomb for 5 seconds
- Visual shield effect surrounds character
- If bomb holder touches shielded player, bomb does not transfer

**Speed Boost**
- Increases movement speed by 50% for 8 seconds
- Trail effect appears behind character

**Freeze**
- Freezes all other players for 3 seconds
- Frozen players cannot move
- Visual ice effect on frozen players

**Extra Time**
- Adds 5 seconds to countdown timer
- Only usable by bomb holder

**Ghost Dash**
- Player becomes semi-transparent and can pass through obstacles for 4 seconds
- Cannot receive or pass bomb while active

**Power-up Spawn**
- Power-ups spawn at designated glowing spawn points
- One power-up spawns every 15 seconds
- Player walks over power-up to collect
- Each player can hold one power-up at a time
- Tap ability button to activate

### 4.6 Camera System

- Camera follows local player with smooth interpolation
- Player remains near center of screen
- Camera bounds limited to map edges
- Camera shakes on explosion events
- Camera zooms slightly on elimination

### 4.7 Network Synchronization

- All player positions synchronized via Supabase Realtime
- Bomb holder status synchronized in real-time
- Countdown timer synchronized across all clients
- Power-up pickups synchronized
- Elimination events broadcast to all players
- Client-side prediction for local player movement
- Server reconciliation for position corrections
- Interpolation for smooth remote player movement

### 4.8 Currency and Rewards

**Match Rewards**
- Winner: 100 coins + 50 experience points
- 2nd place: 50 coins + 30 experience points
- 3rd place: 30 coins + 20 experience points
- 4th-8th place: 10 coins + 10 experience points

**Mission Rewards**
- Daily missions: 20-50 coins
- Weekly missions: 100-200 coins or 10-20 gems
- Achievements: 500-1000 coins or 50-100 gems or exclusive items

**Currency Usage**
- Coins: Purchase characters, skins, trails, emotes
- Gems: Purchase premium items, coin packs, exclusive bundles

### 4.9 Character Stats

- Power: Affects bomb explosion radius (cosmetic only in this version)
- Speed: Base movement speed multiplier
- Bomb Count: Number of bombs in visual effect (cosmetic only)
- Range: Interaction range for bomb transfer

### 4.10 Reconnection

- If player disconnects during match, attempt automatic reconnection
- If reconnection successful within 30 seconds, player rejoins match at last known position
- If reconnection fails or exceeds 30 seconds, player is eliminated
- Remaining players continue match

---

## 5. Exceptions and Edge Cases

| Scenario | Handling |
|----------|----------|
| Player disconnects during match | Attempt reconnection for 30 seconds, eliminate if failed |
| Bomb holder disconnects | Bomb immediately transfers to random remaining player |
| Only 2 players remain and one is eliminated | Remaining player wins immediately |
| All players disconnect except one | Remaining player wins by default |
| Power-up collected by multiple players simultaneously | First player to reach server receives power-up |
| Bomb transfer occurs at exact moment timer reaches zero | Explosion occurs, previous bomb holder eliminated |
| Player activates Shield while holding bomb | Shield activates but does not prevent elimination if timer expires |
| Player uses Ghost Dash while holding bomb | Bomb remains with player, can still be eliminated |
| Host leaves lobby before match starts | Host role transfers to next player in list |
| Player attempts to join full room | Display \"Room is full\" error message |
| Player enters invalid room code | Display \"Invalid room code\" error message |
| Network latency exceeds 500ms | Display high ping warning, continue gameplay with prediction |
| Player attempts to purchase item with insufficient currency | Display \"Insufficient coins/gems\" error message |
| Player claims mission reward | Reward added to account, mission marked complete |
| Player reaches maximum level | Experience bar shows \"MAX LEVEL\" |

---

## 6. Acceptance Criteria

The application is considered complete when the following user flow can be executed without errors:

1. Launch app, enter username and password on Login Screen, successfully authenticate and navigate to Home Screen
2. Tap QUICK PLAY button, automatically join a match with other players, navigate to Lobby Screen
3. Select character from Character Selection Screen, confirm selection, return to Lobby Screen with selected character displayed
4. Wait for all players to ready, host starts match, navigate to Gameplay Screen with all players spawned on Ancient Ruins map
5. Use virtual joystick to move character, one random player receives bomb with countdown timer starting at 20 seconds
6. As bomb holder, chase another player and touch them, bomb transfers instantly to touched player
7. Collect a power-up from glowing spawn point, tap ability button to activate power-up effect
8. Wait for countdown timer to reach zero, explosion animation plays, bomb holder is eliminated and enters Spectator Screen
9. Continue as spectator until only one player remains, winner is displayed, navigate to Victory/Defeat Screen
10. View match statistics and rewards earned, tap CONTINUE button, return to Home Screen
11. Navigate to Shop Screen, purchase a character skin using coins, navigate to Inventory Screen and equip purchased skin
12. Navigate to Missions Screen, view daily mission progress, complete a mission, claim reward

---

## 7. Out of Scope for This Release

The following features are explicitly excluded from this release and will not be implemented:

- Voice chat or text chat during matches
- Clan or guild system
- Tournament or ranked mode
- Replay system or match recording
- Spectator mode for non-participants
- Custom map editor
- Cross-platform play with other platforms
- Offline single-player mode or bot matches
- In-game reporting or moderation tools
- Push notifications for events or friend invites
- Social media integration (Facebook, Twitter sharing)
- Third-party authentication (Google, Apple, Facebook login)
- Parental controls or age verification
- Accessibility features (colorblind mode, text-to-speech)
- Multiple language localization
- Seasonal events or battle pass system
- Character progression or skill trees
- Weapon or equipment system
- Team-based game modes
- Custom game rules or modifiers
- Spectator betting or prediction system
- Video ads for rewards
- Referral or invite rewards program
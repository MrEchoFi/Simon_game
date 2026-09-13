# Retro Simon

A retro-inspired **Simon memory game** built as a native desktop application using **Tauri 2, Rust, TypeScript, HTML, CSS, and Vite**.

Retro Simon recreates the classic Simon-style memory challenge while adding modern game features such as multiple difficulty modes, scoring, lives, combo multipliers, keyboard support, sound feedback, high-score persistence, and a CRT-inspired arcade interface.

> **Project Type:** Desktop Game / University Project
> **Framework:** Tauri 2
> **Backend:** Rust
> **Frontend:** TypeScript + Vite
> **Storage:** Local application storage
> **Target:** Linux, Windows, macOS

---

## Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Game Modes](#game-modes)
* [How the Game Works](#how-the-game-works)
* [Controls](#controls)
* [Technology Stack](#technology-stack)
* [System Architecture](#system-architecture)
* [Project Structure](#project-structure)
* [Requirements](#requirements)
* [Installation](#installation)
* [Running the Game](#running-the-game)
* [How to Play](#how-to-play)
* [Scoring System](#scoring-system)
* [High Scores](#high-scores)
* [Keyboard Controls](#keyboard-controls)
* [Audio](#audio)
* [Building for Production](#building-for-production)
* [Development](#development)
* [Troubleshooting](#troubleshooting)
* [Project Design](#project-design)
* [Future Improvements](#future-improvements)
* [Educational Purpose](#educational-purpose)
* [License](#license)

---

# Overview

Retro Simon is a desktop implementation of the classic **Simon memory game**.

The computer generates a sequence of colored pads. The player must observe the sequence and reproduce it in the correct order.

After every successful round, the sequence becomes longer and the challenge increases.

```text
Computer generates sequence
          ↓
Player watches sequence
          ↓
Player repeats sequence
          ↓
Correct?
 ┌────────┴────────┐
 │                 │
 YES               NO
 │                 │
 ▼                 ▼
Next round      Lose life
 │                 │
 ▼                 ▼
Longer sequence  Game over
```

The application is designed to feel like a small **1980s/1990s arcade machine**, while its internal architecture follows a modern desktop application model.

---

# Features

## Classic Simon Gameplay

The core gameplay follows the traditional memory-game concept:

* Four colored pads
* Randomly generated sequence
* Visual sequence playback
* Player sequence input
* Increasing sequence length
* Round progression
* Mistake detection
* Game-over state

---

## Retro Arcade Interface

The user interface is designed around a retro computer/arcade aesthetic.

The application includes:

* CRT-inspired styling
* Glow effects
* Arcade-style panels
* Retro status indicators
* Large score display
* Animated pads
* Game-state indicators
* Start/restart controls

---

## Multiple Game Modes

Retro Simon provides several gameplay styles.

### Classic

Traditional Simon gameplay.

```text
Watch → Remember → Repeat
```

The sequence becomes longer after each successful round.

### Speed

The sequence playback becomes progressively faster.

This mode tests both:

* Memory
* Reaction speed

### Strict

Mistakes have a much stronger consequence.

A single incorrect input can immediately end the current game depending on the configured difficulty.

---

## Lives

Normal gameplay provides multiple attempts.

Example:

```text
LIVES
♥ ♥ ♥
```

When an incorrect pad is pressed:

```text
♥ ♥ ♥
 ↓
♥ ♥
```

When all lives are exhausted:

```text
GAME OVER
```

---

## Score System

The score increases as the player successfully completes rounds.

The scoring system rewards:

* Correct sequence reproduction
* Longer sequences
* Successful rounds
* Combo streaks
* Higher difficulty

Example:

```text
ROUND       8
SCORE    4,820
COMBO       ×7
```

---

## Combo Multiplier

Successful rounds can build a combo.

For example:

```text
Combo ×1
Combo ×2
Combo ×3
Combo ×4
...
```

Maintaining a longer streak increases the player's score multiplier.

---

## Keyboard Support

The game can be played without a mouse.

The four Simon pads can be controlled using:

```text
1  2  3  4
```

Additional keyboard controls are available for starting and resetting the game.

---

## Mouse / Pointer Support

The colored pads can also be activated by clicking them.

This allows the game to be played through:

* Mouse
* Trackpad
* Touch-capable pointing devices

---

## Sound Feedback

The application provides generated game sounds for:

* Pad activation
* Sequence playback
* Successful input
* Incorrect input
* Game start
* Game over

Audio is generated locally by the frontend and does not require external sound files.

---

# Game Modes

| Mode    | Description                |
| ------- | -------------------------- |
| Classic | Traditional Simon gameplay |
| Speed   | Faster sequence playback   |
| Strict  | More punishing mistakes    |

The game mode can be selected before beginning a new session.

---

# How the Game Works

The game maintains an internal sequence.

For example:

```text
GREEN
BLUE
RED
YELLOW
```

The computer plays:

```text
🟢 → 🔵 → 🔴 → 🟡
```

The player must enter:

```text
🟢 → 🔵 → 🔴 → 🟡
```

After a correct response, a new color is added:

```text
🟢 → 🔵 → 🔴 → 🟡 → 🟢
```

The sequence therefore grows:

```text
Round 1
GREEN

Round 2
GREEN → BLUE

Round 3
GREEN → BLUE → RED

Round 4
GREEN → BLUE → RED → YELLOW
```

This continues until the player makes enough mistakes to trigger game over.

---

# Controls

## Mouse

Click the corresponding colored pad.

## Keyboard

```text
1  → Green
2  → Red
3  → Yellow
4  → Blue
```

Game controls:

```text
ENTER → Start
ESC   → Reset
```

---

# Technology Stack

| Layer                | Technology        |
| -------------------- | ----------------- |
| Desktop Framework    | Tauri 2           |
| Backend              | Rust              |
| Frontend             | TypeScript        |
| Build Tool           | Vite              |
| Markup               | HTML              |
| Styling              | CSS               |
| Tauri API            | `@tauri-apps/api` |
| Package Manager      | npm               |
| Rust Package Manager | Cargo             |

---

# System Architecture

The application follows a desktop frontend/backend architecture.

```text
┌─────────────────────────────────────┐
│             User                    │
│                                     │
│       Mouse / Keyboard              │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│          Retro Simon UI             │
│                                     │
│ HTML + CSS + TypeScript             │
└──────────────────┬──────────────────┘
                   │
             Tauri API
                   │
                   ▼
┌─────────────────────────────────────┐
│              Rust                   │
│                                     │
│ Game Commands / Application Logic   │
│ State / High Score Management       │
└─────────────────────────────────────┘
```

The frontend is responsible for presentation and player interaction.

Rust provides the native desktop application layer and Tauri command interface.

---

# Project Structure

```text
Retro-Simon-Tauri/
│
├── src/
│   ├── main.ts
│   └── style.css
│
├── src-tauri/
│   ├── capabilities/
│   │   └── default.json
│   │
│   ├── icons/
│   │   └── icon.png
│   │
│   ├── src/
│   │   ├── lib.rs
│   │   └── main.rs
│   │
│   ├── Cargo.toml
│   ├── build.rs
│   └── tauri.conf.json
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

# Requirements

Before installing the project, make sure your system has the following tools.

## Node.js

Check:

```bash
node --version
```

Recommended:

```text
Node.js 18+
```

Check npm:

```bash
npm --version
```

---

## Rust

Check:

```bash
rustc --version
cargo --version
```

A current stable Rust toolchain is recommended.

---

## Tauri Development Dependencies

Tauri applications require additional system dependencies depending on the operating system.

For Linux, install the Tauri prerequisites for your distribution before building the desktop application.

---

# Installation

Clone the repository:

```bash
git clone <repository-url>
```

Enter the project directory:

```bash
cd Retro-Simon-Tauri
```

Install the frontend dependencies:

```bash
npm install
```

This installs the packages declared in `package.json`, including:

```text
@tauri-apps/api
@tauri-apps/cli
vite
typescript
```

Rust dependencies are handled by Cargo.

---

# Running the Game

Start the application in development mode:

```bash
npm run tauri dev
```

Alternatively:

```bash
cargo tauri dev
```

The Vite development server will run automatically as part of the Tauri development workflow.

The frontend development server normally uses:

```text
http://localhost:1420/
```

The actual game runs inside the Tauri desktop window.

---

# How to Play

## 1. Launch the application

Run:

```bash
npm run tauri dev
```

## 2. Start the game

Press the start control or:

```text
ENTER
```

## 3. Watch the sequence

The game illuminates the pads one at a time.

For example:

```text
GREEN → BLUE → RED
```

Watch carefully.

## 4. Repeat the sequence

Press:

```text
GREEN
BLUE
RED
```

using either the mouse or keyboard.

## 5. Continue

A new pad is added after a successful round.

For example:

```text
Round 1:
GREEN

Round 2:
GREEN → RED

Round 3:
GREEN → RED → BLUE
```

The game continues until the player reaches game over.

---

# Scoring System

The exact score depends on the selected mode and current progression.

Generally, scoring is affected by:

```text
Successful Round
        +
Sequence Length
        +
Combo
        +
Difficulty
```

A longer successful sequence produces a higher score.

Example:

```text
Round:      10
Base Score: 1000
Combo:      ×5

Final Score:
1000 × 5
```

---

# High Scores

The application supports local high-score persistence.

The highest score can be stored locally and compared against subsequent game sessions.

Example:

```text
HIGH SCORE
──────────
012,450
```

This allows the game to retain an arcade-style competitive element.

---

# Keyboard Controls

| Key     | Action         |
| ------- | -------------- |
| `1`     | Green pad      |
| `2`     | Red pad        |
| `3`     | Yellow pad     |
| `4`     | Blue pad       |
| `ENTER` | Start game     |
| `ESC`   | Reset / return |

Keyboard input provides a convenient way to play without interacting with the mouse.

---

# Audio

Retro Simon uses locally generated audio feedback.

This avoids depending on external audio files.

Sound events can include:

```text
Game Start
     ↓
Pad Tone
     ↓
Correct Input
     ↓
Round Complete
```

Incorrect input generates a different feedback sound.

---

# Development

## Start Vite only

For frontend development:

```bash
npm run dev
```

This launches the Vite development server.

Use this when working primarily on:

* HTML
* CSS
* TypeScript
* UI animations

---

## Start the complete desktop application

Use:

```bash
npm run tauri dev
```

This runs:

```text
Vite
  ↓
Tauri
  ↓
Rust
  ↓
Desktop Game
```

---

## Rust Check

Move into the Tauri backend:

```bash
cd src-tauri
```

Then run:

```bash
cargo check
```

Return to the project root:

```bash
cd ..
```

---

# Production Build

Build the frontend and desktop application:

```bash
npm run tauri build
```

Tauri creates platform-specific application bundles.

The generated packages are normally located under:

```text
src-tauri/target/release/bundle/
```

The exact package format depends on the target operating system.

---

# Build Requirements by Platform

## Linux

Install:

* Rust
* Node.js
* npm
* Tauri system dependencies
* WebKit/GTK development dependencies

Then:

```bash
npm install
npm run tauri build
```

## Windows

Install:

* Node.js
* npm
* Rust
* Microsoft Visual Studio build tools
* Tauri prerequisites

Then:

```powershell
npm install
npm run tauri build
```

## macOS

Install:

* Node.js
* npm
* Rust
* Xcode Command Line Tools

Then:

```bash
npm install
npm run tauri build
```

---

# Troubleshooting

## `vite: not found`

Example:

```text
sh: 1: vite: not found
```

Run:

```bash
npm install
```

Then:

```bash
npm run tauri dev
```

---

## `tauri: not found`

Run:

```bash
npm install
```

Then verify:

```bash
npm ls @tauri-apps/cli
```

If necessary:

```bash
npm install -D @tauri-apps/cli
```

---

## `Failed to resolve import "@tauri-apps/api/core"`

If Vite reports:

```text
Failed to resolve import "@tauri-apps/api/core"
```

install the Tauri JavaScript API:

```bash
npm install @tauri-apps/api
```

Then restart:

```bash
npm run tauri dev
```

The project already includes this dependency in its updated `package.json`.

---

## Missing Tauri icon

If Cargo reports:

```text
failed to open icon
```

verify:

```bash
ls src-tauri/icons/
```

The project should contain:

```text
icon.png
```

---

## Cargo dependency errors

Run:

```bash
cd src-tauri
cargo check
```

Cargo will resolve and download the Rust dependencies required by the project.

---

# Project Design

Retro Simon follows a straightforward separation between UI and native application logic.

## Frontend

The TypeScript frontend handles:

* Game presentation
* Pad animations
* Keyboard input
* Mouse input
* Score display
* Game mode interface
* Visual effects
* Audio feedback

## Tauri

Tauri provides the bridge between the web-based interface and the native desktop application.

The frontend can call Rust functionality through Tauri commands.

Example:

```text
TypeScript
    ↓
invoke(...)
    ↓
Tauri
    ↓
Rust
```

## Rust

Rust provides:

* Native application logic
* Tauri command handlers
* Native desktop integration
* High-score operations
* Backend state handling

---

# Future Improvements

Possible future development includes:

### Game Features

* Six-button Simon mode
* Custom player profiles
* Multiple difficulty levels
* Daily challenge
* Endless mode
* Tournament mode
* Global leaderboard
* Achievement system
* Boss rounds
* Bonus rounds

### Audio

* Full retro soundtrack
* Synthesized arcade music
* Custom sound themes
* Dynamic background music

### Gameplay

* Random pad layout
* Pattern reversal
* Hidden pads
* Decoy animations
* Memory multipliers
* Time-based challenges

### Desktop Features

* Gamepad support
* Fullscreen mode
* Window scaling
* Hardware controller integration
* Steam-style achievement system

---

# Educational Purpose

Retro Simon can be used as a university project to demonstrate concepts including:

* Rust programming
* Tauri desktop application development
* TypeScript
* Frontend development
* Event-driven programming
* State management
* Random sequence generation
* Input validation
* Game loops
* Persistent storage
* Application architecture
* Desktop application packaging

The project also demonstrates how a web technology stack can be embedded into a native desktop application using Tauri.

---

# Learning Example

The core Simon algorithm can be summarized as:

```text
START
  │
  ▼
Generate random pad
  │
  ▼
Play sequence
  │
  ▼
Wait for player
  │
  ▼
Compare input
  │
  ├── Correct ──→ Add next pad
  │                   │
  │                   └──→ Play sequence again
  │
  └── Incorrect ──→ Lose life
                         │
                    Lives remaining?
                     │          │
                    YES         NO
                     │           │
                     ▼           ▼
                  Retry       Game Over
```

This makes the project particularly useful for demonstrating state-based application design.

---

# License

This project is intended primarily for educational, learning, and university project purposes.

The implementation is an original Simon-style game and is not intended to reproduce the source code of another implementation.

Do not use external copyrighted assets from other projects without respecting their applicable licenses.

---

# Credits

**Retro Simon**

Built with:

```text
Tauri 2
Rust
TypeScript
Vite
HTML
CSS
```

Designed as a retro arcade-style desktop memory game.

---

# Quick Start

For the shortest setup:

```bash
git clone <repository-url>
cd Retro-Simon-Tauri
npm install
npm run tauri dev
```

Then:

```text
ENTER
  ↓
Watch the sequence
  ↓
Repeat the sequence
  ↓
Build your combo
  ↓
Beat the high score
```

---

## Project Status

**Status:** Active Development

The project is suitable for:

* University submission
* Software engineering demonstrations
* Rust/Tauri practice
* Desktop application experiments
* Game development learning
* Retro UI experimentation

---

**Retro Simon — Remember the pattern. Beat the machine.**

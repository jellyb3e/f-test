# 121-Final-Project

## Devlog Entry - 1 December 2025

### How we satisfied the software requirements

1. We are still developing our game with Three and AmmoPhysics
2. The player can change scenes by going through doors
3. The player can interact with items with E, drop with Q, and use with R
4. We have persistent inventory across scenes (rooms). The puzzle key must be taken to the other room to unlock the door to escape.
5. Our puzzle is a physical puzzle where you have to rotate it with WASD to get a ball out. The ball is the key to a door.
6. Technically, the player can only fail by giving up, but success is marked by the release of the ball that the player can then pick up.
7. The ending is triggered by unlocking the door to room 12.

### Reflection

Our game's design hasn't changed, but the inner structure of the code has necessarily changed a lot due to difficulty handling scene changes. Our solution was to create a custom scene handler (master.ts) that maintains a list of the game's scenes.

## Devlog Entry - 21 November 2025

### How we satisfied the software requirements

1. We are developing our game in TypeScript!
2. We are using three.js for 3d rendering
3. We are using ammo.js for physics simulation
4. Our puzzle requires the player to hit the green button to win. If they hit the wrong one, they lose!
5. The player is able to control their movement to navigate toward either button
6. When the player hits either button (red or green), a text popup will appear for win/lose states
7. We have linting integrated through Deno
8. We have set up automatic packaging and deployment to GitHub Pages

### Reflection

We have updated our devlog entry to reflect the libraries we're currently using-- there was a bit of confusion as to whether three.js was just for 3d rendering or if it also handled physics. Additionally, we are using npm to run the dev server rather than deno which is what we used in our intial build. However, we still intend to use deno for linting.

## Devlog Entry - 14 November 2025

### Introducing the team

Aegis Michael: Design Lead
Julia Manou: Tools Lead + Testing Lead
Sophie DeGeorge: Engine Lead

### Tools and materials

Language: We decided to go with TypeScript since it’s what we’ve been using for the class and we are all familiar with the language. Because we’re using a web-dev environment, we’ll almost definitely be using CSS as well, and HTML is a given.
Tools: We will be coding in Visual Studio Code on codespaces because that is what we are most familiar with. Additionally, we will be using three.js for 3d rendering and ammo.js for physics.
Generative AI: We will not be using any generative AI.

### Outlook

We are hoping to expand on our knowledge of web development. More specifically, we are interested in learning how to make browser games more interesting and make more interesting browser games!

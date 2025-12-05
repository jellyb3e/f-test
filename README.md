# 121-Final-Project

## Devlog Entry - 5 December 2025

### Selected requirements

1. [Continuous Inventory] - We chose continuous inventory because it felt like a natural and interesting evolution of our existing inventory system from F2.
2. [Visual Themes] - We chose this because it seemed pretty straightforward since there are only 2 modes (dark and light).
3. [i18n + l10n] - We chose the language requirement because we thought it would be cool if our game supported languages that some of our friends know.
4. [External DSL] - We chose this requirement because a JSON file felt like a good structure for language support.

### How we satisfied the software requirements

1. [Continuous Inventory] - The quantity of the stomach dictates whether or not you can unlock the door once you have the key. If you are hungry, you cannot unlock the door.
2. [Visual Themes] - Our game supports light and dark mode and will check the user's device settings and change the color scheme accordingly. This impacts background and text color, as well as scene lighting.
3. [i18n + l10n] - Our game supports 3 languages, English, Japanese, and Arabic. The user can select the game's language by entering one of the three language doors. We also have utility functions to dynamically translate inventory items as they are picked up.
4. [External DSL] - We created a JSON file to define the translated versions of all of the words in our game which use the English word as its key. We've also defined a schema for the language file with hover documentation and type-checking to ensure that only our supported languages can have translations.

### Reflection

Initially we had planned ahead for F3 to have a battery be the continuous inventory item. We changed our plans to have it be a stomach instead because we thought the mechanics would be more interesting.

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

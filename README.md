[URL]penandalokasi.github.io/hcr2cups[/URL]

# HCR2 Cups Chest Tracker, made by a Clanker™

A tiny single-page tracker for the **Hill Climb Racing 2 (Cups) chest cycle**.
You tap a button when you open a chest, and the page tells you what’s next in the **111-step** sequence.  
That’s it. Button goes *click* → number goes up → future you is slightly less confused.

## Features (yes, it remembers things)
- Tracks the **111-chest** Cups sequence
- Big **“Next chest”** card with:
  - chest type (Common / Uncommon / Rare / Epic / Champion)
  - position in the cycle + which cycle you’re on
- **Next milestone** button:
  - jumps to the next **non-common** chest
  - auto-counts the boring commons in between (because life is short)
- Progress bits:
  - total opened
  - current cycle progress (`x / 111`) + % bar
- Shows the **next 5 milestone chests** coming up (so you can pretend you’re planning)
- **Undo** (up to ~60 steps of regret)
- **Reset** (with confirmation, because misclicks happen)
- Manual mode: set your total opened count if you lost track (or you’re speedrunning chaos)
- Click any chest in the grid to set the *next* chest to that position (confirmation required)
- Saves locally via **localStorage** (no accounts, no servers, no spying… just your browser hoarding numbers)

## How to use
1. Open the page  
   - If you’re using GitHub Pages: enable it in repo settings, then open the published site  
   - Or just open `index.html` locally (it’s that kind of project)
2. After opening a Cups chest in-game, click **Next chest**
3. Want to fast-forward to the next “good” chest? Click **Next milestone**
4. If you messed up:
   - **Undo** to roll back
   - Or type the correct number and hit **Set**
   - Or **Reset** if you enjoy starting over

## Notes (a.k.a. fine print nobody reads)
- “Milestone” = anything that’s **not Common**
- Your progress lives in your browser. Clear site data / change device / incognito mode = *poof*
- The sequence is hardcoded in `scripts.js` (`SEQUENCE`). If the game updates and the cycle changes, this will become confidently wrong until updated
- Not affiliated with Fingersoft. This is just a spreadsheet with better vibes

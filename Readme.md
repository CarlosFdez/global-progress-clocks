# Global Progress Clocks

Blades in the Dark style progress clocks and point trackers that render in the main interface of Foundry VTT. These are shown globally to all players, and are system agnostic in their implementation.

![image](https://github.com/user-attachments/assets/ec643295-d67b-4383-8c2c-6d5ecdf39d7a)

These clocks are only editable by the gamemaster, and can either be edited with a dialog or ticked by left or right clicking.

## Supported Features

### Clocks

The module is capable of creating clocks, a feature used in games such as Blades in the Dark in order to track completion of a goal or the moment in which a problem manifests. More information about clocks can be seen https://bladesinthedark.com/progress-clocks or https://www.indiegamereadingclub.com/indie-game-reading-club/clocks-forged-in-the-darks-underappreciated-killer-app/.

This module is currently best used for scene clocks. Any long term or player clock such as a faction or project clock is best represented in other ways, such as the clockworks module or with the clock actors in some systems. I will likely add a new way to display clocks in the sidebar similar to clockworks at a later date.

### Points

Some system like Pathfinder 2e use something similar to clocks called victory points, which are numbers that count up. These numbers lack an obvious max but denote progress or advantages the party has obtained. While any system can use this feature, in Pathfinder 2e the module adjusts its position if the system's effect panel is in view.

![image](https://github.com/user-attachments/assets/e48b8928-003b-4345-80f2-15d0d17e1e08)

![image](https://github.com/user-attachments/assets/92828d6a-03b5-4a22-90ed-ef7e32226765)

## Scripting

There is no full api, but there is `window.clockDatabase` to mess with the clocks themselves. Here's an example to increment an existing clock.
```js
const clock = window.clockDatabase.getName("Test a cloc");
window.clockDatabase.update({ id: clock.id, value: clock.value + 1 });
```

## Credits
* Lunar-Dawn for converting from the original images to CSS generated

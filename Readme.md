# Global Progress Clocks

Blades in the Dark style progress clocks that show on the sidebar for Foundry VTT. These are shown globally to all players, and are not stored in actor data like other modules so they should be system agnostic (except for those that make use of that space in some way).

![image](https://user-images.githubusercontent.com/1286721/232355007-becf4713-ee84-49df-9803-1724f7fd8684.png)

These clocks are only editable by the gamemaster, and can either be edited with a dialog or ticked by left or right clicking.

## Scripting

There is no full api, but there is `window.clockDatabase` to mess with the clocks themselves. Here's an example to increment an existing clock.
```js
const clock = window.clockDatabase.getName("Test a cloc");
window.clockDatabase.update({ id: clock.id, value: clock.value + 1 });
```

## Credits
* Lunar-Dawn for converting from the original images to CSS generated

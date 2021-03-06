# source-soundboard

Create Source engine .cfg files that say a message in chat ("bind") after entering their numeric code on your numpad.

See `soundboard.example.js` for a file example.

## Usage

`$ source-soundboard [file.js]`, will generate a file `file.cfg` in the same directory as `file.js` (defaults to `soundboard.js` in the current working directory).

Copy `soundboard.cfg` and the `soundboard` directory to your game's `cfg` folder (or, keep your `soundboard.js` there, or use a subdirectory and a symlink). Add `exec soundboard` to your `autoexec.cfg` to always have access to your soundboard, or type `exec soundboard` in the game's console to run it on demand. `exec`ing a new soundboard will replace all the keys as expected. If you wanted to have different soundboard files instead of combining them into a single one, you could create a bind that `exec`s a different soundboard.

Enter the numeric code you specified in the `.js` in-game to say a message. Longer messages are split onto multiple lines. Press `0` to reset the current selection and show the help menu in the top left corner for the top level menus. Navigating through a menu will show a preview of the lines in the top left of the screen.

## License

[GPL 3.0](COPYING)

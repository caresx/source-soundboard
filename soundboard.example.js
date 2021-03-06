// .json format also works, but is more effort to type, and does not support comments
module.exports = {
  // Time to `wait` between lines whenever a text is multiline.
  // Formula: max(cl_cmdrate, currentfps) * seconds. `currentfps` can be limited by fps_max.
  // In practice, unless you have a potato PC, `wait` will use your actual framerate. You should set your fps_max manually accordingly in your autoexec.
  // In TF2, you need to wait 4 seconds between messages to not be rate limited by the server. In other games you might be able to get away with less.
  // Your fps_max should be set to your monitor's refresh rate. If you have a 60Hz monitor, use fps_max 60.
  // Example: (assuming fps_max 144, TF2)
  // If your fps_max is 60, and you are playing TF2, you should use `66 * 4`, as 66 is the cl_cmdrate of TF2, and it's greater than your fps_max.
  wait: 144 * 4,
  // When putting your soundboards in a directory in your cfg folder (especially when using mastercomfig), use the following setting:
  // dir: 'user', // Make sure your soundboard and its files directory is in the `user` directory in your cfg folder.
  // Tip: This way you can also symlink your .cfgs from the location you store the backups in, into your cfg folder.
  // How many seconds to show help text for. Defaults to 4.
  help_duration: 4,
  1: {
    // This will be sent in chat when pressing 1 then 1 on the numpad.
    1: '11',
    2: '12',
    3: {
      // Menu selection can be cancelled by pressing 0 on the numpad. 1 3 0 would cancel your selection.
      1: '131',
      // 132. This message will be split across multiple lines (`say`s) that will be sent with a short delay using wait.
      2: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eleifend eros in neque convallis tempus. Duis vestibulum consectetur ante nec euismod. Vestibulum et feugiat metus, sed suscipit nulla. Proin tincidunt interdum turpis, in accumsan arcu commodo in. Cras id augue ut massa posuere consectetur sit amet sed mi. Vestibulum nulla orci, tempus id turpis sed, tempus molestie ipsum. Proin sed pulvinar nisi. Mauris sollicitudin ante vel accumsan ultricies. Sed diam purus, accumsan et nisi fermentum, faucibus iaculis arcu. Aenean in enim leo. Aliquam erat volutpat. Etiam sagittis lectus eget elementum condimentum. Duis id nulla in nisi feugiat aliquet mattis et ante. Suspendisse eget eros vel elit vulputate tristique id quis est.`,
    },
    4: say_team`This message will be shown in team chat`,
    5: say_party`This message will be shown in party chat`,
    // assert_1line is an alias for assert_lines(text, 1)
    6: assert_lines(
      `This text is only 1 line of ingame text, an error will be thrown otherwise`,
      1
    ),
    // fill_line / fill_lines will repeat the text with a space added at the end (if it doesn't already exist) as many times as can fit in the requested number of lines (defaults to 1, you can omit it)
    7: say_team(fill_line('F2' /*, 1*/)),
    // emits:
    // say_team "F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2 F2"
  },
  // with `...require('./file')`, you can create mixins.
  // 2: require('./mixin')
  // where ./mixin is: module.exports={1: '1', 2: '2'}
  // will clone 21 and 22 keys from another soundboard
  // or select anything: 2: {1: require('./mixin')[1]} to only clone '1'
};

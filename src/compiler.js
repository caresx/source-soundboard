import {
  DIGITS,
  DIGIT_KEY_MAP,
  MAX_COMMANDS_PER_LINE,
  MAX_COMMAND_LENGTH,
  MAX_LINE_LENGTH,
} from './consts.js';
import { SayCommand } from './symbols.js';

export function soundboardCompiler(sb) {
  let waitLengthNewline = typeof sb.wait == 'number' ? sb.wait : 100;
  const CONSOLE_PREFIX = '';
  let output = `developer 1
con_filter_enable 2
con_filter_text "*****"
con_notifytime 4
alias SSBcout "con_filter_enable 0"
alias SSBendl "con_filter_enable 2"
`;

  traverse(sb, []);
  alias(`SSBreset`, bindDigits(DIGITS));
  // Resets current input and displays root options
  line(bind(0, `+SSBsay_`));
  line(reset());
  return output;

  function line(data) {
    output += `${data}\n`;
  }

  function alias(token, command) {
    if (command.length > MAX_COMMAND_LENGTH) {
      throw new Error(`Line ${command} exceeds Source's max command length`);
    }
    line(`alias ${token} ${wrapCommand(command)}`);
  }
  /**
   * @param {string} command Must be a single command (use an alias if you need multiple commands)
   */
  function bind(key, command) {
    if (command.length > MAX_COMMAND_LENGTH) {
      throw new Error(`Line ${command} exceeds Source's max command length`);
    }
    return `bind ${DIGIT_KEY_MAP[key]} ${command};`;
  }

  function bindDigits(pathDigits) {
    return pathDigits
      .map((pathDigit) => {
        const digits = String(pathDigit);
        return bind(digits.substr(digits.length - 1), `+SSBsay_${digits}`);
      })
      .join('');
  }

  function echo(line) {
    const sanitized = sanitizeLine(line);
    return `echo ${CONSOLE_PREFIX}${sanitized.substr(0, 200)}${
      sanitized.length > 200 ? `... (+${sanitized.length - 200} chrs)` : ''
    }`;
  }

  function echowrap(text) {
    return `${text};SSBendl;`;
  }

  function help(digits) {
    return echowrap(`${digits.map((d) => `SSBhelp_${d}`).join(';')}`);
  }

  function reset() {
    return `SSBreset;`;
  }

  // line can be a string or new String
  function say(line) {
    const text = sanitizeLine(line);
    const messages = [];
    let message = `${reset()}`;
    const words = text.split(' ');
    let i = 0;
    let currentLines = 0;
    const sayCommand = line[SayCommand] || 'say';
    while (i < words.length) {
      if (i !== 0) {
        message += `wait ${waitLengthNewline};`;
      }
      let lineWords = '';
      for (; i < words.length; i += 1) {
        let word = words[i];
        // If the line is a single word (no spaces), try to cut into that word
        if (lineWords.length === 0 && word.length > MAX_LINE_LENGTH) {
          word = words[i] = words[i].substr(0, MAX_LINE_LENGTH);
          i = 0;
          lineWords = word;
          break;
        }
        // Re-add space (removed by split)
        if (lineWords.length) lineWords += ' ';
        // emit say
        if (lineWords.length + word.length > MAX_LINE_LENGTH) {
          break;
        }
        // If the word contains a newline, create a hard break
        if (word.includes('\n')) {
          lineWords += word.substr(0, word.indexOf('\n'));
          word = words[i] = words[i].substr(word.indexOf('\n') + 1);
          break;
        }
        lineWords += word;
        // Split into multiple lines if periods are used and there is a line to go. Try to combine sentences if possible according to line length
        if (i + 1 < words.length) {
          const lastWord = word[word.length - 1];
          // Always send a new message for newlines
          if (lastWord === '\n') {
            break;
          }
          if (lastWord === '.') {
            let nextPeriodLength = 0;
            for (
              let iPeriod = i;
              iPeriod < words.length && nextPeriodLength <= MAX_LINE_LENGTH;
              iPeriod += 1
            ) {
              const iPeriodWord = words[iPeriod];
              // Add 1 for space
              if (nextPeriodLength > 0) nextPeriodLength += 1;
              nextPeriodLength += iPeriodWord.length;
              // Next period found, done
              if (iPeriodWord[iPeriodWord.length - 1] === '.') {
                break;
              }
            }
            if (nextPeriodLength + lineWords.length > MAX_LINE_LENGTH) {
              break;
            }
          }
        }
      }
      lineWords = lineWords.trim();
      if (lineWords.length === 0) {
        break;
      }
      message += `${sayCommand} ${lineWords};`;
      currentLines += 1;
      if (currentLines >= MAX_COMMANDS_PER_LINE) {
        currentLines = 0;
        messages.push(message);
        message = '';
      }
    }
    if (message.length) messages.push(message);
    return messages;
  }

  function notfound(digits) {
    return `${reset()}${echowrap(echo(`[${digits}] unused`))}`;
  }

  function traverse(board, path) {
    const boardPath = path.join('');
    // Only digits assigned a `say`
    const boardDigits = [];
    // All digits, even `notfound` ones.
    const allDigits = [];

    if (board[0]) {
      throw new Error(
        `${[...path, '0'].join('.')}: Digit 0 is reserved for resetting the soundboard`
      );
    }

    for (const digit of DIGITS) {
      const currentPath = [...path, digit];
      const keyDigits = currentPath.join('.');
      const digits = currentPath.join('');
      allDigits.push(digits);
      if (!(digit in board)) {
        alias(`+SSBsay_${digits}`, `SSBcout;`);
        alias(`-SSBsay_${digits}`, notfound(digits));
        continue;
      }
      const value = board[digit];

      // Either raw strings or values from global helper functions (which add symbols to a `new String`)
      if (typeof value === 'string' || value instanceof String) {
        sound(value, currentPath);
      } else if (value && typeof value === 'object') {
        const documentation = typeof value._ === 'string' && value._;
        alias(
          `SSBhelp_${digits}`,
          echo(
            `[${digits}] ${
              documentation || DIGITS.filter((d) => d in value).length + ' lines'
            }`
          )
        );
        traverse(value, currentPath);
      } else {
        throw new Error(`soundboard.${keyDigits}: Not a string or object`);
      }
      boardDigits.push(digits);
    }

    boardDigits.sort();
    alias(`+SSBsay_${boardPath}`, `SSBcout`);
    alias(
      `-SSBsay_${boardPath}`,
      // SSBreset is already `bindDigits(DIGITS)`. This makes the script a tiny bit shorter.
      `${boardPath ? bindDigits(allDigits) : reset()}${help(boardDigits)}`
    );
    return boardDigits;
  }

  // text can be a string or new String
  function sound(text, path) {
    const digits = path.join('');
    const saycode = say(text);
    const lineCount = saycode.join('').split(';wait').length;
    if (saycode.length === 1) {
      alias(`+SSBsay_${digits}`, saycode[0]);
    } else {
      for (let i = 0; i < saycode.length; i += 1) {
        alias(
          `ssbs_${digits}_${i}`,
          saycode[i] +
            // Call the next fn (if it will be defined)
            `${i === saycode.length - 1 ? '' : `ssbs_${digits}_${i + 1}`}`
        );
      }
      alias(`+SSBsay_${digits}`, `ssbs_${digits}_0`);
    }
    alias(`-SSBsay_${digits}`, ``);
    alias(
      `SSBhelp_${digits}`,
      echo(
        `[${digits}]${lineCount > 1 ? ` {${lineCount} lines}` : ''} ${text.replace(
          /\n/g,
          ' '
        )}`
      )
    );
  }

  function sanitizeLine(line) {
    return (
      line
        .trim()
        .replace(/  /g, ' ')
        // There is no way to escape these characters in a .cfg
        .replace(/"/g, "''")
        // Terminates current command; we can't use quotes inside an alias so these have to be stripped
        .replace(/;/g, '')
        // '//' creates a comment, even inside a string
        .replace(/\/\//g, '/ /')
    );
  }

  function wrapCommand(command) {
    if (!command) return '""';
    // Remove trailing ;
    if (command[command.length - 1] === ';') {
      command = command.substr(0, command.length - 1);
    }
    if (command.includes(' ') || command.includes(';')) {
      return '"' + command + '"';
    }
    return command;
  }
}

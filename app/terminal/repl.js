import { ansi, paint } from "./colors";
import { commands, execCommand } from "./commands";

const PROMPT = "\u276f ";

const needsScrollback = (cmd) =>
  !cmd.dialog && !cmd.game && !cmd.exit;

export function runRepl({ scrollback, inputController, state }) {
  const writePrompt = () => inputController.writePrompt(PROMPT);
  const echo = (line) => scrollback.writeln(paint(ansi.green, PROMPT) + line);
  let gameMode = false;

  const onGameOpen = () => {
    gameMode = true;
    writePrompt();
  };

  const onGameClose = () => {
    gameMode = false;
    writePrompt();
  };

  window.addEventListener("termo:game", onGameOpen);
  window.addEventListener("termo:game-close", onGameClose);

  const gameError = (text) => {
    window.dispatchEvent(
      new CustomEvent("termo:game-error", { detail: { text } }),
    );
  };

  const handleCommand = async (name, line) => {
    const cmd = commands[name];
    if (!cmd) {
      if (gameMode) {
        gameError(`/${name}: comando desconhecido`);
      } else {
        echo(line);
        scrollback.writeln(`/${name}: command not found`);
        writePrompt();
      }
      return;
    }

    if (cmd.exit) {
      if (gameMode) {
        window.dispatchEvent(new CustomEvent("termo:exit-game"));
      }
      return;
    }

    if (gameMode && needsScrollback(cmd)) {
      gameError("saia do jogo primeiro (/exit)");
      return;
    }

    if (!cmd.dialog && !cmd.game && cmd.echo !== false) echo(line);

    const output = await execCommand(cmd, state);
    if (output != null) scrollback.writeln(output);
    if (!cmd.game) writePrompt();
  };

  const onCommand = async (line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (!gameMode) writePrompt();
      return;
    }

    // Slash command
    if (trimmed.startsWith("/")) {
      const [name] = trimmed.slice(1).split(/\s+/);
      if (!name) {
        if (!gameMode) writePrompt();
        return;
      }
      await handleCommand(name, trimmed);
      writePrompt();
      return;
    }

    // During game: anything without / is a guess
    if (gameMode) {
      window.dispatchEvent(
        new CustomEvent("termo:guess", { detail: { word: trimmed } }),
      );
      writePrompt();
      return;
    }

    // Outside game: must use /
    echo(line);
    scrollback.writeln(`${trimmed}: command not found. use /help`);
    writePrompt();
  };

  inputController.setMode("repl");
  inputController.setOnCommand(onCommand);
  writePrompt();
}

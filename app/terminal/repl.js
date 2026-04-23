import { ansi, paint } from "./colors";
import { commands, execCommand } from "./commands";

const PROMPT = "\u276f ";

export function runRepl({ scrollback, inputController, state }) {
  const writePrompt = () => inputController.writePrompt(PROMPT);
  const echo = (line) => scrollback.writeln(paint(ansi.green, PROMPT) + line);
  let gameMode = false;

  const onGameOpen = () => {
    gameMode = true;
    inputController.writePrompt("");
  };

  const onGameClose = () => {
    gameMode = false;
    writePrompt();
  };

  window.addEventListener("termo:game", onGameOpen);
  window.addEventListener("termo:game-close", onGameClose);

  const onCommand = async (line) => {
    if (gameMode) {
      window.dispatchEvent(
        new CustomEvent("termo:guess", { detail: { word: line } }),
      );
      inputController.writePrompt("");
      return;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      writePrompt();
      return;
    }

    const [name] = trimmed.split(/\s+/);

    const cmd = commands[name];
    if (!cmd) {
      echo(line);
      scrollback.writeln(`${name}: command not found`);
      writePrompt();
      return;
    }

    if (cmd.builtin && name === "clear") {
      scrollback.clear();
      writePrompt();
      return;
    }

    if (!cmd.dialog && !cmd.game && cmd.echo !== false) echo(line);

    const output = await execCommand(cmd, state);
    if (output != null) scrollback.writeln(output);
    if (!cmd.game) writePrompt();
  };

  inputController.setMode("repl");
  inputController.setOnCommand(onCommand);
  writePrompt();
}

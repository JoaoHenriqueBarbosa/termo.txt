import { ansi, paint } from "./colors";
import { commands, execCommand } from "./commands";

const PROMPT = "\u276f ";

export function runRepl({ scrollback, inputController, state }) {
  const writePrompt = () => inputController.writePrompt(PROMPT);
  const echo = (line) => scrollback.writeln(paint(ansi.green, PROMPT) + line);

  const onCommand = async (line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      writePrompt();
      return;
    }

    const [name, ...rest] = trimmed.split(/\s+/);

    if (name === "clear") {
      scrollback.clear();
      writePrompt();
      return;
    }

    const cmd = commands[name];
    if (!cmd) {
      echo(line);
      scrollback.writeln(`${name}: command not found`);
      writePrompt();
      return;
    }

    if (!cmd.dialog && cmd.echo !== false) echo(line);

    const output = await execCommand(cmd, state);
    if (output != null) scrollback.writeln(output);
    writePrompt();
  };

  inputController.setMode("repl");
  inputController.setOnCommand(onCommand);
  writePrompt();
}

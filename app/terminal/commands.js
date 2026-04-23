import { ansi, paint } from "./colors";
import { authClient } from "../lib/authClient";
import { loadTheme, DEFAULT_THEME } from "../lib/themes";

const openDialog = (event) => {
  window.dispatchEvent(new CustomEvent(event, { detail: { open: true } }));
};

export const commands = {
  help: {
    desc: "mostra os comandos disponíveis",
    echo: true,
    run: () => {
      const pad = Math.max(...Object.keys(commands).map((k) => k.length)) + 3;
      return Object.entries(commands)
        .map(([name, cmd]) => {
          const padded = ("/" + name).padEnd(pad);
          return `  ${paint(ansi.green, padded)}${paint(ansi.dim, cmd.desc)}`;
        })
        .join("\r\n");
    },
  },
  whoami: {
    desc: "mostra o usuário atual",
    echo: true,
    run: (state) => state.userName || "guest",
  },
  theme: {
    desc: "abre o seletor de temas",
    dialog: "termo:themes",
  },
  config: {
    desc: "abre as configurações",
    dialog: "termo:config",
  },
  termo: {
    desc: "inicia o jogo do dia",
    game: "termo:game",
  },
  exit: {
    desc: "sai do jogo",
    exit: true,
  },
  clear: {
    desc: "limpa o terminal",
    builtin: true,
  },
  logout: {
    desc: "encerra a sessão",
    echo: true,
    run: async (state) => {
      await authClient.logout();
      state.user = null;
      state.userName = "";
      loadTheme(DEFAULT_THEME).then((palette) => {
        window.dispatchEvent(
          new CustomEvent("termo:theme", { detail: { name: DEFAULT_THEME, palette } }),
        );
      }).catch(() => {});
      return "logged out. reload to start over.";
    },
  },
};

export function execCommand(cmd, state) {
  if (cmd.dialog) {
    openDialog(cmd.dialog);
    return null;
  }
  if (cmd.game) {
    openDialog(cmd.game);
    return null;
  }
  return cmd.run(state);
}

import { authClient } from "../lib/authClient";

const openDialog = (event) => {
  window.dispatchEvent(new CustomEvent(event, { detail: { open: true } }));
};

export const commands = {
  whoami: {
    echo: true,
    run: (state) => state.userName || "guest",
  },
  logout: {
    echo: true,
    run: async (state) => {
      await authClient.logout();
      state.user = null;
      state.userName = "";
      return "logged out. reload to start over.";
    },
  },
  config: {
    dialog: "termo:config",
  },
  theme: {
    dialog: "termo:themes",
  },
};

export function execCommand(cmd, state) {
  if (cmd.dialog) {
    openDialog(cmd.dialog);
    return null;
  }
  return cmd.run(state);
}

import { cookies } from "next/headers";
import { getCurrentUser } from "./lib/session";
import TerminalView from "./components/TerminalView";
import { DEFAULT_THEME } from "./lib/themes";

export default async function Page() {
  const user = await getCurrentUser();
  const store = await cookies();
  const theme = store.get("theme")?.value || user?.theme || DEFAULT_THEME;
  return (
    <>
      <link
        id="termo-theme"
        rel="stylesheet"
        href={`/themes/css/${encodeURIComponent(theme)}.css`}
      />
      <TerminalView initialUser={user} />
    </>
  );
}

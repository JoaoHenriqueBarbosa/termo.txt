import { getCurrentUser } from "./lib/session";
import TerminalView from "./components/TerminalView";

export default async function Page() {
  const user = await getCurrentUser();
  return <TerminalView initialUser={user} />;
}

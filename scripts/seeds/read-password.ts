import { emitKeypressEvents } from "node:readline";
import { SeedGuardError } from "./dennis-portfolio";
export async function readPassword(): Promise<string> {
  if (!process.stdin.isTTY || !process.stdin.setRawMode)
    throw new SeedGuardError(
      "Run this command in an interactive terminal so the password can be entered privately.",
    );
  process.stdout.write("Enter the password you supplied for Dennis (hidden): ");
  emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return new Promise((resolve, reject) => {
    let value = "";
    function finish(error?: Error) {
      process.stdin.setRawMode(false);
      process.stdin.removeListener("keypress", key);
      process.stdin.pause();
      process.stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
      value = "";
    }
    function key(
      text: string,
      event: { name?: string; ctrl?: boolean; meta?: boolean },
    ) {
      if (event.ctrl && event.name === "c")
        return finish(new SeedGuardError("Cancelled. No changes made."));
      if (event.name === "return" || event.name === "enter") return finish();
      if (event.name === "backspace") {
        value = value.slice(0, -1);
        return;
      }
      if (text && !event.ctrl && !event.meta && !text.includes("\u001b"))
        value += text;
    }
    process.stdin.on("keypress", key);
  });
}

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerEditTool } from "./src/edit";
import { registerBashTool } from "./src/bash";
import { registerWriteTool } from "./src/write";
import { registerReadTool, setReadIntentEnabled, getReadIntentEnabled } from "./src/read";

const COMMAND_NAME = "pi-tool-intent-read";

export default function register(pi: ExtensionAPI): void {
  // Always register the core intent tools
  registerWriteTool(pi);
  registerEditTool(pi);
  registerBashTool(pi);

  // Register the read tool (always available; intent/rationale are optional by default)
  registerReadTool(pi, process.cwd());

  // Register the slash command to toggle read-intent mode
  pi.registerCommand(COMMAND_NAME, {
    description: "Toggle read-intent mode on or off. When enabled, read calls require intent and rationale.",
    handler(_args, ctx) {
      const newValue = !getReadIntentEnabled();
      setReadIntentEnabled(newValue);
      const status = newValue ? "enabled" : "disabled";
      ctx.ui.notify(`read-intent mode is now ${status}.`);
    },
  });
}

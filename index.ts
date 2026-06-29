import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerEditTool } from "./src/edit";
import { registerBashTool } from "./src/bash";
import { registerWriteTool } from "./src/write";
import { registerReadTool } from "./src/read";

export default function register(pi: ExtensionAPI): void {
  // Always register the core intent tools — intent/rationale are mandatory on all of them
  registerWriteTool(pi);
  registerEditTool(pi);
  registerBashTool(pi);
  registerReadTool(pi, process.cwd());
}

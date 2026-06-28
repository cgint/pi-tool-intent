import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerEditTool } from "./src/edit";
import { registerBashTool } from "./src/bash";
import { registerWriteTool } from "./src/write";

export default function register(pi: ExtensionAPI): void {
  registerWriteTool(pi);
  registerEditTool(pi);
  registerBashTool(pi);
}
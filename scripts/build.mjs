import { existsSync, realpathSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createConnection } from "node:net";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const outputDirs = [resolve(projectRoot, ".next"), resolve(projectRoot, ".next-msm")];

function isPortListening(port) {
  return new Promise((resolvePort) => {
    const socket = createConnection({ port, host: "127.0.0.1" });
    socket.once("connect", () => {
      socket.destroy();
      resolvePort(true);
    });
    socket.once("error", () => resolvePort(false));
    socket.setTimeout(900, () => {
      socket.destroy();
      resolvePort(false);
    });
  });
}

if (await isPortListening(3000)) {
  console.error("MSM MY STORE ya esta corriendo en localhost:3000.");
  console.error("Cierra el servidor local con Ctrl + C antes de ejecutar build, o usa reset-local.cmd para arrancar limpio.");
  process.exit(1);
}

for (const outputDir of outputDirs) {
  if (existsSync(outputDir)) {
    const realOutput = realpathSync(outputDir);
    if (!realOutput.startsWith(projectRoot)) {
      throw new Error(`Refusing to remove build output outside project: ${realOutput}`);
    }
    rmSync(realOutput, { recursive: true, force: true });
  }
}

const nextCli = resolve(projectRoot, "node_modules", "next", "dist", "bin", "next");
const result = spawnSync(process.execPath, [nextCli, "build"], {
  cwd: projectRoot,
  stdio: "inherit",
  env: process.env
});

process.exit(result.status ?? 1);

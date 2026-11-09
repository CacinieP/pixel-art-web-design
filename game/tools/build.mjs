import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const file of ["index.html", "tokens.css", "components.css"]) {
  await cp(join(root, file), join(dist, file));
}
for (const dir of ["src", "sprites", "fonts"]) {
  await cp(join(root, dir), join(dist, dir), { recursive: true });
}
console.log("Built dist/");
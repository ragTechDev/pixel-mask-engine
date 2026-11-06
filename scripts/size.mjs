// Reports gzipped size of each entry including the shared chunks it imports.
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

function collect(file, seen = new Set()) {
  if (seen.has(file)) return seen;
  seen.add(file);
  const src = readFileSync(`dist/${file}`, "utf8");
  for (const m of src.matchAll(/(?:from|import)\s*["']\.\/([^"']+)["']/g)) collect(m[1], seen);
  return seen;
}
const gz = (files) => {
  const code = [...files].map((f) => readFileSync(`dist/${f}`, "utf8")).join("\n");
  return `${Buffer.byteLength(code)} B min, ${gzipSync(code, { level: 9 }).length} B gzip`;
};
const all = new Set();
for (const entry of ["index.js", "canvas.js", "react.js"]) {
  const files = collect(entry);
  files.forEach((f) => all.add(f));
  console.log(entry.padEnd(10), gz(files));
}
console.log("total".padEnd(10), gz(all));

import { resolve } from "node:path";
import { bootstrap } from "@glubean/runner";
import { extractContractsFromProject } from "@glubean/scanner";
import { openapiArtifact, renderArtifact } from "@glubean/sdk";

const titleIndex = process.argv.indexOf("--title");
const title = titleIndex >= 0 ? process.argv[titleIndex + 1] : "Glubean Cookbook API";
const dirIndex = process.argv.indexOf("--dir");
const dir = resolve(dirIndex >= 0 ? process.argv[dirIndex + 1] : process.cwd());

await bootstrap(dir);
const result = await extractContractsFromProject(dir);
const spec = renderArtifact(openapiArtifact, result.contracts, { title });

function normalize(value, seen = new WeakSet()) {
  if (value === null || typeof value !== "object") return value;

  if (typeof value.safeParse === "function" && typeof value.toJSONSchema === "function") {
    return value.toJSONSchema();
  }

  if (seen.has(value)) return undefined;
  seen.add(value);

  if (Array.isArray(value)) {
    const out = value.map((item) => normalize(item, seen));
    seen.delete(value);
    return out;
  }

  const out = {};
  for (const [key, child] of Object.entries(value)) {
    const normalized = normalize(child, seen);
    if (normalized !== undefined) out[key] = normalized;
  }

  seen.delete(value);
  return out;
}

process.stdout.write(`${JSON.stringify(normalize(spec), null, 2)}\n`);

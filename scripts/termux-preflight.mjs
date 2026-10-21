#!/usr/bin/env node
/**
 * Read-only Termux/Android preflight for the OpenMausBot headless prototype.
 * It does not install packages, edit project files, or print environment secrets.
 */
import { createRequire } from "node:module";
import { DatabaseSync } from "node:sqlite";
import { arch, homedir, platform, tmpdir } from "node:os";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
const checks = [];
const add = (name, status, detail) => checks.push({ name, status, detail });
const major = Number(process.versions.node.split(".")[0]);
const prefix = process.env.PREFIX ?? "";
const termux = Boolean(process.env.TERMUX_VERSION) ||
  prefix.includes("com.termux") ||
  existsSync("/data/data/com.termux/files/usr");

add("runtime", major >= 24 ? "PASS" : "BLOCKED",
  "Node " + process.versions.node + "; upstream package.json requires Node >=24");
add("environment", termux ? "DETECTED" : "NOT_DETECTED",
  "platform=" + platform() + " arch=" + arch() + " termuxPrefix=" + (prefix ? "set" : "unset"));
add("architecture", arch() === "arm64" ? "EXPECTED" : "CHECK",
  "process.arch=" + arch() + "; Galaxy A15 is expected to be ARM64");

try {
  const db = new DatabaseSync(":memory:");
  db.exec("CREATE VIRTUAL TABLE termux_probe USING fts5(content)");
  db.prepare("INSERT INTO termux_probe(content) VALUES (?)").run("openmausbot fts check");
  const row = db.prepare("SELECT content FROM termux_probe WHERE termux_probe MATCH ?").get("fts");
  db.close();
  add("node:sqlite + FTS5", row?.content ? "PASS" : "BLOCKED",
    row?.content ? "In-memory SQLite and FTS5 virtual table worked" : "FTS5 query returned no row");
} catch (error) {
  add("node:sqlite + FTS5", "BLOCKED", String(error?.message ?? error).split("\n")[0]);
}

try {
  const directory = mkdtempSync(join(tmpdir(), "omb-termux-probe-"));
  const file = join(directory, "write-test.txt");
  writeFileSync(file, "ok");
  const ok = existsSync(file);
  rmSync(directory, { recursive: true, force: true });
  add("filesystem write", ok ? "PASS" : "BLOCKED", "Temporary file write/read check");
} catch (error) {
  add("filesystem write", "BLOCKED", String(error?.message ?? error).split("\n")[0]);
}

for (const name of ["electron", "@duckdb/node-api", "@resvg/resvg-js", "@trycua/cua-driver"]) {
  try {
    const resolved = require.resolve(name);
    add("optional dependency: " + name, "PRESENT", resolved);
  } catch {
    add("optional dependency: " + name, "NOT_FOUND", "Not resolvable from the current checkout; may be optional");
  }
}

for (const binary of ["pnpm", "git", "curl", "chromium", "google-chrome", "termux-wake-lock"]) {
  const result = spawnSync("sh", ["-lc", "command -v " + binary], { encoding: "utf8" });
  const found = result.status === 0 ? result.stdout.trim() : "";
  add("command: " + binary, found ? "PRESENT" : "NOT_FOUND", found || "Not found on PATH");
}

const report = {
  generatedAt: new Date().toISOString(),
  node: process.versions.node,
  platform: platform(),
  arch: arch(),
  isTermux: termux,
  home: homedir(),
  checks,
  verdict: checks.some((c) => c.status === "BLOCKED")
    ? "BLOCKED: resolve runtime/SQLite/filesystem blockers before attempting the server"
    : termux
      ? "PREFLIGHT PASSED: this is not proof the full server works; run the headless smoke test next"
      : "PREFLIGHT PARTIAL: run this script inside Termux on the Galaxy A15 for device-specific evidence",
};
console.log(JSON.stringify(report, null, 2));
if (checks.some((c) => c.status === "BLOCKED")) process.exitCode = 1;

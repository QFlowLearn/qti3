import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";

test.each([
  { extraManager: "", extraWorkspace: "", unreviewed: "" },
  {
    extraManager: "unreviewed-manager@1.0.0",
    extraWorkspace: "",
    unreviewed: "unreviewed-manager@1.0.0",
  },
  {
    extraManager: "",
    extraWorkspace: "unreviewed-library@1.0.0",
    unreviewed: "unreviewed-library@1.0.0",
  },
])(
  "checks every pnpm lockfile document: $unreviewed",
  async ({ extraManager, extraWorkspace, unreviewed }) => {
    const root = await mkdtemp(join(tmpdir(), "qti3-dependency-policy-"));
    try {
      await mkdir(join(root, "scripts"));
      await mkdir(join(root, "packages/core"), { recursive: true });
      await cp(
        new URL("../../scripts/check-dependencies.mjs", import.meta.url),
        join(root, "scripts/check-dependencies.mjs"),
      );
      await writeFile(
        join(root, "package.json"),
        JSON.stringify({ packageManager: "pnpm@12.21.0" }),
      );
      await writeFile(
        join(root, "packages/core/package.json"),
        JSON.stringify({ name: "fixture-core" }),
      );
      await writeFile(
        join(root, "scripts/dependency-policy.json"),
        JSON.stringify({
          packageManager: "pnpm@12.21.0",
          directDependencies: {
            ".": { dependencies: {}, devDependencies: {} },
            "packages/core": { dependencies: {}, devDependencies: {} },
          },
          lockfilePackages: ["pnpm@12.21.0", "reviewed-library@1.0.0"],
        }),
      );
      const managerEntry = extraManager ? `  ${extraManager}:\n    resolution: {}\n` : "";
      const workspaceEntry = extraWorkspace ? `  ${extraWorkspace}:\n    resolution: {}\n` : "";
      await writeFile(
        join(root, "pnpm-lock.yaml"),
        `---
lockfileVersion: '9.0'
packages:
  pnpm@12.21.0:
    resolution: {}
${managerEntry}snapshots: {}
---
lockfileVersion: '9.0'
packages:
  reviewed-library@1.0.0:
    resolution: {}
${workspaceEntry}snapshots: {}
`,
      );
      const result = spawnSync(process.execPath, [join(root, "scripts/check-dependencies.mjs")], {
        encoding: "utf8",
      });
      if (unreviewed) {
        expect(result.status).toBe(1);
        expect(result.stderr).toContain(`unreviewed package ${unreviewed}`);
      } else {
        expect(result.stderr).toBe("");
        expect(result.status).toBe(0);
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);

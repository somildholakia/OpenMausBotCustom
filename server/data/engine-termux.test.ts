import { describe, expect, it } from "vitest";

import { createDataEngine } from "./engine.ts";

describe("Termux headless data feature gate", () => {
  it("does not attempt to load native DuckDB when OMB_TERMUX_HEADLESS is enabled", async () => {
    const engine = createDataEngine({
      env: {
        OMB_TERMUX_HEADLESS: "1",
        OMB_DUCKDB_DIR: "/path/that/should/not/be/read",
      },
    });

    expect(engine.unavailable()).toContain("Data tools are disabled by OMB_TERMUX_HEADLESS=1");
    await expect(engine.forBot("test-bot")).rejects.toMatchObject({
      code: "engine_unavailable",
    });
    await engine.closeAll();
  });
});

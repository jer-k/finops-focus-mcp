import { describe, expect, it } from "vitest";
import { z } from "zod";

// Replicate the input schema to test it independently of the tool registration
const createDatasetSchema = z.object({
  name: z.string(),
  focusVersion: z.enum(["1.0", "1.1", "1.2", "1.3"]),
  datasetType: z.enum(["cost_and_usage", "contract_commitment"]),
});

describe("create_focus_dataset input schema", () => {
  it("accepts cost_and_usage for v1.0", () => {
    const result = createDatasetSchema.safeParse({
      name: "My Dataset",
      focusVersion: "1.0",
      datasetType: "cost_and_usage",
    });
    expect(result.success).toBe(true);
  });

  it("accepts cost_and_usage for all versions", () => {
    for (const version of ["1.0", "1.1", "1.2", "1.3"] as const) {
      const result = createDatasetSchema.safeParse({
        name: "Test",
        focusVersion: version,
        datasetType: "cost_and_usage",
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts contract_commitment for v1.3", () => {
    const result = createDatasetSchema.safeParse({
      name: "CC Dataset",
      focusVersion: "1.3",
      datasetType: "contract_commitment",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown datasetType", () => {
    const result = createDatasetSchema.safeParse({
      name: "Bad",
      focusVersion: "1.0",
      datasetType: "unknown_type",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown focusVersion", () => {
    const result = createDatasetSchema.safeParse({
      name: "Bad",
      focusVersion: "2.0",
      datasetType: "cost_and_usage",
    });
    expect(result.success).toBe(false);
  });
});

// The runtime guard (contract_commitment only valid for v1.3) is enforced in the tool handler,
// not in the Zod schema itself. Test the guard logic directly.
describe("create_focus_dataset contract_commitment guard", () => {
  function applyGuard(focusVersion: string, datasetType: string): boolean {
    return datasetType === "contract_commitment" && focusVersion !== "1.3";
  }

  it("flags contract_commitment + v1.0 as invalid", () => {
    expect(applyGuard("1.0", "contract_commitment")).toBe(true);
  });

  it("flags contract_commitment + v1.1 as invalid", () => {
    expect(applyGuard("1.1", "contract_commitment")).toBe(true);
  });

  it("flags contract_commitment + v1.2 as invalid", () => {
    expect(applyGuard("1.2", "contract_commitment")).toBe(true);
  });

  it("allows contract_commitment + v1.3", () => {
    expect(applyGuard("1.3", "contract_commitment")).toBe(false);
  });

  it("allows cost_and_usage for any version", () => {
    for (const v of ["1.0", "1.1", "1.2", "1.3"]) {
      expect(applyGuard(v, "cost_and_usage")).toBe(false);
    }
  });
});

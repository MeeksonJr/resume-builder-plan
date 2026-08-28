import { describe, it, expect } from "vitest";
import { cn, hexToHsl } from "./utils";

describe("cn utility", () => {
  it("should merge class names correctly", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500"); // Tailwind merge behavior
  });
});

describe("hexToHsl utility", () => {
  it("should convert hex colors to HSL channel strings", () => {
    // Pure Red: #ff0000
    expect(hexToHsl("#ff0000")).toBe("0.0 100.0% 50.0%");
    // Pure White: #ffffff
    expect(hexToHsl("#ffffff")).toBe("0.0 0.0% 100.0%");
    // Pure Black: #000000
    expect(hexToHsl("#000000")).toBe("0.0 0.0% 0.0%");
  });
});

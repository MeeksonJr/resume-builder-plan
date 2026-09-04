import { describe, it, expect } from "vitest";
import { cn, hexToHsl, formatCanvasCourseDisplay } from "./utils";

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

describe("formatCanvasCourseDisplay", () => {
  it("cleans long university Canvas SIS names into human-readable code and title", () => {
    const res1 = formatCanvasCourseDisplay({
      course_code: "202420_SPRING_CS252_23245",
      name: "202420_SPRING_CS252_23245 INTRO TO UNIX FOR PROGRAMMERS",
    });
    expect(res1.shortCode).toBe("CS 252");
    expect(res1.cleanTitle).toBe("Intro to UNIX for Programmers");
    expect(res1.term).toBe("Spring 2024");

    const res2 = formatCanvasCourseDisplay({
      course_code: "202420_SPRING_CS260_32079",
      name: "202420_SPRING_CS260_32079 C++ FOR PROGRAMMERS",
    });
    expect(res2.shortCode).toBe("CS 260");
    expect(res2.cleanTitle).toBe("C++ for Programmers");

    const res3 = formatCanvasCourseDisplay({
      course_code: "202510_FALL_CS312_14125",
      name: "202510_FALL_CS312_14125 INTERNET CONCEPTS",
    });
    expect(res3.shortCode).toBe("CS 312");
    expect(res3.cleanTitle).toBe("Internet Concepts");
    expect(res3.term).toBe("Fall 2025");
  });

  it("handles standard course format cleanly", () => {
    const res = formatCanvasCourseDisplay({
      course_code: "BIO 110",
      name: "BIO 110: Principles of Biology",
    });
    expect(res.shortCode).toBe("BIO 110");
    expect(res.cleanTitle).toBe("Principles of Biology");
  });
});

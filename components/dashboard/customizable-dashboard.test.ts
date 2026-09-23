import { describe, it, expect } from "vitest";
import {
  getSizeColSpanClass,
  getSizeLabel,
  getNextSize,
  WIDGET_METADATA,
  DEFAULT_DASHBOARD_LAYOUT,
  WidgetSize,
} from "./dashboard-widgets-registry";

describe("Customizable Dashboard Widgets Registry & Layout Engine", () => {
  it("should have all 10 core widgets defined in WIDGET_METADATA with valid configuration", () => {
    const widgetIds = Object.keys(WIDGET_METADATA);
    expect(widgetIds).toHaveLength(10);
    expect(widgetIds).toContain("hero");
    expect(widgetIds).toContain("quick-actions");
    expect(widgetIds).toContain("onboarding");
    expect(widgetIds).toContain("resumes");
    expect(widgetIds).toContain("analytics");
    expect(widgetIds).toContain("job-recs");
    expect(widgetIds).toContain("canvas-courses");
    expect(widgetIds).toContain("career-swarm");
    expect(widgetIds).toContain("applications-pipeline");
    expect(widgetIds).toContain("salary-benchmarks");

    for (const [id, meta] of Object.entries(WIDGET_METADATA)) {
      expect(meta.id).toBe(id);
      expect(meta.title).toBeTruthy();
      expect(meta.description).toBeTruthy();
      expect(meta.availableSizes.length).toBeGreaterThan(0);
      expect(meta.availableSizes).toContain(meta.defaultSize);
    }
  });

  it("should default to all 10 widgets visible in DEFAULT_DASHBOARD_LAYOUT", () => {
    expect(DEFAULT_DASHBOARD_LAYOUT).toHaveLength(10);
    const visibleCount = DEFAULT_DASHBOARD_LAYOUT.filter((w) => w.visible).length;
    expect(visibleCount).toBe(10);
  });

  it("should map widget sizes to valid CSS grid column classes", () => {
    expect(getSizeColSpanClass("third")).toBe("col-span-12 md:col-span-6 lg:col-span-4");
    expect(getSizeColSpanClass("half")).toBe("col-span-12 md:col-span-6");
    expect(getSizeColSpanClass("wide")).toBe("col-span-12 lg:col-span-8");
    expect(getSizeColSpanClass("full")).toBe("col-span-12");
  });

  it("should return human readable size labels", () => {
    expect(getSizeLabel("third")).toBe("1/3 Width");
    expect(getSizeLabel("half")).toBe("1/2 Width");
    expect(getSizeLabel("wide")).toBe("2/3 Width");
    expect(getSizeLabel("full")).toBe("Full Width");
  });

  it("should cycle correctly between allowed sizes", () => {
    const allowed: WidgetSize[] = ["third", "half", "wide", "full"];
    expect(getNextSize("third", allowed)).toBe("half");
    expect(getNextSize("half", allowed)).toBe("wide");
    expect(getNextSize("wide", allowed)).toBe("full");
    expect(getNextSize("full", allowed)).toBe("third");

    const restricted: WidgetSize[] = ["half", "full"];
    expect(getNextSize("half", restricted)).toBe("full");
    expect(getNextSize("full", restricted)).toBe("half");
  });
});

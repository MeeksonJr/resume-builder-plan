"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  GripVertical,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Check,
  Maximize2,
  Minimize2,
  EyeOff,
  Eye,
  Sparkles,
  Palette,
  LayoutGrid,
  ChevronUp,
  ChevronDown,
  Info,
  Radio,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  DashboardWidgetId,
  DashboardWidgetConfig,
  DashboardDataContext,
  DEFAULT_DASHBOARD_LAYOUT,
  WIDGET_METADATA,
  getSizeColSpanClass,
  getSizeLabel,
  getNextSize,
  renderDashboardWidget,
  WidgetSize,
} from "./dashboard-widgets-registry";

const STORAGE_KEY = "resumeforge_dashboard_layout_v2";
const DASHBOARD_STYLE_KEY = "dashboard-style";

const DASHBOARD_STYLES = [
  { id: "executive", name: "Executive Swiss", desc: "Default high-contrast editorial balance" },
  { id: "minimal", name: "Minimalist Studio", desc: "Monochrome, ultra-clean hairline borders" },
  { id: "glass", name: "Liquid Glass", desc: "Translucent frosted glass with ambient glow" },
  { id: "creative", name: "Creative Bento", desc: "Playful rounded bento-box grid cards" },
  { id: "terminal", name: "Pro Telemetry", desc: "Cyber terminal with live telemetry pulse" },
];

export function CustomizableDashboardView(props: DashboardDataContext) {
  const [layout, setLayout] = useState<DashboardWidgetConfig[]>(DEFAULT_DASHBOARD_LAYOUT);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<string>("executive");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("Just now");

  // Load layout and aesthetic style from localStorage
  useEffect(() => {
    setIsHydrated(true);
    try {
      const savedLayout = localStorage.getItem(STORAGE_KEY);
      if (savedLayout) {
        const parsed = JSON.parse(savedLayout);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with DEFAULT_DASHBOARD_LAYOUT in case new widgets were added
          const existingIds = new Set(parsed.map((p) => p.id));
          const missing = DEFAULT_DASHBOARD_LAYOUT.filter((d) => !existingIds.has(d.id));
          setLayout([...parsed, ...missing]);
        }
      }

      const savedStyle = localStorage.getItem(DASHBOARD_STYLE_KEY) || "executive";
      setCurrentStyle(savedStyle);
      document.documentElement.setAttribute("data-dashboard-style", savedStyle);
    } catch (e) {
      console.error("Error loading dashboard layout:", e);
    }

    // Listen to real-time style changes from /dashboard/settings/appearance
    const handleStyleChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ style: string }>;
      const newStyle = customEvent.detail?.style || localStorage.getItem(DASHBOARD_STYLE_KEY) || "executive";
      setCurrentStyle(newStyle);
    };

    window.addEventListener("dashboard-style-changed", handleStyleChange);
    return () => {
      window.removeEventListener("dashboard-style-changed", handleStyleChange);
    };
  }, []);

  // Update timer display
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setLastSyncedTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const saveLayout = (newLayout: DashboardWidgetConfig[]) => {
    setLayout(newLayout);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
    } catch (e) {
      console.error("Failed to save layout to localStorage", e);
    }
  };

  const handleStyleChange = (styleId: string) => {
    setCurrentStyle(styleId);
    try {
      localStorage.setItem(DASHBOARD_STYLE_KEY, styleId);
      document.documentElement.setAttribute("data-dashboard-style", styleId);
      window.dispatchEvent(
        new CustomEvent("dashboard-style-changed", { detail: { style: styleId } })
      );
      toast.success(`Dashboard aesthetic switched to ${DASHBOARD_STYLES.find(s => s.id === styleId)?.name}`);
    } catch (e) {
      console.error("Failed to set dashboard style", e);
    }
  };

  const handleResetLayout = () => {
    saveLayout(DEFAULT_DASHBOARD_LAYOUT);
    toast.success("Dashboard layout restored to default view.");
  };

  const toggleWidgetVisibility = (id: DashboardWidgetId) => {
    const updated = layout.map((item) =>
      item.id === id ? { ...item, visible: !item.visible } : item
    );
    saveLayout(updated);
    toast.info(`Updated visibility for ${WIDGET_METADATA[id]?.title || id}`);
  };

  const cycleWidgetSize = (id: DashboardWidgetId) => {
    const meta = WIDGET_METADATA[id];
    if (!meta) return;
    const current = layout.find((item) => item.id === id);
    if (!current) return;

    const next = getNextSize(current.size, meta.availableSizes);
    const updated = layout.map((item) =>
      item.id === id ? { ...item, size: next } : item
    );
    saveLayout(updated);
    toast.success(`${meta.title} resized to ${getSizeLabel(next)}`);
  };

  const setSpecificWidgetSize = (id: DashboardWidgetId, newSize: WidgetSize) => {
    const meta = WIDGET_METADATA[id];
    const updated = layout.map((item) =>
      item.id === id ? { ...item, size: newSize } : item
    );
    saveLayout(updated);
    toast.success(`${meta?.title || id} resized to ${getSizeLabel(newSize)}`);
  };

  const moveWidget = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= layout.length) return;
    const items = [...layout];
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);
    saveLayout(items);
  };

  // Drag and Drop handlers
  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const onDragLeave = () => {
    setDragOverIndex(null);
  };

  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveWidget(draggedIndex, dropIndex);
      toast.success("Widget reordered");
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const onDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const visibleWidgets = layout.filter((item) => item.visible);
  const hiddenCount = layout.filter((item) => !item.visible).length;

  const categories = ["all", "Overview", "Documents", "Intelligence", "Automation", "Academic"];

  const filteredCatalog = Object.values(WIDGET_METADATA).filter((meta) => {
    if (activeCategory === "all") return true;
    return meta.category === activeCategory;
  });

  return (
    <div className="relative space-y-6 pb-20">
      {/* Top Customizable Control Bar */}
      <div className="sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background/80 p-3 backdrop-blur-md shadow-sm">
        {/* Left: Style Switcher & Real-time Indicator */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Style Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 rounded-xl border-border bg-card">
                <Palette className="h-4 w-4 text-primary" />
                <span className="font-medium text-xs">
                  Style: <strong className="text-foreground">{DASHBOARD_STYLES.find(s => s.id === currentStyle)?.name || "Executive Swiss"}</strong>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-2 rounded-xl shadow-xl">
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                Dashboard Aesthetic Styles
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {DASHBOARD_STYLES.map((st) => (
                <DropdownMenuItem
                  key={st.id}
                  onClick={() => handleStyleChange(st.id)}
                  className={`flex flex-col items-start gap-1 p-2 rounded-lg cursor-pointer ${
                    currentStyle === st.id ? "bg-primary/10 text-primary font-bold" : ""
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-semibold">{st.name}</span>
                    {currentStyle === st.id && <Check className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-normal leading-tight">
                    {st.desc}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="p-2 text-[11px] text-primary cursor-pointer">
                <Link href="/dashboard/settings/appearance" className="flex items-center justify-between w-full">
                  <span>Open Full Appearance Settings</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Real-time Telemetry Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border text-[11px] font-mono text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Data Synced</span>
            <span className="text-[10px] text-muted-foreground/70">({lastSyncedTime})</span>
          </div>
        </div>

        {/* Right: Layout Customization Actions */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddWidgetOpen(true)}
                className="h-9 gap-1.5 rounded-xl border-dashed border-primary/50 text-primary hover:bg-primary/10 text-xs font-semibold"
              >
                <Plus className="h-4 w-4" /> Add Widget {hiddenCount > 0 && `(${hiddenCount})`}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetLayout}
                className="h-9 gap-1.5 rounded-xl text-muted-foreground hover:text-foreground text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  toast.success("Dashboard layout saved!");
                }}
                className="h-9 gap-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm"
              >
                <Check className="h-4 w-4" /> Done Customizing
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddWidgetOpen(true)}
                className="h-9 gap-1.5 rounded-xl border-border text-xs font-medium"
              >
                <Plus className="h-3.5 w-3.5 text-primary" /> Add Widget
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsEditing(true);
                  toast.info("Layout mode active: drag widgets to reorder or resize them.");
                }}
                className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> Customize Layout
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Edit Mode Notice Banner */}
      {isEditing && (
        <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Interactive Layout Editing Active</h4>
                <p className="text-xs text-muted-foreground">
                  Drag any card handle to reorder, change card width (1/3, 1/2, 2/3, Full), or hide cards.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddWidgetOpen(true)}
                className="h-8 rounded-lg text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Browse Catalog ({hiddenCount} hidden)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Grid Canvas for Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {layout.map((item, index) => {
          if (!item.visible && !isEditing) return null;

          const meta = WIDGET_METADATA[item.id];
          if (!meta) return null;

          const colSpanClass = getSizeColSpanClass(item.size);
          const isDragging = draggedIndex === index;
          const isOver = dragOverIndex === index;

          return (
            <div
              key={item.id}
              draggable={isEditing}
              onDragStart={(e) => onDragStart(e, index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, index)}
              onDragEnd={onDragEnd}
              className={`transition-all duration-200 relative group/widget ${colSpanClass} ${
                !item.visible && isEditing ? "opacity-50 border-2 border-dashed border-muted-foreground/30 p-2 rounded-2xl" : ""
              } ${isDragging ? "opacity-30 scale-[0.98]" : ""} ${
                isOver ? "ring-2 ring-primary ring-offset-2 scale-[1.01]" : ""
              }`}
            >
              {/* Overlay / Toolbar in Edit Mode */}
              {isEditing && (
                <div className="mb-2 flex items-center justify-between rounded-xl bg-card border border-border px-3 py-2 shadow-sm text-xs select-none">
                  {/* Drag Handle & Label */}
                  <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                    <GripVertical className="h-4 w-4 text-primary" />
                    <span className="font-bold text-xs text-foreground truncate max-w-[140px] sm:max-w-xs">
                      {meta.title}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                      {getSizeLabel(item.size)}
                    </Badge>
                  </div>

                  {/* Actions: Reorder, Resize, Hide */}
                  <div className="flex items-center gap-1">
                    {/* Move Up/Down buttons for touch/keyboard */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      disabled={index === 0}
                      onClick={() => moveWidget(index, index - 1)}
                      title="Move up"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      disabled={index === layout.length - 1}
                      onClick={() => moveWidget(index, index + 1)}
                      title="Move down"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>

                    {/* Resize Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                        >
                          <Maximize2 className="h-3 w-3 mr-1 text-primary" /> Resize
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuLabel className="text-[11px] text-muted-foreground">Widget Width</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {meta.availableSizes.map((s) => (
                          <DropdownMenuItem
                            key={s}
                            onClick={() => setSpecificWidgetSize(item.id, s)}
                            className={`flex items-center justify-between text-xs cursor-pointer ${
                              item.size === s ? "font-bold text-primary bg-primary/10" : ""
                            }`}
                          >
                            <span>{getSizeLabel(s)}</span>
                            {item.size === s && <Check className="h-3.5 w-3.5 text-primary" />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Toggle Visibility */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => toggleWidgetVisibility(item.id)}
                      title={item.visible ? "Hide from dashboard" : "Show on dashboard"}
                    >
                      {item.visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5 text-primary" />}
                    </Button>
                  </div>
                </div>
              )}

              {/* Render the actual widget */}
              {item.visible ? (
                <div className="relative h-full transition-all">
                  {renderDashboardWidget(item.id, props)}
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-muted-foreground font-mono">
                  [Hidden Widget: {meta.title}] — Click Eye icon to restore
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Catalog Dialog for Adding Widgets */}
      <Dialog open={isAddWidgetOpen} onOpenChange={setIsAddWidgetOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              <span>Customize & Add Dashboard Widgets</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add modular cards and analytical telemetry widgets to customize your daily workspace.
            </DialogDescription>
          </DialogHeader>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-border pb-3 pt-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={activeCategory === cat ? "default" : "ghost"}
                className={`h-7 rounded-full text-xs font-medium capitalize px-3 ${
                  activeCategory === cat ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Widgets List */}
          <div className="grid gap-3 pt-2">
            {filteredCatalog.map((widgetMeta) => {
              const currentConfig = layout.find((item) => item.id === widgetMeta.id);
              const isCurrentlyVisible = currentConfig?.visible ?? false;
              const Icon = widgetMeta.icon;

              return (
                <div
                  key={widgetMeta.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCurrentlyVisible
                      ? "border-border bg-muted/20"
                      : "border-primary/30 bg-primary/5 hover:border-primary/60"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-card border border-border shadow-xs text-primary shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{widgetMeta.title}</h4>
                        <Badge variant="outline" className="text-[10px] font-medium py-0">
                          {widgetMeta.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {widgetMeta.description}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground font-mono">
                        <span>Default width: {getSizeLabel(widgetMeta.defaultSize)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-end">
                    {isCurrentlyVisible ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-xl text-xs gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/40"
                        onClick={() => toggleWidgetVisibility(widgetMeta.id)}
                      >
                        <EyeOff className="h-3.5 w-3.5" /> Hide
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="h-8 rounded-xl bg-primary text-primary-foreground text-xs gap-1.5 font-semibold shadow-xs"
                        onClick={() => {
                          toggleWidgetVisibility(widgetMeta.id);
                          toast.success(`Added ${widgetMeta.title} to dashboard!`);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" /> Add to Dashboard
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

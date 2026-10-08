"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ResponsiveTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  headerClassName?: string;
  render?: (item: T, index: number) => React.ReactNode;
  /**
   * If true, this column serves as the card title / primary identifier in mobile card view.
   */
  isPrimary?: boolean;
  /**
   * If true, hide from mobile card view (for low-priority metadata).
   */
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: ResponsiveTableColumn<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
  renderActions?: (item: T) => React.ReactNode;
}

export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "No items to display.",
  className,
  onRowClick,
  renderActions,
}: ResponsiveTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center bg-card rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const primaryCol = columns.find((c) => c.isPrimary) || columns[0];
  const detailCols = columns.filter((c) => !c.isPrimary && !c.hideOnMobile);

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* ── Mobile Card View (< md) ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {data.map((item, index) => {
          const rowKey = keyExtractor(item, index);
          return (
            <div
              key={rowKey}
              onClick={() => onRowClick && onRowClick(item)}
              className={cn(
                "bg-card rounded-xl border border-border/80 p-4 shadow-xs transition-all space-y-3",
                onRowClick && "cursor-pointer active:scale-[0.99] hover:border-primary/40"
              )}
            >
              {/* Card Primary Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="font-bold text-sm text-foreground">
                  {primaryCol.render
                    ? primaryCol.render(item, index)
                    : item[primaryCol.key]}
                </div>
                {renderActions && (
                  <div className="shrink-0">{renderActions(item)}</div>
                )}
              </div>

              {/* Card Key-Value Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/50">
                {detailCols.map((col) => (
                  <div key={col.key} className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      {col.header}
                    </span>
                    <div className="text-foreground font-medium truncate">
                      {col.render ? col.render(item, index) : item[col.key]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop Tabular View (>= md) ────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-xs">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground",
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
              {renderActions && (
                <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.map((item, index) => {
              const rowKey = keyExtractor(item, index);
              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={cn(
                    "transition-colors hover:bg-muted/40",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3.5 text-foreground align-middle",
                        col.className
                      )}
                    >
                      {col.render
                        ? col.render(item, index)
                        : item[col.key]}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="px-4 py-3.5 text-right align-middle shrink-0">
                      {renderActions(item)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

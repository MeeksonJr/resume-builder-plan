"use client";

import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { Laptop, Smartphone, Tablet, HelpCircle } from "lucide-react";

const PALETTE = ["#102b2b", "#0d8274", "#d8f36b", "#f59e0b", "#6366f1", "#ec4899"];

interface TrafficChartProps {
    data: {
        date: string;
        views: number;
        downloads: number;
        [key: string]: any;
    }[];
}

export function TrafficChart({ data }: TrafficChartProps) {
    const hasData = data && data.length > 0;
    const totalActivity = hasData
        ? data.reduce((acc, curr) => acc + (curr.views || 0) + (curr.downloads || 0), 0)
        : 0;

    return (
        <div className="relative w-full h-[280px] min-w-0">
            {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#102b2b" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#102b2b" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="downloadsGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0d8274" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#0d8274" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e5e7eb"
                            opacity={0.7}
                        />
                        <XAxis
                            dataKey="date"
                            stroke="#9ca3af"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            stroke="#9ca3af"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                            tickFormatter={(v) => `${v}`}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (!active || !payload || !payload.length) return null;
                                return (
                                    <div className="bg-[#102b2b] text-white p-2.5 shadow-xl border border-neutral-700 text-xs rounded-none min-w-[120px]">
                                        <p className="font-bold text-neutral-300 pb-1 mb-1 border-b border-white/10">
                                            {label}
                                        </p>
                                        {payload.map((entry: any, index: number) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between gap-3 py-0.5"
                                            >
                                                <span className="flex items-center gap-1.5 text-neutral-300 capitalize">
                                                    <span
                                                        className="h-2 w-2 rounded-full inline-block"
                                                        style={{ backgroundColor: entry.color }}
                                                    />
                                                    {entry.dataKey}:
                                                </span>
                                                <span className="font-mono font-bold text-white">
                                                    {entry.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="views"
                            stroke="#102b2b"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#viewsGradient)"
                        />
                        <Area
                            type="monotone"
                            dataKey="downloads"
                            stroke="#0d8274"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#downloadsGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-neutral-400 text-xs">
                    <p className="font-medium">No telemetry data recorded yet.</p>
                </div>
            )}
        </div>
    );
}

interface DeviceChartProps {
    data: {
        name: string;
        value: number;
    }[];
}

export function DeviceChart({ data }: DeviceChartProps) {
    const hasData = data && data.length > 0 && data.some((d) => d.value > 0);

    const safeData = hasData
        ? data.filter((d) => d.value > 0)
        : [{ name: "No visits yet", value: 1 }];

    const total = hasData ? data.reduce((sum, d) => sum + d.value, 0) : 0;

    return (
        <div className="relative w-full h-[220px] min-w-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={safeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={hasData ? 4 : 0}
                        dataKey="value"
                        stroke="#ffffff"
                        strokeWidth={2}
                    >
                        {safeData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={
                                    hasData
                                        ? PALETTE[index % PALETTE.length]
                                        : "#e5e7eb"
                                }
                            />
                        ))}
                    </Pie>
                    {hasData && (
                        <Tooltip
                            content={({ active, payload }) => {
                                if (!active || !payload || !payload.length) return null;
                                const item = payload[0];
                                const percentage =
                                    total > 0
                                        ? Math.round(((item.value as number) / total) * 100)
                                        : 0;
                                return (
                                    <div className="bg-[#102b2b] text-white px-3 py-2 shadow-xl border border-neutral-700 text-xs rounded-none">
                                        <p className="font-bold">{item.name}</p>
                                        <p className="text-neutral-300 font-mono mt-0.5">
                                            {item.value} visit{item.value !== 1 ? "s" : ""} ({percentage}%)
                                        </p>
                                    </div>
                                );
                            }}
                        />
                    )}
                </PieChart>
            </ResponsiveContainer>

            {/* Centered Donut Counter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-[#102b2b] leading-none">
                    {total}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">
                    {total === 1 ? "VISITOR" : "VISITORS"}
                </span>
            </div>
        </div>
    );
}

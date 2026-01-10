'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area } from 'recharts';
import { Activity, Thermometer, Zap, Cpu } from 'lucide-react';

interface InverterData {
    timestamp: string;
    serial: number;
    name: string;
    power_ac: number;
    efficiency: number;
    temperature: number;
}

export default function InverterDashboard() {
    const [data, setData] = useState<InverterData[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('24h');
    const [filteredData, setFilteredData] = useState<InverterData[]>([]);
    // Aggregates for Chart 1: Time vs Power (Multiple Lines)
    // Dynamic keys for inverters, plus timestamp
    const [chartData, setChartData] = useState<Record<string, string | number>[]>([]);

    useEffect(() => {
        if (data.length === 0) return;

        try {
            const now = new Date();
            const filtered = data.filter(d => {
                if (!d.timestamp) return false;

                try {
                    if (timeRange === 'all') return true;

                    // Parse timestamp "DD/MM/YYYY, HH:mm:ss"
                    const parts = d.timestamp.split(', ');
                    if (parts.length !== 2) return false;

                    const [datePart, timePart] = parts;
                    const [day, month, year] = datePart.split('/');
                    const [hour, minute, second] = timePart.split(':');

                    if (!day || !month || !year || !hour || !minute || !second) return false;

                    const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
                    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

                    if (timeRange === '24h') return diffHours <= 24;
                    if (timeRange === '7d') return diffHours <= 24 * 7;
                    if (timeRange === '30d') return diffHours <= 24 * 30;
                    return true;
                } catch (e) {
                    console.warn("Error parsing row:", d, e);
                    return false;
                }
            });

            setFilteredData(filtered);

            // Process for Multi-line Chart using FILTERED data
            const grouped = filtered.reduce((acc, curr) => {
                const time = curr.timestamp;
                if (!time || !curr.name) return acc; // Ensure timestamp and name exist

                if (!acc[time]) acc[time] = { timestamp: time };
                // Ensure number for chart
                acc[time][curr.name] = typeof curr.power_ac === 'number' ? curr.power_ac : 0;
                return acc;
            }, {} as Record<string, Record<string, string | number>>);

            setChartData(Object.values(grouped).sort((a, b) => {
                const parseTime = (t: string) => {
                    const [date, time] = t.split(', ');
                    const [day, month, year] = date.split('/');
                    const [hour, minute, second] = time.split(':');
                    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)).getTime();
                };
                return parseTime(a.timestamp as string) - parseTime(b.timestamp as string);
            }));

        } catch (err) {
            console.error("Critical error processing solar data:", err);
        }

    }, [data, timeRange]);

    useEffect(() => {
        // Direct link for Static Export (Client-side fetch)
        const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR4r9EeA5D8J6iJ-JZunIMz7_6_m-YPvJRnYE3CJtluNAqxjMm8Ra1PUsRy8wtz873oT4uRf6hqUHjh/pub?gid=317467633&single=true&output=csv';

        import('papaparse').then(({ default: Papa }) => {
            fetch(CSV_URL)
                .then(res => res.text())
                .then(csvText => {
                    const parsed = Papa.parse(csvText, {
                        header: true,
                        skipEmptyLines: true,
                        transform: (value: string, field: string | number) => {
                            const numberFields = ['power_ac', 'power_dc', 'voltage', 'current', 'efficiency', 'temperature'];
                            if (numberFields.includes(field as string)) {
                                if (typeof value === 'string') {
                                    const normalized = value.replace(',', '.');
                                    const num = parseFloat(normalized);
                                    return isNaN(num) ? 0 : num;
                                }
                                return value;
                            }
                            return value;
                        },
                        dynamicTyping: true
                    });

                    if (parsed.data) {
                        setData(parsed.data as InverterData[]);
                    }
                })
                .catch(err => console.error("Error fetching CSV:", err))
                .finally(() => setLoading(false));
        });
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <Activity className="animate-spin text-blue-500 w-10 h-10" />
        </div>
    );

    const uniqueInverters = Array.from(new Set(filteredData.map(d => d.name)));
    const maxTemp = filteredData.length ? Math.max(...filteredData.map(d => d.temperature || 0)) : 0;
    const avgEfficiency = filteredData.length ? (filteredData.reduce((a, b) => a + (b.efficiency || 0), 0) / filteredData.length).toFixed(1) : 0;
    // Total Power in Wh is tricky from instantaneous Power readings.
    // Use sum of power as a proxy for "Activity" or just display current total power if it were live.
    // If the user wants "Total Production", we should look for columns like "YieldDay" or "YieldTotal" if they exist.
    // Based on debug columns: ['timestamp', 'serial', 'name', 'reachable', 'producing', 'power_ac', 'power_dc', 'voltage', 'current', 'efficiency', 'temperature']
    // We only have power_ac/dc. We can't calculate exact Energy (Wh) without integration over time.
    // Let's display "Avg Power" instead of "Total Power" to be accurate, or "Max Power".
    const avgPower = filteredData.length ? (filteredData.reduce((a, b) => a + (b.power_ac || 0), 0) / filteredData.length).toFixed(0) : 0;

    // Colors for charts
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-6 font-sans">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        Inverter Analysis
                    </h1>
                    <div className="flex gap-2 mt-4">
                        {(['24h', '7d', '30d', 'all'] as const).map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${timeRange === range
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                {range.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                    <p>Source: Google Sheets</p>
                    <p>{filteredData.length} records shown</p>
                </div>
            </header>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="p-6 bg-gray-900/50 backdrop-blur rounded-xl border border-gray-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm">Active Inverters</p>
                            <p className="text-3xl font-bold mt-2">{uniqueInverters.length}</p>
                        </div>
                        <Cpu className="text-blue-500" />
                    </div>
                </div>
                <div className="p-6 bg-gray-900/50 backdrop-blur rounded-xl border border-gray-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm">Avg Efficiency</p>
                            <p className="text-3xl font-bold mt-2">{avgEfficiency}%</p>
                        </div>
                        <Zap className="text-yellow-500" />
                    </div>
                </div>
                <div className="p-6 bg-gray-900/50 backdrop-blur rounded-xl border border-gray-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm">Max Temperature</p>
                            <p className="text-3xl font-bold mt-2">{maxTemp}°C</p>
                        </div>
                        <Thermometer className="text-red-500" />
                    </div>
                </div>
                <div className="p-6 bg-gray-900/50 backdrop-blur rounded-xl border border-gray-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm">Avg Power Output</p>
                            <p className="text-3xl font-bold mt-2">{avgPower} W</p>
                        </div>
                        <Activity className="text-green-500" />
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Production Comparison */}
                <div className="lg:col-span-2 h-[400px] bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Production Comparison (AC Power)
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="timestamp" stroke="#9CA3AF" tick={false} />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                            <Legend />
                            {uniqueInverters.map((name, i) => (
                                <Line
                                    key={name}
                                    type="monotone"
                                    dataKey={name}
                                    stroke={colors[i % colors.length]}
                                    strokeWidth={2}
                                    dot={false}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. Temperature Analysis */}
                <div className="h-[350px] bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-red-500" />
                        Temperature Trends
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="timestamp" hide />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                            <Area type="monotone" dataKey="temperature" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. Efficiency vs Power */}
                <div className="h-[350px] bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        Efficiency vs Power DC
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="power_dc" hide />
                            <YAxis yAxisId="left" stroke="#9CA3AF" />
                            <YAxis yAxisId="right" orientation="right" domain={[90, 100]} stroke="#3B82F6" />
                            <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                            <Bar yAxisId="left" dataKey="power_dc" fill="#374151" name="Power DC" />
                            <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#3B82F6" strokeWidth={2} dot={false} name="Efficiency %" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

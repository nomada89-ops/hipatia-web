'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Sun, Battery, Zap, Activity } from 'lucide-react';

interface SolarReading {
    id: number;
    timestamp: string;
    power_watts: number;
    grid_voltage: number;
    grid_frequency: number;
    day_yield_wh: number;
    total_yield_kwh: number;
}

interface DailyStat {
    date: string;
    total_yield_wh: number;
    peak_power_watts: number;
    last_updated: string;
}

export default function SolarPage() {
    const [liveData, setLiveData] = useState<SolarReading[]>([]);
    const [historyData, setHistoryData] = useState<DailyStat[]>([]);
    const [current, setCurrent] = useState<SolarReading | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            // Fetch Live Data
            const liveRes = await fetch('/api/solar?type=live');
            const liveJson = await liveRes.json();
            setLiveData(liveJson.chartData || []);
            setCurrent(liveJson.current || {});

            // Fetch History Data
            const historyRes = await fetch('/api/solar?type=history');
            const historyJson = await historyRes.json();
            // Reverse for chart (oldest to newest)
            setHistoryData(historyJson.reverse ? historyJson.reverse() : []);
        } catch (err) {
            console.error('Failed to fetch solar data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading && !current) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <Activity className="animate-spin h-10 w-10 text-yellow-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-6 font-sans">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                        Solar Production Dashboard
                    </h1>
                    <p className="text-gray-400 mt-1">Real-time monitoring & history</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-mono text-yellow-400">{new Date().toLocaleTimeString()}</p>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card
                    title="Current Power"
                    value={`${current?.power_watts?.toFixed(0) || 0} W`}
                    icon={<Sun className="h-6 w-6 text-yellow-400" />}
                    gradient="from-yellow-900/50 to-orange-900/20"
                />
                <Card
                    title="Daily Yield"
                    value={`${current?.day_yield_wh?.toFixed(0) || 0} Wh`}
                    icon={<Battery className="h-6 w-6 text-green-400" />}
                    gradient="from-green-900/50 to-emerald-900/20"
                />
                <Card
                    title="Grid Voltage"
                    value={`${current?.grid_voltage?.toFixed(1) || 0} V`}
                    icon={<Zap className="h-6 w-6 text-blue-400" />}
                    gradient="from-blue-900/50 to-cyan-900/20"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Live Power Chart */}
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 backdrop-blur-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-yellow-500" />
                        Live Power (24h)
                    </h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={liveData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    stroke="#9CA3AF"
                                />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#fff' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="power_watts"
                                    stroke="#F59E0B"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Historical Yield Chart */}
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 backdrop-blur-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Sun className="h-5 w-5 text-green-500" />
                        Daily Yield (30 Days)
                    </h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={historyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(t) => new Date(t).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                                    stroke="#9CA3AF"
                                />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#fff' }}
                                />
                                <Bar dataKey="total_yield_wh" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}

function Card({ title, value, icon, gradient }: { title: string, value: string, icon: React.ReactNode, gradient: string }) {
    return (
        <div className={`p-6 rounded-xl border border-gray-800 bg-gradient-to-br ${gradient} flex items-center justify-between relative overflow-hidden group hover:border-gray-700 transition-all`}>
            <div className="relative z-10">
                <p className="text-gray-400 text-sm font-medium">{title}</p>
                <p className="text-3xl font-bold mt-1 text-white">{value}</p>
            </div>
            <div className="p-3 bg-gray-950/30 rounded-lg backdrop-blur-md relative z-10">
                {icon}
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/10 transition-all" />
        </div>
    );
}

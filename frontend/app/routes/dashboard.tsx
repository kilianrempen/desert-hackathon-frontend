import { useState } from "react";
import CircularProgressBar from "../components/progress";

type Activity = {
    id: number;
    name: string;
    gallons: number;
    timestamp?: number;
};

type AggregatedActivity = Activity & {
    count: number;
};

export default function Dashboard() {
    const budget = 80;

    const activities: Activity[] = [
        { id: 1, name: "5 Minute Shower", gallons: 15 },
        { id: 2, name: "10 Minute Shower", gallons: 30 },
        { id: 3, name: "Toilet Flush", gallons: 3 },
        { id: 4, name: "Dishwasher Load", gallons: 5 },
        { id: 5, name: "Laundry Load", gallons: 23 },
        { id: 6, name: "Hand Wash Dishes", gallons: 4 },
        { id: 7, name: "Garden Watering", gallons: 12 },
        { id: 8, name: "Brush Teeth", gallons: 1 },
        { id: 9, name: "Shave", gallons: 2 },
        { id: 10, name: "Take a Bath", gallons: 45 },
    ];

    const generateDummyLogs = (): Activity[] => {
        const logs: Activity[] = [];
        const now = new Date();
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const day = new Date(now);
            day.setDate(now.getDate() - dayOffset);
            const entries = 1 + Math.floor(Math.random() * 3);
            for (let e = 0; e < entries; e++) {
                const act = activities[Math.floor(Math.random() * activities.length)];
                const ts = new Date(day);
                ts.setHours(6 + Math.floor(Math.random() * 16), Math.floor(Math.random() * 60), 0, 0);
                logs.push({ id: act.id, name: act.name, gallons: act.gallons, timestamp: ts.getTime() });
            }
        }
        logs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        return logs;
    };

    const [logs, setLogs] = useState<Activity[]>(() => generateDummyLogs());
    const [selectedExtraId, setSelectedExtraId] = useState<number | null>(activities[4]?.id ?? null);
    const [modalDate, setModalDate] = useState<Date | null>(null);
    const openDay = (d: Date) => setModalDate(new Date(d));
    const closeModal = () => setModalDate(null);

    const formatTime = (ts?: number) =>
        ts ? new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "";

    const startOfDay = (d = new Date()) => {
        const dt = new Date(d);
        dt.setHours(0, 0, 0, 0);
        return dt.getTime();
    };

    const isSameDay = (ts: number, reference: Date) => {
        const d = new Date(ts);
        return (
            d.getFullYear() === reference.getFullYear() &&
            d.getMonth() === reference.getMonth() &&
            d.getDate() === reference.getDate()
        );
    };

    const logActivity = (activity: Activity) => {
        const entry: Activity = { ...activity, timestamp: Date.now() };
        setLogs((prev) => [...prev, entry]);
    };

    const today = new Date();
    const todaysLogs = logs.filter((l) => l.timestamp && isSameDay(l.timestamp, today));
    const gallonsUsed = todaysLogs.reduce((s, a) => s + a.gallons, 0);

    const aggregatedToday: AggregatedActivity[] = Object.values(
        todaysLogs.reduce((acc: Record<number, AggregatedActivity>, a) => {
            if (!acc[a.id]) acc[a.id] = { ...a, count: 0 };
            acc[a.id].count += 1;
            return acc;
        }, {})
    );

    const removeActivity = (activityId: number) => {
        setLogs((prev) => {
            for (let i = prev.length - 1; i >= 0; i--) {
                const entry = prev[i];
                if (entry.id === activityId && entry.timestamp && isSameDay(entry.timestamp, today)) {
                    const copy = prev.slice();
                    copy.splice(i, 1);
                    return copy;
                }
            }
            return prev;
        });
    };

    const getDayLabel = (d: Date) =>
        d.toLocaleDateString("en-US", { weekday: "short" });
    const weeklyTotals: { date: Date; total: number }[] = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        const total = logs.reduce((s, a) => {
            if (!a.timestamp) return s;
            const ts = a.timestamp;
            if (isSameDay(ts, d)) return s + a.gallons;
            return s;
        }, 0);
        return { date: d, total };
    });

    return (
        <>
            {/* Top header and progress bar */}
            <div className="flex flex-wrap items-center justify-center bg-gray-100 py-2 px-4 md:flex-nowrap">
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold hidden">SPLISH</h1>
                        <img
                            src={"../public/splish-logo.png"}
                            alt="SPLISH Logo"
                            className="h-16 sm:h-20 md:h-22 mx-auto"
                        />
                        <h2 className="text-xl sm:text-2xl font-bold mt-1">
                            Your Water Usage Today:
                        </h2>
                        <h3 className="text-lg sm:text-2xl font-bold mb-1">
                            {gallonsUsed} / {budget} Gallons
                        </h3>
                    </div>
                    <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40">
                        <CircularProgressBar percentage={(gallonsUsed / budget) * 100} />
                    </div>
                </div>
                <div className="absolute top-24 right-8 md:top-32 md:right-32">
                    <button
                        className="bg-gradient-to-br from-gray-100 to-gray-100 text-gray-500 px-3 py-1 rounded hover:from-stone-200 hover:to-stone-300 transition hover:cursor-pointer text-sm sm:text-base"
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            <hr />

            {/* Main grid: log + today */}
            <div className="bg-[url('../public/water-bg.jpeg')] bg-cover bg-center">
                <div className="bg-white/70 pb-4">
                    <div className="grid md:grid-cols-2 sm:grid-cols-1 w-11/12 md:w-3/4 mx-auto gap-6">
                        {/* LEFT: Log an Activity */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-center my-4">
                                Log an Activity:
                            </h2>
                            {activities.slice(0, 4).map((activity) => (
                                <div
                                    key={activity.id}
                                    className="border-2 border-gray-400 py-2 px-3 rounded-2xl w-full mx-auto my-2 bg-gradient-to-br from-gray-100 to-gray-200"
                                >
                                    <div className="grid grid-cols-3 gap-3 items-center">
                                        <div className="col-span-2">
                                            <h3 className="text-base sm:text-lg font-semibold mb-1">{activity.name}</h3>
                                            <p className="text-xs sm:text-sm italic">
                                                Approximately {activity.gallons} gallons.
                                            </p>
                                        </div>
                                        <button
                                            className="bg-gradient-to-br from-blue-400 to-blue-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded hover:from-blue-500 hover:to-blue-600 transition hover:cursor-pointer text-sm sm:text-base"
                                            onClick={() => logActivity(activity)}
                                        >
                                            Log
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Dropdown for additional activities */}
                            {activities.length > 4 && (
                                <div className="border-2 border-gray-400 py-2 px-3 rounded-2xl w-full mx-auto my-2 bg-gradient-to-br from-gray-100 to-gray-200">
                                    <div className="grid grid-cols-3 gap-3 items-center">
                                        <div className="col-span-2">
                                            <label className="text-sm font-semibold block">More Activities</label>
                                            <select
                                                value={selectedExtraId ?? undefined}
                                                onChange={(e) => setSelectedExtraId(Number(e.target.value))}
                                                className="w-full rounded px-1 py-1 border text-sm sm:text-base"
                                                aria-label="Select extra activity"
                                            >
                                                {activities.slice(4).map((a) => (
                                                    <option key={a.id} value={a.id}>
                                                        {a.name} — {a.gallons} gal
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            className="bg-gradient-to-br from-blue-400 to-blue-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded hover:from-blue-500 hover:to-blue-600 transition hover:cursor-pointer text-sm sm:text-base"
                                            onClick={() => {
                                                if (!selectedExtraId) return;
                                                const act = activities.find((a) => a.id === selectedExtraId);
                                                if (act) logActivity(act);
                                            }}
                                        >
                                            Log
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Today's Activities */}
                        <div className="overflow-y-auto max-h-[50vh] sm:max-h-[55vh]">
                            <h2 className="text-xl sm:text-2xl font-bold text-center my-4">
                                Today's Activities:
                            </h2>
                            {aggregatedToday.length === 0 ? (
                                <p className="text-center text-gray-500 italic">
                                    No activities logged yet.
                                </p>
                            ) : (
                                aggregatedToday.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="border-2 border-blue-300 py-2 px-3 rounded-2xl w-full mx-auto my-2 bg-gradient-to-br from-blue-100 to-blue-200"
                                    >
                                        <div className="grid grid-cols-3 gap-3 items-center">
                                            <div className="col-span-2">
                                                <h3 className="text-base sm:text-lg font-semibold mb-1">
                                                    {activity.name} {activity.count > 1 ? `×${activity.count}` : ""}
                                                </h3>
                                                <p className="text-xs sm:text-sm italic">
                                                    Approximately {activity.gallons * activity.count} gallons total.
                                                </p>
                                            </div>
                                            <button
                                                className="bg-gradient-to-br from-red-400 to-red-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded hover:from-red-500 hover:to-red-600 transition hover:cursor-pointer text-sm sm:text-base"
                                                onClick={() => removeActivity(activity.id)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <hr className="mb-3" />

            {/* WEEKLY VIEW */}
            <div className="mb-2 w-11/12 md:w-3/4 mx-auto">
                <h2 className="text-lg sm:text-xl font-bold text-center mb-2">Past 7 Days:</h2>
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                    {weeklyTotals.map(({ date, total }) => (
                        <div
                            key={date.toDateString()}
                            className="flex flex-col items-center gap-1"
                        >
                            <div className="text-sm font-medium pt-1">{getDayLabel(date)}</div>
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => openDay(date)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") openDay(date);
                                }}
                                className="w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 cursor-pointer"
                            >
                                <CircularProgressBar
                                    percentage={(total / budget) * 100}
                                    centerLabel={total}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODAL */}
            {modalDate && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    onClick={closeModal}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Activities for ${modalDate.toDateString()}`}
                >
                    <div className="absolute inset-0 bg-black opacity-50" />
                    <div
                        className="relative z-10 w-full max-w-md bg-white rounded-xl p-4 sm:p-6 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base sm:text-lg font-semibold">
                                Activities —{" "}
                                {modalDate.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="hover:cursor-pointer text-sm text-gray-600 px-2 py-1 hover:text-gray-900"
                            >
                                Close
                            </button>
                        </div>
                        <div className="space-y-3 max-h-64 sm:max-h-72 overflow-auto">
                            {(() => {
                                const entries = logs
                                    .filter((l) => l.timestamp && isSameDay(l.timestamp, modalDate))
                                    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
                                if (entries.length === 0) {
                                    return (
                                        <p className="text-sm text-gray-500 italic">
                                            No activities logged that day.
                                        </p>
                                    );
                                }
                                return entries.map((e, idx) => (
                                    <div
                                        key={`${e.id}-${e.timestamp}-${idx}`}
                                        className="flex items-center justify-between border rounded p-2 sm:p-3"
                                    >
                                        <div>
                                            <div className="text-sm font-medium">{e.name}</div>
                                            <div className="text-xs text-gray-500">{formatTime(e.timestamp)}</div>
                                        </div>
                                        <div className="text-sm font-semibold">{e.gallons} gal</div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

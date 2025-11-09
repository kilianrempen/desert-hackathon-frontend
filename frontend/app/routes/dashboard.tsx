import { useState } from "react";
import CircularProgressBar from "../components/progress";

type Activity = {
  id: number;
  name: string;
  gallons: number;
  timestamp?: number; // added timestamp (optional for templates)
};

type AggregatedActivity = Activity & {
  count: number;
};

export default function Dashboard() {
    const budget = 80;
    // Replace aggregated state with a logs array that stores each logged event with a timestamp
    const [logs, setLogs] = useState<Activity[]>([]);

    const activities: Activity[] = [
        { id: 1, name: "5 Minute Shower", gallons: 15 },
        { id: 2, name: "10 Minute Shower", gallons: 30 },
        { id: 3, name: "Toilet Flush", gallons: 3 },
        { id: 4, name: "Dishwasher Load", gallons: 5 },
        { id: 5, name: "Laundry Load", gallons: 23 },
    ];

    const startOfDay = (d = new Date()) => {
        const dt = new Date(d);
        dt.setHours(0,0,0,0);
        return dt.getTime();
    };

    const isSameDay = (ts: number, reference: Date) => {
        const d = new Date(ts);
        return d.getFullYear() === reference.getFullYear() &&
               d.getMonth() === reference.getMonth() &&
               d.getDate() === reference.getDate();
    };

    const logActivity = (activity: Activity) => {
        const entry: Activity = { ...activity, timestamp: Date.now() };
        setLogs((prev) => [...prev, entry]);
    };

    // Derived: today's usage and aggregated today's activities
    const today = new Date();
    const todaysLogs = logs.filter(l => l.timestamp && isSameDay(l.timestamp, today));
    const gallonsUsed = todaysLogs.reduce((s, a) => s + a.gallons, 0);

    const aggregatedToday: AggregatedActivity[] = Object.values(
        todaysLogs.reduce((acc: Record<number, AggregatedActivity>, a) => {
            if (!acc[a.id]) acc[a.id] = { ...a, count: 0 };
            acc[a.id].count += 1;
            return acc;
        }, {})
    );

    const removeActivity = (activityId: number) => {
        // Remove the most recent log entry for that activity that occurred today
        setLogs((prev) => {
            // find index from the end matching id and same day
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

    // Weekly totals: last 7 days (including today)
    const getDayLabel = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short" }); // Mon, Tue,...
    const weeklyTotals: { date: Date; total: number }[] = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i)); // oldest first -> newest last
        d.setHours(0,0,0,0);
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
            <div className="flex items-center justify-center bg-gray-100 py-10">
                <div className="flex flex-row items-center gap-10">
                    <div>
                        <h1 className="text-3xl font-bold text-center my-5">SPLISH</h1>
                        <h2 className="text-2xl font-bold text-center mb-5">
                            Your Water Usage Today:
                        </h2>
                        <h3 className="text-2xl font-bold text-center mb-5">
                            {gallonsUsed} / {budget} Gallons
                        </h3>
                    </div>
                    <CircularProgressBar percentage={(gallonsUsed / budget) * 100} />
                </div>
            </div>

            <hr />

            {/* Main grid: log + today */}
            <div className="grid grid-cols-2">
                {/* LEFT: Log an Activity */}
                <div>
                    <h2 className="text-2xl font-bold text-center my-5">
                        Log an Activity:
                    </h2>
                    {activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="border-2 border-gray-400 p-4 rounded-2xl w-3/5 mx-auto my-2 bg-gradient-to-br from-gray-100 to-gray-200"
                        >
                            <div className="grid grid-cols-3 gap-3 items-center">
                                <div className="col-span-2">
                                    <h3 className="text-lg font-semibold mb-1">{activity.name}</h3>
                                    <p className="text-sm italic">
                                        Approximately {activity.gallons} gallons.
                                    </p>
                                </div>
                                <button
                                    className="bg-gradient-to-br from-blue-400 to-blue-500 text-white px-4 py-3 rounded hover:from-blue-500 hover:to-blue-600 transition hover:cursor-pointer"
                                    onClick={() => logActivity(activity)}
                                >
                                    Log
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* RIGHT: Today's Activities */}
                <div>
                    <h2 className="text-2xl font-bold text-center my-5">
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
                                className="border-2 border-blue-300 p-4 rounded-2xl w-3/5 mx-auto my-2 bg-gradient-to-br from-blue-100 to-blue-200"
                            >
                                <div className="grid grid-cols-3 gap-3 items-center">
                                    <div className="col-span-2">
                                        <h3 className="text-lg font-semibold mb-1">
                                            {activity.name} {activity.count > 1 ? `×${activity.count}` : ""}
                                        </h3>
                                        <p className="text-sm italic">
                                            Approximately {activity.gallons * activity.count} gallons total.
                                        </p>
                                    </div>
                                    <button
                                        className="bg-gradient-to-br from-red-400 to-red-500 text-white px-4 py-3 rounded hover:from-red-500 hover:to-red-600 transition hover:cursor-pointer"
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

            <hr className="my-6" />

            {/* WEEKLY VIEW */}
            <div className="my-6">
                <h2 className="text-2xl font-bold text-center mb-4">Past 7 Days</h2>
                <div className="flex justify-center gap-6">
                    {weeklyTotals.map(({ date, total }) => (
                        <div key={date.toDateString()} className="flex flex-col items-center gap-2">
                            <div className="w-28 h-28">
                                {/* percentage relative to budget, clamp handled by component */}
                                <CircularProgressBar percentage={(total / budget) * 100} centerLabel={total} />
                            </div>
                            <div className="text-sm font-medium">{getDayLabel(date)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

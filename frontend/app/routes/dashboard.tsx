import { useState } from "react";
import CircularProgressBar from "../components/progress";

type Activity = {
  id: number;
  name: string;
  gallons: number;
};

type AggregatedActivity = Activity & {
  count: number;
};

export default function Dashboard() {
    const budget = 80;
    const [gallonsUsed, setGallonsUsed] = useState(0);
    const [loggedActivities, setLoggedActivities] = useState<AggregatedActivity[]>([]); // aggregated entries

    const activities: Activity[] = [
        { id: 1, name: "5 Minute Shower", gallons: 15 },
        { id: 2, name: "10 Minute Shower", gallons: 30 },
        { id: 3, name: "Toilet Flush", gallons: 3 },
        { id: 4, name: "Dishwasher Load", gallons: 5 },
        { id: 5, name: "Laundry Load", gallons: 23 },
    ];

    const logActivity = (activity: Activity) => {
        // increment total gallons
        setGallonsUsed((prev) => prev + activity.gallons);

        // aggregate: if exists, increase count, otherwise add new
        setLoggedActivities((prev) => {
            const idx = prev.findIndex((a) => a.id === activity.id);
            if (idx !== -1) {
                // update existing
                return prev.map((a, i) =>
                    i === idx ? { ...a, count: a.count + 1 } : a
                );
            }
            // add new aggregated entry
            return [...prev, { ...activity, count: 1 }];
        });
    };

    const removeActivity = (index: number) => {
        // Read the current item from state (avoid side-effects in updater)
        const item = loggedActivities[index];
        if (!item) return;

        // Update aggregated activities (pure updater)
        setLoggedActivities((prev) => {
            if (prev[index]?.count > 1) {
                return prev.map((a, i) => (i === index ? { ...a, count: a.count - 1 } : a));
            } else {
                return prev.filter((_, i) => i !== index);
            }
        });

        // Subtract gallons once (outside the loggedActivities updater)
        setGallonsUsed((gPrev) => Math.max(0, gPrev - item.gallons));
    };

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

                    {loggedActivities.length === 0 ? (
                        <p className="text-center text-gray-500 italic">
                            No activities logged yet.
                        </p>
                    ) : (
                        loggedActivities.map((activity, index) => (
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
                                        onClick={() => removeActivity(index)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

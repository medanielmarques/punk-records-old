import { useState, useEffect, useRef } from "react";

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [newTask, setNewTask] = useState("");
  const [newTime, setNewTime] = useState(30); // Default 30 minutes
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Find the first active task
    const activeTask = tasks.find(
      (task) => !task.completed && !task.paused && task.timeRemaining > 0
    );

    let timer;
    if (activeTask) {
      timer = setInterval(() => {
        setTasks((prevTasks) =>
          prevTasks.map((t) => {
            if (t.id === activeTask.id && t.timeRemaining > 0) {
              const newTime = t.timeRemaining - 1;
              if (newTime === 0) {
                new Audio(
                  "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
                ).play();
              }
              return { ...t, timeRemaining: newTime };
            }
            return t;
          })
        );
      }, 1000);
    }

    return () => timer && clearInterval(timer);
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const timeInSeconds = newTime * 60;
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text: newTask,
        timeRemaining: timeInSeconds,
        completed: false,
        paused: true, // Start paused
      },
    ]);
    setNewTask("");
    setNewTime(30);
    // Refocus input after adding task
    inputRef.current?.focus();
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const togglePause = (id) => {
    setTasks(
      tasks.map(
        (task) =>
          task.id === id
            ? { ...task, paused: !task.paused }
            : { ...task, paused: true } // Pause all other tasks
      )
    );
  };

  const adjustTime = (amount) => {
    setNewTime((prev) => Math.max(5, prev + amount));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen w-full bg-amber-50 p-8">
      <h1 className="text-4xl font-bold text-center mb-12 text-amber-800">
        tokitoki.app
      </h1>

      <form
        onSubmit={addTask}
        className="flex flex-col items-center gap-6 mb-12"
      >
        <input
          ref={inputRef}
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter new task..."
          className="w-full max-w-xl px-6 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white/50 backdrop-blur-sm"
        />
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => adjustTime(-5)}
            className="px-5 py-3 text-xl bg-amber-200 font-medium text-amber-700 rounded-lg hover:bg-amber-300 transition-colors"
          >
            -5
          </button>
          <span className="w-24 text-center text-2xl font-bold text-amber-800">
            {newTime} min
          </span>
          <button
            type="button"
            onClick={() => adjustTime(5)}
            className="px-5 py-3 text-xl bg-amber-200 font-medium text-amber-700 rounded-lg hover:bg-amber-300 transition-colors"
          >
            +5
          </button>
        </div>
      </form>

      <div className="space-y-4 max-w-[800px] mx-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center justify-between p-6 rounded-lg border ${
              task.completed
                ? "bg-gray-100 opacity-75"
                : task.timeRemaining === 0
                ? "bg-red-50 border-red-200"
                : task.paused
                ? "bg-amber-50"
                : "bg-amber-50/70"
            }`}
          >
            <div className="flex items-center gap-6 flex-1">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="w-6 h-6 rounded border-amber-300 focus:ring-amber-500"
              />
              <span
                className={`flex-1 text-lg ${
                  task.completed
                    ? "line-through text-gray-500"
                    : "text-amber-900"
                }`}
              >
                {task.text}
              </span>
              <button
                onClick={() => togglePause(task.id)}
                className={`px-4 py-2 text-lg rounded ${
                  task.paused
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-200 text-amber-700"
                }`}
              >
                {task.paused ? "Start" : "Pause"}
              </button>
              <span
                className={`font-mono text-xl ${
                  task.timeRemaining === 0 ? "text-red-500" : "text-amber-700"
                }`}
              >
                {formatTime(task.timeRemaining)}
              </span>
            </div>
            <button
              onClick={() => deleteTask(task.id)}
              className="ml-6 text-amber-300 hover:text-red-500 text-2xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

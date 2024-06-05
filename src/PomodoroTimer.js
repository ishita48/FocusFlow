import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PomodoroTimer.css';

const PomodoroTimer = () => {
  const [workTime, setWorkTime] = useState(25 * 60);
  const [shortBreakTime, setShortBreakTime] = useState(5 * 60);
  const [longBreakTime, setLongBreakTime] = useState(15 * 60);
  const [currentTime, setCurrentTime] = useState(workTime);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState('work'); // work, shortBreak, longBreak
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [workDuration, setWorkDuration] = useState(0);
  const [breakDuration, setBreakDuration] = useState(0);
  const [loading, setLoading] = useState(true); // Loading state
  const intervalRef = useRef(null);

  // Function to simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // Adjust the time as needed

    return () => clearTimeout(timer);
  }, []);

  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.completed).length;
    return (completedTasks / tasks.length) * 100;
  };

  const playSound = useCallback(() => {
    const audio = new Audio(process.env.PUBLIC_URL + '/simple-notification-152054.mp3'); // Ensure the audio file path is correct
    audio.play();
  }, []);

  // Function to display a message when the timer finishes
const displayTimerMessage = (message) => {
  alert(message);
};

  const switchMode = useCallback(() => {
    if (mode === 'work') {
      setMode('shortBreak');
      setCurrentTime(shortBreakTime);
      setWorkDuration(prev => prev + (workTime - currentTime));
      displayTimerMessage("Keep the productivity on!");
    } else if (mode === 'shortBreak') {
      setMode('longBreak');
      setCurrentTime(longBreakTime);
      setBreakDuration(prev => prev + (shortBreakTime - currentTime));
      displayTimerMessage("Mini break session is over");
    } else if (mode === 'longBreak') {
      setMode('work');
      setCurrentTime(workTime);
      setBreakDuration(prev => prev + (longBreakTime - currentTime));
      displayTimerMessage("We all love breaks, but it's time to get the steam on!");
    }
  }, [mode, workTime, shortBreakTime, longBreakTime, currentTime]);

  useEffect(() => {
    const handleTick = () => {
      setCurrentTime((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          clearInterval(intervalRef.current);
          setIsActive(false);
          playSound(); // Play sound when timer reaches zero
          switchMode();
          return 0;
        }
      });
    };

    if (isActive && !isPaused) {
      intervalRef.current = setInterval(handleTick, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, isPaused, switchMode, playSound]);

  useEffect(() => {
    if (!isActive && !isPaused) {
      setCurrentTime(
        mode === 'work'
          ? workTime
          : mode === 'shortBreak'
          ? shortBreakTime
          : longBreakTime
      );
    }
  }, [workTime, shortBreakTime, longBreakTime, mode, isActive, isPaused]);

  useEffect(() => {
    document.title = `${formatTime(currentTime)} - ${mode === 'work' ? 'Work Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}`;
  }, [currentTime, mode]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setIsPaused(false);
    setCurrentTime(
      mode === 'work'
        ? workTime
        : mode === 'shortBreak'
        ? shortBreakTime
        : longBreakTime
    );
  };

  const handleTimeChange = (event, setTime) => {
    const newValue = event.target.value * 60;
    setTime(newValue);
    if (
      (mode === 'work' && setTime === setWorkTime) ||
      (mode === 'shortBreak' && setTime === setShortBreakTime) ||
      (mode === 'longBreak' && setTime === setLongBreakTime)
    ) {
      setCurrentTime(newValue);
    }
  };

  const addTask = () => {
    if (newTask.trim() !== '') {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask('');
    }
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const clearAllTasks = () => {
    setTasks([]);
  };

  const prioritizeTask = (taskId, direction) => {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    const updatedTasks = [...tasks];

    if (direction === 'up' && taskIndex > 0) {
      // Swap task with the one above it
      [updatedTasks[taskIndex - 1], updatedTasks[taskIndex]] = [updatedTasks[taskIndex], updatedTasks[taskIndex - 1]];
    } else if (direction === 'down' && taskIndex < tasks.length - 1) {
      // Swap task with the one below it
      [updatedTasks[taskIndex], updatedTasks[taskIndex + 1]] = [updatedTasks[taskIndex + 1], updatedTasks[taskIndex]];
    }

    setTasks(updatedTasks);
  };

  return (
    <div>
      {/* Starting Title Page */}
      <div className="startup-container">
        <img src={`${process.env.PUBLIC_URL}/FocusFlow.png`} alt="FocusFlow" className="focusflow-image" />
        <h1 className="startup-text">
          <span className="focus">FOCUS</span>
          <span className="flow">FLOW</span>
        </h1>
      </div>
      {/* Pomodoro Timer */}
      <div className={`pomodoro-timer-container ${loading ? 'loading' : ''}`}>
        {loading ? ( // Loading page
          <LoadingPage />
        ) : (
          <div className="pomodoro-timer">
            <div className="mode-display">
              {mode === 'work' ? 'Work Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </div>
            <div className="time-display">{formatTime(currentTime)}</div>
            <div className="controls">
              <button onClick={handleStart} disabled={isActive && !isPaused}>Start</button>
              <button onClick={handlePause} disabled={!isActive}>{isPaused ? 'Resume' : 'Pause'}</button>
              <button onClick={handleReset}>Reset</button>
            </div>
            <div className="settings">
              <div>
                <label>Work Time (minutes): </label>
                <input type="number" value={workTime / 60} onChange={(e) => handleTimeChange(e, setWorkTime)} />
              </div>
              <div>
                <label>Short Break Time (minutes): </label>
                <input type="number" value={shortBreakTime / 60} onChange={(e) => handleTimeChange(e, setShortBreakTime)} />
              </div>
              <div>
                <label>Long Break Time (minutes): </label>
                <input type="number" value={longBreakTime / 60} onChange={(e) => handleTimeChange(e, setLongBreakTime)} />
              </div>
            </div>
            <div className="todo-list">
              <h2>Task List</h2>
              <div className="task-input">
                <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Enter a new task" />
                <button onClick={addTask}>Add Task</button>
              </div>
              <ul>
                {tasks.map((task, index) => (
                  <li key={task.id} className={task.completed ? 'completed' : ''}>
                    <div className="task">
                      <input type="checkbox" checked={task.completed} onChange={() => toggleTaskCompletion(task.id)} />
                      <span>{task.text}</span>
                      <div className="task-controls">
                        <button onClick={() => prioritizeTask(task.id, 'up')} disabled={index === 0}>Up</button>
                        <button onClick={() => prioritizeTask(task.id, 'down')} disabled={index === tasks.length - 1}>Down</button>
                        <button onClick={() => deleteTask(task.id)}>Delete</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="task-controls">
                <button onClick={clearAllTasks}>Clear All</button>
              </div>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div className="progress" style={{ width: `${calculateProgress()}%` }}></div>
              </div>
              <span className="progress-percentage">{`${calculateProgress().toFixed(0)}%`}</span>
            </div>
            <div className="chart-container">
              <h2>Work and Break Duration Chart</h2>
              <div className="chart">
                <div className="bar work" style={{ height: `${workDuration}px` }}>
                  <span className="label">Work</span>
                  <span className="duration">{formatTime(workDuration)}</span>
                </div>
                <div className="bar break" style={{ height: `${breakDuration}px` }}>
                  <span className="label">Break</span>
                  <span className="duration">{formatTime(breakDuration)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Loading Page component
const LoadingPage = () => (
  <div className="loading-page">
    <h1>Loading...</h1>
    {/* Add loading animation here */}
  </div>
);

export default PomodoroTimer;


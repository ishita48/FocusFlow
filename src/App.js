import React from 'react';
import PomodoroTimer from './PomodoroTimer';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="startup-container">
        <div className="startup-text">
        </div>
      </div>
      <PomodoroTimer />
    </div>
  );
}

export default App;

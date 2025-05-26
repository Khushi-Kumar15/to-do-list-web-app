import React, { useState, useEffect } from 'react';
import './App.css';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTasks([{ text: trimmed, completed: false, priority: 'normal' }, ...tasks]);
    setInput('');
  };

  const toggleComplete = (index) => {
    setTasks(tasks.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const clearCompleted = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  const startEditing = (index) => {
    setEditIndex(index);
    setEditText(tasks[index].text);
  };

  const cancelEditing = () => {
    setEditIndex(null);
    setEditText('');
  };

  const saveEdit = (index) => {
    const trimmed = editText.trim();
    if (!trimmed) return cancelEditing();
    setTasks(tasks.map((task, i) =>
      i === index ? { ...task, text: trimmed } : task
    ));
    cancelEditing();
  };

  const togglePriority = (index) => {
    setTasks(tasks.map((task, i) => {
      if (i === index) {
        const newPriority = task.priority === 'normal' ? 'high' : 'normal';
        return { ...task, priority: newPriority };
      }
      return task;
    }));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const handleKeyPressAdd = (e) => {
    if (e.key === 'Enter') addTask();
  };

  const handleKeyPressEdit = (e, index) => {
    if (e.key === 'Enter') saveEdit(index);
    if (e.key === 'Escape') cancelEditing();
  };

  const remaining = tasks.filter(t => !t.completed).length;

  return (
    <div className="container">
      <h1>✨ Dynamic React ToDo App</h1>

      <div className="input-group">
        <input
          type="text"
          value={input}
          placeholder="Add a new task..."
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyPressAdd}
          autoFocus
          aria-label="New task input"
        />
        <button className="add-btn" onClick={addTask} aria-label="Add Task">Add</button>
      </div>

      {tasks.length > 0 && (
        <>
          <div className="filters">
            {['all', 'active', 'completed'].map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <TransitionGroup component="ul" className="todo-list">
            {filteredTasks.map((task, index) => {
              const globalIndex = tasks.indexOf(task);
              return (
                <CSSTransition key={task.text + globalIndex} timeout={300} classNames="task">
                  <li
                    className={`todo-item ${task.completed ? 'completed' : ''} ${task.priority === 'high' ? 'high-priority' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleComplete(globalIndex)}
                      aria-label={`Mark task "${task.text}" as completed`}
                    />
                    {editIndex === globalIndex ? (
                      <input
                        className="edit-input"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={(e) => handleKeyPressEdit(e, globalIndex)}
                        onBlur={() => saveEdit(globalIndex)}
                        autoFocus
                        aria-label={`Edit task: ${task.text}`}
                      />
                    ) : (
                      <span
                        className="task-text"
                        onDoubleClick={() => startEditing(globalIndex)}
                        tabIndex={0}
                        onKeyDown={e => {
                          if (e.key === 'Enter') startEditing(globalIndex);
                        }}
                        aria-label={`Task: ${task.text}, double click or press enter to edit`}
                      >
                        {task.text}
                      </span>
                    )}

                    <button
                      className="priority-btn"
                      onClick={() => togglePriority(globalIndex)}
                      title="Toggle priority"
                      aria-label={`Set task priority to ${task.priority === 'normal' ? 'high' : 'normal'}`}
                    >
                      ⚡
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => deleteTask(globalIndex)}
                      aria-label={`Delete task: ${task.text}`}
                    >
                      ×
                    </button>
                  </li>
                </CSSTransition>
              );
            })}
          </TransitionGroup>

          <div className="footer">
            <span>{remaining} task{remaining !== 1 ? 's' : ''} left</span>
            <button
              className="clear-btn"
              onClick={clearCompleted}
              disabled={tasks.filter(t => t.completed).length === 0}
            >
              Clear Completed
            </button>
          </div>
        </>
      )}

      {tasks.length === 0 && <p className="empty-msg">Your todo list is empty!</p>}
    </div>
  );
}

export default App;

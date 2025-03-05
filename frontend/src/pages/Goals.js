import React, { useState, useEffect } from "react";
import axios from "axios";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  // Fetch goals for the logged-in user
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/goals", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setGoals(res.data);
      } catch (error) {
        console.error("Error fetching goals:", error.response?.data || error.message);
      }
    };

    fetchGoals();
  }, []);

  // Create a new goal
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/goals",
        { title, targetAmount, deadline },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setGoals([...goals, res.data]);
      setTitle("");
      setTargetAmount("");
      setDeadline("");
    } catch (error) {
      console.error("Error creating goal:", error.response?.data || error.message);
    }
  };

  return (
    <div>
      <h2>Set a Savings Goal</h2>
      <form onSubmit={handleCreateGoal}>
        <input
          type="text"
          placeholder="Goal Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Target Amount"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          required
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />
        <button type="submit">Set Goal</button>
      </form>

      <h2>Your Goals</h2>
      {goals.length === 0 ? (
        <p>No goals found. Set a new goal!</p>
      ) : (
        <ul>
          {goals.map((goal) => (
            <li key={goal._id}>
              <h3>{goal.title}</h3>
              <p>
                Target: ${goal.targetAmount} | Saved: ${goal.currentAmount} | Deadline:{" "}
                {new Date(goal.deadline).toLocaleDateString()}
              </p>
              <progress value={goal.currentAmount} max={goal.targetAmount}></progress>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Goals;
import React, { useState, useEffect } from "react";
import axios from "axios";

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Fetch bills for the logged-in user
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/bills", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setBills(res.data);
      } catch (error) {
        console.error("Error fetching bills:", error.response?.data || error.message);
      }
    };

    fetchBills();
  }, []);

  // Add a new bill
  const handleAddBill = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/bills",
        { name, amount, dueDate },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setBills([...bills, res.data]);
      setName("");
      setAmount("");
      setDueDate("");
    } catch (error) {
      console.error("Error adding bill:", error.response?.data || error.message);
    }
  };

  // Mark a bill as paid
  const handlePayBill = async (billId) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/bills/${billId}/pay`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      // Update the bills list
      const updatedBills = bills.map((bill) =>
        bill._id === billId ? res.data : bill
      );
      setBills(updatedBills);
    } catch (error) {
      console.error("Error paying bill:", error.response?.data || error.message);
    }
  };
  return (
    <div>
      <h2>Upcoming Bills</h2>
      <form onSubmit={handleAddBill}>
        <input
          type="text"
          placeholder="Bill Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
        <button type="submit">Add Bill</button>
      </form>

      <ul>
        {bills.map((bill) => (
          <li key={bill._id}>
            <h3>{bill.name}</h3>
            <p>
              Amount: ${bill.amount} | Due Date: {new Date(bill.dueDate).toLocaleDateString()} |{" "}
              {bill.isPaid ? "Paid" : "Unpaid"}
            </p>
            {!bill.isPaid && (
              <button onClick={() => handlePayBill(bill._id)}>Mark as Paid</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Bills;
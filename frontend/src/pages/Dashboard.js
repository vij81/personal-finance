import React, { useEffect, useState } from "react";
import { useNavigate ,Link} from "react-router-dom";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import "./Dashboard.css";
import Papa from "papaparse";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Expense");
  const [sortOption, setSortOption] = useState("date-desc");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err.response?.data || err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    const fetchTransactions = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await axios.get("http://localhost:5000/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTransactions(res.data);
      } catch (err) {
        console.error("Error fetching transactions:", err.response?.data || err);
      }
    };

    fetchUser();
    fetchTransactions();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/transactions",
        { category:category.trim(), amount: Number(amount), type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTransactions([res.data, ...transactions]);
      setCategory("");
      setAmount("");
      setType("Expense");
    } catch (err) {
      console.error("Error adding transaction:", err.response?.data || err);
    }
  };

  // ➜ SORT FUNCTION
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortOption === "date-desc") return new Date(b.date) - new Date(a.date);
    if (sortOption === "date-asc") return new Date(a.date) - new Date(b.date);
    if (sortOption === "amount-desc") return b.amount - a.amount;
    if (sortOption === "amount-asc") return a.amount - b.amount;
    return 0;
  });

  // ➜ FILTER FUNCTION
  const filteredTransactions =
    filterType === "all"
      ? sortedTransactions
      : sortedTransactions.filter((tx) => tx.type === filterType);

  // ➜ PROCESSING DATA FOR CHARTS
  const processChartData = () => {
    const expenseCategories = {};
    const lineChartData = {};

    transactions.forEach(({ amount, category, type, date }) => {
      const year = new Date(date).getFullYear();
      
      // Line Chart Data Processing
      if (!lineChartData[year]) {
        lineChartData[year] = { year, income: 0, expense: 0 };
      }
      if (type === "Income") {
        lineChartData[year].income += amount;
      } else {
        lineChartData[year].expense += amount;
        
        // Expense Donut Chart Data Processing
        if (!expenseCategories[category]) {
          expenseCategories[category] = 0;
        }
        expenseCategories[category] += amount;
      }
    });

    return {
      expenseData: Object.entries(expenseCategories).map(([name, value]) => ({ name, value })),
      lineData: Object.values(lineChartData),
    };
  };
  const handleDeleteTransaction = async (id) => {
    const token = localStorage.getItem("token");
  
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }
  
    try {
      const res = await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // ✅ Remove transaction from UI after successful delete
      setTransactions(transactions.filter((tx) => tx._id !== id));
  
      alert(res.data.msg); // Show success message
    } catch (err) {
      console.error("Failed to delete transaction:", err.response?.data || err);
      alert("Failed to delete transaction");
    }
  };
  const getTotalIncome = () => {
    return transactions
      .filter((tx) => tx.type === "Income")
      .reduce((acc, tx) => acc + tx.amount, 0);
  };
  
  const getTotalExpense = () => {
    return transactions
      .filter((tx) => tx.type === "Expense")
      .reduce((acc, tx) => acc + tx.amount, 0);
  };
  
  const getCurrentBalance = () => {
    return getTotalIncome() - getTotalExpense();
  };
//   const handleExportCSV = () => {
//     if (transactions.length === 0) {
//       alert("No transactions to export!");
//       return;
//     }
  
//     const csvHeaders = ["Category,Amount,Type,Date"];
//     const csvRows = transactions.map(tx => 
//       `${tx.category},${tx.amount},${tx.type},${new Date(tx.date).toLocaleDateString()}`
//     );
  
//     const csvContent = [csvHeaders, ...csvRows].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = URL.createObjectURL(blob);
  
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "transactions.csv";
//     link.click();
//   };
//   const handleImportCSV = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;
  
//     const reader = new FileReader();
//     reader.onload = async ({ target }) => {
//       const csv = Papa.parse(target.result, { header: true });
  
//       const parsedTransactions = csv.data.map(row => ({
//         category: row.Category,
//         amount: Number(row.Amount),
//         type: row.Type,
//         date: new Date().toISOString(), // Set current date
//       }));
  
//       try {
//         const token = localStorage.getItem("token");
//         await axios.post("http://localhost:5000/api/transactions/bulk", parsedTransactions, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
  
//         setTransactions([...transactions, ...parsedTransactions]);
//         alert("Transactions imported successfully!");
//       } catch (err) {
//         console.error("Error importing CSV:", err);
//         alert("Failed to import transactions.");
//       }
//     };
//     reader.readAsText(file);
//   };
const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert("No transactions to export!");
      return;
    }
  
    const csvHeaders = ["Category,Amount,Type,Date"];
    const csvRows = transactions.map(tx => {
      const formattedDate = new Date(tx.date).toLocaleDateString("en-GB"); // Converts to DD-MM-YYYY
      return `${tx.category},${tx.amount},${tx.type},${formattedDate}`;
    });
  
    const csvContent = [csvHeaders, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    link.click();
  };
  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = async ({ target }) => {
      console.log("📌 Raw CSV Content:\n", target.result); // Debug raw CSV
  
      const csv = Papa.parse(target.result, { header: true, skipEmptyLines: true });
  
      console.log("📌 Parsed CSV Data:", csv.data); // Debug parsed rows
  
      const parsedTransactions = csv.data
        .filter(row => row.Category && row.Amount && row.Type && row.Date) // Ensure valid data
        .map(row => {
          const [day, month, year] = row.Date.split("-"); // Convert DD-MM-YYYY to YYYY-MM-DD
          const formattedDate = `${year}-${month}-${day}`;
  
          return {
            category: row.Category.trim(),
            amount: Number(row.Amount),
            type: row.Type.trim().charAt(0).toUpperCase() + row.Type.trim().slice(1).toLowerCase(), // Capitalize "Expense" or "Income"
            date: formattedDate,
          };
        });
  
      console.log("📌 Final Parsed Transactions:", parsedTransactions); // Debug final transactions
  
      if (parsedTransactions.length === 0) {
        console.error("🚨 No valid transactions found in CSV!");
        alert("Invalid CSV file. Please check the format.");
        return;
      }
  
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          "http://localhost:5000/api/transactions/bulk",
          parsedTransactions,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        setTransactions([...transactions, ...parsedTransactions]);
        alert("Transactions imported successfully!");
      } catch (err) {
        console.error("🚨 Error importing CSV:", err.response?.data || err);
        alert("Failed to import transactions.");
      }
    };
    reader.readAsText(file);
  };
  
  

  const { expenseData, lineData } = processChartData();
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28", "#A28DFF"];

  return (
    <div >
        <nav className="navbar">
            <div className="logo">Finance</div>
            <Link to="/notifications" style={{ color: "white", textDecoration: "none" }} className="headn">Notifications</Link>
            <Link to="/bills" style={{ color: "white" , textDecoration: "none"}}  className="headn" >Bills</Link>
          <Link to="/goals" style={{ color: "white", textDecoration: "none" }} className="headn">Goals</Link>

            <div className="profile-container">
                <div className="profile">{user ? user.name : "User"}</div>
                <button onClick={handleLogout} className="logout-button" >Logout</button>
            </div>
        </nav>
        <div style={{  margin: "auto", padding: "40px" }}>
        <div className="cards-container">
        <div className="card">
            <h3>Current Balance</h3>
            <p style={{ fontSize: "20px", fontWeight: "bold", color: getCurrentBalance() >= 0 ? "green" : "red" }}>
            ₹ {getCurrentBalance()}
            </p>
        </div>
    
        <div className="card">
            <h3>Total Income</h3>
            <p style={{ fontSize: "20px", fontWeight: "bold", color: "green" }}>
            ₹ {getTotalIncome()}
            </p>
        </div>
    
        <div className="card">
            <h3>Total Expense</h3>
            <p style={{ fontSize: "20px", fontWeight: "bold", color: "red" }}>
            ₹ {getTotalExpense()}
            </p>
        </div>
    </div>
        <div className="chart-container">
        <div className="chartl">
        <h2>Income vs Expense Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#0088FE" strokeWidth={2} />
            <Line type="monotone" dataKey="expense" stroke="#FF8042" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
    
        </div>
        <div className="chartr">
            {/* Donut Chart */}
        <h2>Expenses by Category</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={expenseData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name }) => name}
            >
              {expenseData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        </div>
        </div>
      {/* Add Transaction Form */}
      <h2>Add New Transaction</h2>
      <form onSubmit={handleAddTransaction} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          style={{ marginRight: "10px" }}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={{ marginRight: "10px" }}
        />
        <select value={type} onChange={(e) => setType(e.target.value)} required>
          <option value="Expense">Expense</option>
          <option value="Income">Income</option>
        </select>
        <button type="submit" style={{ marginLeft: "10px" }}>Add</button>
      </form>

        <div className="transactions-container">
        <h2>My Transactions</h2>
        <div className="transactions-header">
  
              {/* Sorting & Filtering */}
              <div className="filters">
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="amount-desc">Highest Amount First</option>
                  <option value="amount-asc">Lowest Amount First</option>
              </select>
  
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="all">All</option>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
              </select>
              </div>
              <div className="buttons">
                  <button onClick={handleExportCSV} className="export-btn">
                  📥 Export CSV
                  </button>
                  <label className="import-btn">
              📤 Import CSV
              <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: "none" }} />
              </label>
              </div>
        </div>
        {filteredTransactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <table className="transactions-table">
      <thead>
        <tr >
          <th >Category</th>
          <th >Amount</th>
          <th >Type</th>
          <th >Date</th>
          <th >Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredTransactions.slice((currentPage - 1) * transactionsPerPage, currentPage * transactionsPerPage).map((tx) => (
          <tr key={tx._id} style={{ borderBottom: "1px solid #ddd" }}>
            <td >{tx.category}</td>
            <td >{tx.amount}₹</td>
            <td >
              {tx.type}
            </td>
            <td >{new Date(tx.date).toLocaleDateString()}</td>
            <td style={{ padding: "10px" }}>
              <button 
                onClick={() => handleDeleteTransaction(tx._id)}className="delete-btn" >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
        )}
                      {/* Pagination */}
                  <div className="pagination">
                  <button 
                      disabled={currentPage === 1} 
                      onClick={() => setCurrentPage(currentPage - 1)}
                  >
                      ◀
                  </button>
                  <span className="active">{currentPage}</span>
                  <button 
                      disabled={currentPage === totalPages} 
                      onClick={() => setCurrentPage(currentPage + 1)}
                  >
                      ▶
                  </button>
                  </div>
        </div>
        </div>
    </div>
  );
};

export default Dashboard;

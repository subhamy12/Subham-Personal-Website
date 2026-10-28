import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./App.css";

// Sample transactions so the website demo opens with something to explore.
const sampleTransactions = [
  { id: 1, type: "Deposit", amount: 850, date: "2024-11-01", category: "Paycheck" },
  { id: 2, type: "Withdrawal", amount: 64.25, date: "2024-11-03", category: "Groceries" },
  { id: 3, type: "Withdrawal", amount: 32.5, date: "2024-11-06", category: "Restaurants" },
  { id: 4, type: "Withdrawal", amount: 45, date: "2024-11-09", category: "Transportation" },
  { id: 5, type: "Deposit", amount: 120, date: "2024-11-12", category: "Other Income" },
  { id: 6, type: "Withdrawal", amount: 18.99, date: "2024-11-15", category: "Entertainment" },
  { id: 7, type: "Withdrawal", amount: 41.75, date: "2024-11-18", category: "Groceries" },
];

const sampleBalance = sampleTransactions.reduce(
  (acc, t) => (t.type === "Deposit" ? acc + t.amount : acc - t.amount),
  0
);

function App() {
 // State variables to manage data and application state
 const [transactions, setTransactions] = useState(sampleTransactions); // Holds all transactions
 const [balance, setBalance] = useState(parseFloat(sampleBalance.toFixed(2))); // Current balance based on transactions
 const [amount, setAmount] = useState(""); // Input amount for a transaction
 const [category, setCategory] = useState(""); // Selected category for the transaction
 const [type, setType] = useState("Deposit"); // Type of transaction (Deposit or Withdrawal)
 const [date, setDate] = useState(""); // Date of the transaction
 const [filteredTransactions, setFilteredTransactions] = useState(transactions); // Transactions after filtering
 const [filterType, setFilterType] = useState(""); // Type of filter applied (amount, date, or category)
 const [filterValue, setFilterValue] = useState(""); // Value for the current filter
 const [startDate, setStartDate] = useState(""); // Start date for date range filtering
 const [endDate, setEndDate] = useState(""); // End date for date range filtering

 // Categories for transactions based on type
 const categories = {
   Deposit: ["", "Paycheck", "Other Income"],
   Withdrawal: [
     "", "Groceries", "Restaurants", "Leisure", "Entertainment", "Health Care", "Rent", "Car", "Mortgage",
     "Insurance", "Utility", "Transportation", "Other Spending"
   ]
 };

 // Event handlers for form inputs
 const handleAmountChange = (e) => setAmount(e.target.value);
 const handleCategoryChange = (e) => setCategory(e.target.value);
 const handleTypeChange = (e) => setType(e.target.value);
 const handleDateChange = (e) => setDate(e.target.value);
 const handleFilterTypeChange = (e) => setFilterType(e.target.value);
 const handleFilterValueChange = (e) => setFilterValue(e.target.value);
 const handleStartDateChange = (e) => setStartDate(e.target.value);
 const handleEndDateChange = (e) => setEndDate(e.target.value);

   // Handle Done button for editing an existing transaction
   const handleDoneClick = () => {
     if (!amount || amount <= 0 || !category || !date) {
       alert("Please enter a valid amount, select a category, and choose a date.");
       return;
     }
  
     // Check if we're editing an existing transaction
     const editingTransaction = transactions.find((t) => t.isEditing);
  
     // Create the transaction object
     const newTransaction = {
       id: editingTransaction ? editingTransaction.id : Math.max(0, ...transactions.map((t) => t.id)) + 1, // Use existing ID if editing, otherwise generate a new one
       type,
       amount: parseFloat(amount),
       date,
       category,
     };
  
     // Update the transaction list
     const updatedTransactions = editingTransaction
       ? transactions.map((t) => (t.id === editingTransaction.id ? newTransaction : t)) // Replace the edited transaction
       : [...transactions, newTransaction]; // Add a new transaction
  
     // Update state
     setTransactions(updatedTransactions);
     setFilteredTransactions(updatedTransactions); // Update filtered transactions
  
     // Recalculate the balance
     const newBalance = updatedTransactions.reduce((acc, t) => {
       return t.type === "Deposit" ? acc + t.amount : acc - t.amount;
     }, 0);
     setBalance(parseFloat(newBalance.toFixed(2)));
  
     // Reset form fields
     setAmount("");
     setCategory("");
     setDate("");
  
     // Clear the editing state if applicable
     if (editingTransaction) {
       setTransactions((prevTransactions) =>
         prevTransactions.map((t) => ({ ...t, isEditing: false }))
       );
     }
   };
  
 // Edit a transaction: sets fields for editing and deletes the original
 const handleEdit = (transaction) => {
   // Populate the form fields with the transaction's data for editing
   setAmount(transaction.amount);
   setType(transaction.type);
   setCategory(transaction.category);
   setDate(transaction.date);
    // Remove the transaction from the list while editing it
   setTransactions((prevTransactions) =>
     prevTransactions.map((t) =>
       t.id === transaction.id ? { ...t, isEditing: true } : t
     )
   );
 };

 // Delete a transaction and recalculate the balance
 const handleDelete = (id) => {
   const updatedTransactions = transactions.filter((t) => t.id !== id);
   setTransactions(updatedTransactions);
   setFilteredTransactions(updatedTransactions);
   const newBalance = updatedTransactions.reduce((acc, t) => {
     return t.type === "Deposit" ? acc + t.amount : acc - t.amount;
   }, 0);
   setBalance(parseFloat(newBalance.toFixed(2)));
 };

 // Apply filters based on filter type and value
 const applyFilter = () => {
   let filtered = [...transactions];

   if (!filterType || !filterValue) {
     setFilteredTransactions(transactions); // Reset to all transactions
     return;
   }

   if (filterType === "amount") {
     filtered = filtered.filter(
       (transaction) => transaction.amount.toString().includes(filterValue)
     );
   } else if (filterType === "date") {
     filtered = filtered.filter((transaction) =>
       transaction.date.includes(filterValue)
     );
   } else if (filterType === "category") {
     filtered = filtered.filter((transaction) =>
       transaction.category.toLowerCase().includes(filterValue.toLowerCase())
     );
   }

   if (filtered.length === 0) {
     alert("No transactions found matching the filter.");
   }

   setFilteredTransactions(filtered);
 };

 // Generate expense data for the chart
 const generateExpenseData = () => {
   const expenseData = filteredTransactions
     .filter(transaction => transaction.type === "Withdrawal")
     .reduce((acc, transaction) => {
       acc[transaction.category] = acc[transaction.category] + transaction.amount || transaction.amount;
       return acc;
     }, {});

   return Object.entries(expenseData).map(([category, amount]) => ({
     category,
     amount
   }));
 };

 // Filter transactions within a custom date range
 const filterByCustomDateRange = () => {
   if (!startDate || !endDate) {
     alert("Please select both start and end dates.");
     return;
   }

   const start = new Date(startDate);
   const end = new Date(endDate);

   if (start > end) {
     alert("Start date cannot be after the end date.");
     return;
   }

   const filtered = transactions.filter((transaction) => {
     const transactionDate = new Date(transaction.date);
     return transactionDate >= start && transactionDate <= end;
   });

   if (filtered.length === 0) {
     alert("No transactions found in the selected date range.");
   }

   setFilteredTransactions(filtered);
 };

 // Define the columns for the transaction history table
 const columns = [
   { field: "id", headerName: "ID", width: 70 },
   { field: "type", headerName: "Type", width: 120 },
   { field: "amount", headerName: "Amount", width: 150 },
   { field: "date", headerName: "Date", width: 180 },
   { field: "category", headerName: "Category", width: 200 },
   {
     field: "actions",
     headerName: "Actions",
     width: 200,
     renderCell: (params) => (
       <div>
         <button className="datagridbutton" onClick={() => handleEdit(params.row)}>Edit</button>
         <button className="datagridbutton" onClick={() => handleDelete(params.row.id)}>Delete</button>
       </div>
     ),
   },
 ];

 return (
   // JSX structure for the app
   // Each section is explained in its corresponding comment above
   <div className="App">
     <div className="transaction-container">
       <h1>Transaction Form</h1>
       <h2 className="balance" style={{ color: balance >= 0 ? "green" : "red" }}>Balance: ${balance}</h2>

       <div>
         <h3>
         ‎
         </h3>
       </div>
       <form>
         <div className="input-group">
           <label htmlFor="amount">Amount</label>
           <input
             id="amount"
             type="number"
             value={amount}
             onChange={handleAmountChange}
             placeholder="Enter Amount"
             aria-label="Transaction Amount"
           />
         </div>
         <div className="input-group">
           <label htmlFor="type">Transaction Type</label>
           <select id="type" value={type} onChange={handleTypeChange} aria-label="Transaction Type">
             <option value="Deposit">Deposit</option>
             <option value="Withdrawal">Withdrawal</option>
           </select>
         </div>
         <div className="input-group">
           <label htmlFor="category">Category</label>
           <select
             id="category"
             value={category}
             onChange={handleCategoryChange}
             disabled={!type}
             aria-label="Transaction Category"
           >
             {(categories[type] || []).map((option) => (
               <option key={option} value={option}>
                 {option}
               </option>
             ))}
           </select>
         </div>
         <div className="input-group">
           <label htmlFor="date">Date</label>
           <input
             id="date"
             type="date"
             value={date}
             onChange={handleDateChange}
             aria-label="Transaction Date"
           />
         </div>
         <div className="input-group">
           <button type="button" onClick={handleDoneClick} className="done-button">
             Done
           </button>
         </div>
       </form>
     </div>

     <div className="filter-container">
       <h2>Filter Transactions</h2>
       <select value={filterType} onChange={handleFilterTypeChange} aria-label="Filter Type">
         <option value="">No Filter</option>
         <option value="amount">Amount</option>
         <option value="date">Date</option>
         <option value="category">Category</option>
       </select>
       <input
         type="text"
         value={filterValue}
         onChange={handleFilterValueChange}
         placeholder="Filter value"
         aria-label="Filter Value"
       />
       <button className="filterbutton" onClick={applyFilter}>
         Apply
       </button>
      
     </div>

     <div className="transaction-history-container">
       <h2>Transaction History</h2>
       <div className="table-container">
         <DataGrid
           rows={filteredTransactions}
           columns={columns}
           initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
           pageSizeOptions={[5, 10, 20]}
           checkboxSelection
           disableRowSelectionOnClick
         />
       </div>
     </div>

     <div className="input-group">
       <h2>Filter by Date Range</h2>
       <input className="dateInputs"
         type="date"
         value={startDate}
         onChange={handleStartDateChange}
         placeholder="Start Date"
         aria-label="Start Date"
       />
       <input className="dateInputs"
         type="date"
         value={endDate}
         onChange={handleEndDateChange}
         placeholder="End Date"
         aria-label="End Date"
       />
       <button onClick={filterByCustomDateRange}>Apply Date Range</button>
       <div className="summary-container">
       <h2>Summary</h2>
       <h3>Total Income: ${filteredTransactions
         .filter((t) => t.type === "Deposit")
         .reduce((acc, t) => acc + t.amount, 0)
         .toFixed(2)}</h3>
       <h3>Total Expenses: ${filteredTransactions
         .filter((t) => t.type === "Withdrawal")
         .reduce((acc, t) => acc + t.amount, 0)
         .toFixed(2)}</h3>
       </div>
     </div>


     <div className="expense-chart-container">
       <h2>Spending Pattern</h2>
       <ResponsiveContainer width="100%" height={400}>
         <BarChart data={generateExpenseData()}>
           <CartesianGrid strokeDasharray="3 3" />
           <XAxis dataKey="category" />
           <YAxis />
           <Tooltip />
           <Legend />
           <Bar dataKey="amount" fill="#218838"/>
         </BarChart>
       </ResponsiveContainer>
     </div>
   </div>


  
 );
}

export default App;

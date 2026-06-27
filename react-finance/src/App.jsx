import { useState, useEffect } from 'react';
import './App.css';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

//Register Chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  //1.React State: Load from localStorage or use defaults
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('react_transactions');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Salary', amount: 3200, type: 'income' },
      { id: 2, text: 'Groceries', amount: 800, type: 'expense' }
    ];
  });

  //State for controlling active navigation tabs
  const [activeTab, setActiveTab] = useState('main');

  //Form input states
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');

  //2.React Effect: Automatically save to localStorage
  useEffect(() => {
    localStorage.setItem('react_transactions', JSON.stringify(transactions));
  }, [transactions]);

  //3.Math Calculations
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = income - expense;

  //4.Prepare Data for Chart.js (Only filtering expenses)
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const chartLabels = expenseTransactions.map(t => t.text);
  const chartDataValues = expenseTransactions.map(t => t.amount);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Expenses ($)',
        data: chartDataValues,
        backgroundColor: [
          '#d5944a',
          '#5ed4a7',
          '#a2ce32',
          '#43bdfe', 
          '#2e5833',
          '#122214',
        ],
        borderColor: 'transparent', 
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: '#a1a1aa',
          boxBorderWidth: 0,
          font: {
            family: '-apple-system, BlinkMacSystemFont',
            size: 12
          }
        }
      }
    }
  };

  //5.Actions: Add new item
  const handleAddTransaction = (e) => {
    e.preventDefault();

    const newTransaction = {
      id: Date.now(),
      text: text,
      amount: parseFloat(amount),
      type: type
    };

    setTransactions([...transactions, newTransaction]);
    
    //Clear inputs
    setText('');
    setAmount('');
  };

  //Actions: Delete item
  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  //6.UI Render Layer
  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <h2>Finance Dashboard</h2>
        <nav>
          <a 
            href="#" 
            className={activeTab === 'main' ? 'active' : ''} 
            onClick={() => setActiveTab('main')}
          >
            Main
          </a>
          <a 
            href="#" 
            className={activeTab === 'reports' ? 'active' : ''} 
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </a>
          <a 
            href="#" 
            className={activeTab === 'settings' ? 'active' : ''} 
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </a>
        </nav>
      </aside>

      {/* Main Content Dashboard */}
      <div className="main-content">
        <header className="header">
          <h1>
            {activeTab === 'main' && "Welcome to Your Finance Dashboard"}
            {activeTab === 'reports' && "Financial Reports"}
            {activeTab === 'settings' && "Dashboard Settings"}
          </h1>
        </header>

        {/* main tab content */}
        {activeTab === 'main' && (
          <main className="dashboard-grid">
            {/* Balance Card */}
            <div className="card balance-card">
              <h3>Current Balance</h3>
              <p className="amount">${totalBalance.toLocaleString()}</p>
            </div>

            {/* Income Card */}
            <div className="card income-card">
              <h3>Income</h3>
              <p className="amount green">+${income.toLocaleString()}</p>
            </div>

            {/* Expense Card */}
            <div className="card expense-card">
              <h3>Expenses</h3>
              <p className="amount red">-${expense.toLocaleString()}</p>
            </div>

            {/* Add Transaction Form */}
            <div className="card form-card">
              <h3>Add New Transaction</h3>
              <form onSubmit={handleAddTransaction}>
                <div className="form-control">
                  <label>Description</label>
                  <input 
                    type="text" 
                    placeholder="Enter description..." 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-control">
                  <label>Amount ($)</label>
                  <input 
                    type="number" 
                    placeholder="Enter amount..." 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-control">
                  <label>Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="income">Income (+)</option>
                    <option value="expense">Expense (-)</option>
                  </select>
                </div>
                <button className="btn">Add Transaction</button>
              </form>
            </div>

            {/* Transaction History List */}
            <div className="card history-card">
              <h3>History</h3>
              <ul className="list">
                {transactions.map((t) => (
                  <li key={t.id} className={t.type === 'income' ? 'plus' : 'minus'}>
                    {t.text}
                    <span>
                      {t.type === 'income' ? '+' : '-'}${t.amount}
                      <button className="delete-btn" onClick={() => handleDeleteTransaction(t.id)}>x</button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chart.js Breakdown Diagram */}
            <div className="card chart-card">
              <h3>Expense Breakdown</h3>
              <div style={{ maxWidth: '240px', margin: '0 auto' }}>
                {expenseTransactions.length > 0 ? (
                  <Doughnut data={chartData} options={chartOptions} />
                ) : (
                  <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', marginTop: '20px' }}>
                    No expenses yet to show charts.
                  </p>
                )}
              </div>
            </div>
          </main>
        )}

        {/* reports tab content */}
        {activeTab === 'reports' && (
          <div className="card">
            <h3>All Transactions Archive</h3>
            <p style={{ color: '#a1a1aa', marginTop: '10px' }}>
              Total transactions recorded: {transactions.length}
            </p>
          </div>
        )}

        {/* settings tab content */}
        {activeTab === 'settings' && (
          <div className="card">
            <p style={{ color: '#a1a1aa', marginTop: '10px' }}>
              Currency: EU (€)<br />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
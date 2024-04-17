import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import Logo from './components/Logo';

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  const onFormSubmit = async (e) => {
    e.preventDefault();

    if (!pdfFile || !csvFile) {
      alert('Please upload both PDF and CSV files before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('pdf_file', pdfFile);
    formData.append('csv_file', csvFile);

    try {
      const response = await axios.post('http://127.0.0.1:5000/compare', formData);
      const resultsData = response.data;

      setResults(resultsData);
      setShowResults(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <header className="minimal-header">
        <Logo />
      </header>
      <form onSubmit={onFormSubmit} className="upload-form">
        <label htmlFor="pdf_file">Select Bank Statement (PDF)</label>
        <input type="file" accept=".pdf" id="pdf_file" onChange={(e) => setPdfFile(e.target.files[0])} />

        <label htmlFor="csv_file">Select Investment Statement (CSV)</label>
        <input type="file" accept=".csv" id="csv_file" onChange={(e) => setCsvFile(e.target.files[0])} />

        <button type="submit">Submit</button>
      </form>
      {showResults && (
        <div className="results-container">
          <h2>Transaction Comparison Results</h2>
          <p>Number of matched transactions: {results.matched_transactions.length}</p>
          <p>Number of mismatched transactions: {results.mismatched_transactions.length}</p>

          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>PDF Amount</th>
                <th>CSV Amount</th>
                <th>Transaction Remarks (PDF)</th>
                <th>Match</th>
              </tr>
            </thead>
            <tbody>
              {results.matched_transactions.map((transaction) => (
                <tr key={transaction.date} className="matched">
                  <td>{transaction.date}</td>
                  <td>{transaction.pdf_amount}</td>
                  <td>{transaction.csv_amount}</td>
                  <td>{transaction.pdf_remarks}</td>
                  <td className="match match-success">✔</td>
                </tr>
              ))}
              {results.mismatched_transactions.map((transaction) => (
                <tr key={transaction.date} className="mismatched">
                  <td>{transaction.date}</td>
                  <td>{transaction.pdf_amount}</td>
                  <td>{transaction.csv_amounts.join(', ')}</td>
                  <td>{transaction.pdf_remarks}</td>
                  <td className="match match-fail">❌</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;

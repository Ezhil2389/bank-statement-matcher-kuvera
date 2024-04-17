import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';
import Logo from './components/Logo';
import { useReactToPrint } from 'react-to-print';

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const componentRef = useRef();

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
      const response = await axios.post('http://127.0.0.1:5000/compare', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadProgress(progress);
        },
      });

      const resultsData = response.data;

      if (
        resultsData &&
        resultsData.matched_transactions &&
        resultsData.mismatched_transactions
      ) {
        const filteredResults = {
          matched_transactions: resultsData.matched_transactions.filter(transaction => transaction.pdf_amount !== 0),
          mismatched_transactions: resultsData.mismatched_transactions
        };

        setResults(filteredResults);
        setShowResults(true);
      } else {
        const flattenedResults = flattenResults(resultsData);
        setResults(flattenedResults);
        setShowResults(true);
      }

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const flattenResults = (data) => {
    return { matched_transactions: [], mismatched_transactions: [] };
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const toggleTableVisibility = () => {
    setShowTable(!showTable);
  };

  const handleCloseTable = () => {
    setShowTable(false);
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

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="progress-bar">
            <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}
      </form>

      {showResults && (
        <div className="results-container" ref={componentRef}>
          <h2>Transaction Comparison Results</h2>
          <p>Number of matched transactions: {results.matched_transactions?.length || 0}</p>
          <p>Number of mismatched transactions: {results.mismatched_transactions?.length || 0}</p>

          {showTable ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Date Withdrawn</th>
                  <th>Withdrawn Amount</th>
                  <th>Date Invested</th>
                  <th>Invested Amount</th>
                  <th>Transaction Remarks</th>
                  <th>Match</th>
                </tr>
              </thead>
              <tbody>
                {results.matched_transactions?.map((transaction) => (
                  <tr key={transaction.date} className="matched">
                    <td>{transaction.date}</td>
                    <td>{transaction.pdf_amount}</td>
                    <td>{transaction.csv_entries && transaction.csv_entries.length > 0 ? transaction.csv_entries[0].date : 'N/A'}</td>
                    <td>{transaction.csv_entries && transaction.csv_entries.length > 0 ? transaction.csv_entries.map(entry => entry.amount).join(', ') : 'N/A'}</td>
                    <td>{transaction.pdf_remarks}</td>
                    <td className="match match-success">✔</td>
                  </tr>
                ))}
                {results.mismatched_transactions?.map((transaction) => (
                  <tr key={transaction.date} className="mismatched">
                    <td>{transaction.date}</td>
                    <td>{transaction.pdf_amount}</td>
                    <td>N/A</td>
                    <td>N/A</td>
                    <td>{transaction.pdf_remarks}</td>
                    <td className="match match-fail">❌</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <button onClick={toggleTableVisibility}>View Detailed Statement</button>
          )}
          {showTable && (
            <>
              <button className="styled-button" onClick={handlePrint}>Download as PDF</button>
              <button className="styled-button" onClick={handleCloseTable}>Close Table</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

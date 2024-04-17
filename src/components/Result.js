// components/Result.js
import React from 'react';

const Result = ({ matchedTransactions, mismatchedTransactions }) => {
  return (
    <div>
      <h2 className="results-heading">Results</h2>
      {matchedTransactions.length > 0 && (
        <div className="matched-transactions">
          <h3>Matched Transactions</h3>
          <ul>
            {matchedTransactions.map((transaction, index) => (
              <li key={index}>
                Date: {transaction.date} | PDF Amount: {transaction.pdf_amount} | CSV Amount: {transaction.csv_amount}
              </li>
            ))}
          </ul>
        </div>
      )}
      {mismatchedTransactions.length > 0 && (
        <div className="mismatched-transactions">
          <h3>Mismatched Transactions</h3>
          <ul>
            {mismatchedTransactions.map((transaction, index) => (
              <li key={index}>
                Date: {transaction.date} | PDF Amount: {transaction.pdf_amount} | CSV Amounts: {transaction.csv_amounts.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Result;

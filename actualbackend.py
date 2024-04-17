import os
from flask import Flask, jsonify, render_template, request, redirect, url_for
from werkzeug.utils import secure_filename
import pdfplumber
import re
import csv
from datetime import datetime
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
ALLOWED_EXTENSIONS = {'pdf', 'csv'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024   # 16MB limit for uploaded files

def extract_date_and_spent_amount(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        transactions = []
        current_transaction = None

        for page in pdf.pages:
            lines = page.extract_text().split('\n')

            for line in lines:
                # Check if the line contains a date
                date_match = re.search(r'(\d{2}/\d{2}/\d{4})', line)
                if date_match:
                    # New transaction
                    if current_transaction:
                        transactions.append(current_transaction)
                    current_transaction = {'date': date_match.group(1), 'spent_amount': None}

                # Check if the line contains a numeric value for spent amount
                spent_amount_match = re.search(r'(\d+\.\d+)', line)
                if spent_amount_match and current_transaction:
                    current_transaction['spent_amount'] = float(spent_amount_match.group(1).replace(',', ''))

        # Append the last transaction if present
        if current_transaction:
            transactions.append(current_transaction)

        return transactions

def extract_date_and_amount_from_csv(csv_path):
    transactions_csv = []

    try:
        with open(csv_path, 'r') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                date_str = row.get('Date', '').strip()
                amount_str = row.get(' Amount (INR)', '').strip().replace(',', '')
                
                if date_str and amount_str:  # Check if both date and amount are present
                    # Parse date and change format
                    date = datetime.strptime(date_str, '%Y-%m-%d').strftime('%d/%m/%Y')
                    amount = float(amount_str)
                    transactions_csv.append({'date': date, 'amount': amount})
    except Exception as e:
        print(f"Error reading CSV file: {e}")

    return transactions_csv

def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def compare_transactions_with_percentage(pdf_transactions, csv_transactions, percentage=0.00500013):
    matched_transactions = []
    mismatched_transactions = []
    matched_dates = set()

    for pdf_entry in pdf_transactions:
        pdf_date = pdf_entry['date']
        pdf_amount = pdf_entry['spent_amount']

        # Check if the date is already matched, if yes, ignore this transaction
        if pdf_date in matched_dates:
            continue

        # Find matching entry in CSV transactions for the same date
        matching_csv_entries = [csv_entry for csv_entry in csv_transactions if csv_entry['date'] == pdf_date]

        if not matching_csv_entries:
            continue

        # Check if any matching entry has an amount within the percentage or if both amounts are equal
        match_found = any(
            abs(pdf_amount - csv_entry['amount']) / pdf_amount <= percentage or pdf_amount == csv_entry['amount']
            for csv_entry in matching_csv_entries
        )

        if not match_found:
            mismatched_transactions.append({
                'date': pdf_date,
                'pdf_amount': pdf_amount,
                'csv_amounts': [entry['amount'] for entry in matching_csv_entries]
            })
            continue

        # Mark the date as matched
        matched_dates.add(pdf_date)

        matching_entry = matching_csv_entries[0]
        matched_transactions.append({
            'date': pdf_date,
            'pdf_amount': pdf_amount,
            'csv_amount': matching_entry['amount']
        })

    return matched_transactions, mismatched_transactions

    matched_transactions = []
    mismatched_transactions = []

    for pdf_entry in pdf_transactions:
        pdf_date = pdf_entry['date']
        pdf_amount = pdf_entry['spent_amount']

        # Find matching entry in CSV transactions for the same date
        matching_csv_entries = [csv_entry for csv_entry in csv_transactions if csv_entry['date'] == pdf_date]

        if not matching_csv_entries:
            continue

        # Check if any matching entry has an amount within the percentage or if both amounts are equal
        match_found = any(
            abs(pdf_amount - csv_entry['amount']) / pdf_amount <= percentage or pdf_amount == csv_entry['amount']
            for csv_entry in matching_csv_entries
        )

        if not match_found:
            mismatched_transactions.append({
                'date': pdf_date,
                'pdf_amount': pdf_amount,
                'csv_amounts': [entry['amount'] for entry in matching_csv_entries]
            })
            continue

        matching_entry = matching_csv_entries[0]
        matched_transactions.append({
            'date': pdf_date,
            'pdf_amount': pdf_amount,
            'csv_amount': matching_entry['amount']
        })

    return matched_transactions, mismatched_transactions

# Update the route to return JSON response
@app.route('/', methods=['POST'])
def compare_and_display():
    if 'pdf_file' not in request.files or 'csv_file' not in request.files:
        return jsonify({'error': 'PDF and CSV files are required'}), 400

    pdf_file = request.files['pdf_file']
    csv_file = request.files['csv_file']

    if pdf_file.filename == '' or csv_file.filename == '' or \
            not allowed_file(pdf_file.filename, {'pdf'}) or \
            not allowed_file(csv_file.filename, {'csv'}):
        return jsonify({'error': 'Invalid file formats'}), 400

    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(pdf_file.filename))
    csv_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(csv_file.filename))
    pdf_file.save(pdf_path)
    csv_file.save(csv_path)

    # Extract data from PDF and CSV files
    extracted_data_pdf = extract_date_and_spent_amount(pdf_path)
    extracted_data_csv = extract_date_and_amount_from_csv(csv_path)

    # Compare transactions locally without using the SQLite database
    matched, mismatched = compare_transactions_with_percentage(extracted_data_pdf, extracted_data_csv, percentage=0.00500013)

    return jsonify({'matched': matched, 'mismatched': mismatched})

# Remove the render_template import and update the 'return' statement

if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    app.run(debug=True)

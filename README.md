# Kuvera Bank Statement Matcher

The Kuvera Bank Statement Matcher is an add-on feature designed to streamline the process of reconciling bank statements with investment transactions recorded on the Kuvera platform. This tool allows users to upload their bank statement in PDF format and their investment statement from Kuvera in CSV format. It then matches transactions between the two statements and identifies any discrepancies.

## How it Works
1. **Upload Files**: Users can upload their bank statement (currently only supports PDFs from ICICI Bank) and their investment statement from Kuvera as CSV files.
2. **Transaction Matching**: The tool matches transactions between the bank statement and the Kuvera investment statement based on the transaction amounts.
3. **Discrepancy Detection**: Any discrepancies between the two statements are identified and displayed in a table. Discrepancies are indicated with a red cross emoji.
4. **Download Report**: Users have the option to download the table showing the matched transactions and discrepancies as a PDF file.


# React Frontend

This project contains the frontend code for the Kuvera Bank Statement Matcher.

## Files
- **App.css**: CSS file containing styling for the React components.
- **App.js**: Main JavaScript file containing the React components and logic for handling file uploads and displaying the matched transactions table.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However, we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).


# Flask Backend

This project contains the Flask backend code for the Kuvera Bank Statement Matcher.

## Files
- **actualbackend.py**: Flask backend file containing the server-side logic for processing file uploads, matching transactions, and generating the PDF report.

## Installation and Setup

### Prerequisites
- Python and pip for running the Flask backend.

### Backend Installation
1. Navigate to the root directory of the project.
2. Install Flask and other dependencies using pip:
   ```bash
   pip install flask



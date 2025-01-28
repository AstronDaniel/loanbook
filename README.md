# LoanBook App Documentation

A web application built using React.js, React DOM, and Tailwind CSS for managing loans, tracking financial transactions, and generating balance sheets.

## Overview

LoanBook is designed to streamline loan management, ensure accurate financial tracking, and provide real-time reporting through an intuitive user interface. This documentation outlines the application's architecture, modules, and functionalities, and serves as a guide for developers and users.

## Goals

- Efficiently manage loan records.
- Track various financial transactions including expenses and income.
- Generate clear, detailed reports for analysis.
- Provide a visually appealing dashboard for quick insights into financial health.

## App Structure

### Core Modules

- **Loan Management**: Manage loans by creating, viewing, editing, and deleting loan records.
- **Financial Tracking**: Record income, expenses, and interest payments comprehensively.
- **Reports Generation**: Create balance sheets, transaction summaries, and visual financial reports.
- **Dashboard Visualization**: Display key performance indicators and financial summaries.

### Screen-by-Screen Breakdown

1. **Transaction Ledger**

   **Purpose**: Display daily transactions and closing balances.

   **UI Components**:
   - A table with the following columns: Date, Transaction Narration, Amount, Closing Balance.
   - Static label: Account Balance.

2. **Debtors List**

   **Purpose**: Track loan repayments and payments due.

   **UI Components**:
   - Table with columns: No, Name, Amount, Interest, Balance, Repayment Date, Aging.
   - Simplified view on mobile: No, Details, Amount, Date, Aging, Total.

3. **Balance Sheet**

   **Purpose**: Summarize the company's assets, liabilities, and equity.

   **UI Components**:
   - Assets Section: Lists Debtors, Cash at Hand, Cash at Bank.
   - Liabilities Section: Shows ongoing loans.
   - Equity Section: Displays Capital, Retained Earnings.
   - Totals Section: Calculates Total Assets, Total Liabilities, and Total Equity.

4. **Interest & Expenses Tracking**

   **Purpose**: Monitor monthly interest income and expenses incurred.

   **UI Components**:
   - Interest Earned Section: List customers and the respective interest earned.
   - Total Interest Earned: Show aggregated interest for the month.
   - Expenses Section: Categorizes expenses like Transport Charges, Airtime and Data, etc.
   - Profit Calculation: Shows net profit as Interest Earned - Total Expenses.

5. **Loan Details Form**

   **Purpose**: Allow users to add or edit loan entries.

   **UI Components**:
   - Input fields: Name, Loan Type (dropdown), Amount, Interest, Repayment Date (date picker).
   - Buttons: Share, Reset, Confirm Submission.
   - A confirmation modal prompts the user to confirm submission.

6. **Interest & Expenses Form**

   **Purpose**: Input and save monthly interest and expenses.

   **UI Components**:
   - Fields: Month (dropdown), Interest Earned, Expenses (with subcategories).
   - Buttons: Save, Reset, Confirm Submission.

7. **Transactions Log**

   **Purpose**: View and add new transaction details.

   **UI Components**:
   - Table columns: No, Details, Amount, Date, Aging.
   - A button to save new transaction records.

8. **Balance Sheet Dashboard**

   **Purpose**: Visualize financial data and performance.

   **UI Components**:
   - Assets Distribution: Show a pie chart comparing cash at hand and cash at the bank.
   - Liabilities Distribution: Utilize a bar chart to represent loans and expenses.
   - Overall Performance: Depict financial trends using line graphs.
   - An option provided to Export to CSV for reporting.

9. **Financial Ledger**

   **Purpose**: Display comprehensive transaction history.

   **UI Components**:
   - Table with columns: #, Transaction Narration, Amount, Closing Balance.
   - A button to save changes.

## Application Flow

### User Journey

1. **User Registration/Login**:
   - Users can create an account or log in to an existing account.
   - Secure authentication is managed to ensure data confidentiality.

2. **Dashboard Access**:
   - Upon logging in, users are directed to the main dashboard, where they can view key metrics, recent transactions, and overall financial status at a glance.

3. **Loan Management**:
   - Users can add, edit, or delete loan entries.
   - The Loan Management interface allows users to input loan details (amount, interest, repayment date, etc.) and tracks each loan's status.

4. **Financial Transactions**:
   - Users can record income generated from loans and expenses incurred.
   - The transaction ledger displays all transactions with options to filter by date range or type of transaction.

5. **Reporting**:
   - Users can generate reports, such as balance sheets and transaction summaries.
   - Reports are visually represented with charts and tables for better understanding.

6. **User Settings**:
   - Users can adjust settings, change passwords, and log out from their accounts.

## Navigation Flow

- **Top Navigation Bar**:
  - Home/Dashboard
  - Loan Management
  - Interest & Expenses
  - Transactions
  - Reports

- **Side Menu**: Logout, Export to CSV, Toggle Dark Mode.

## Data Models

### Loan Model

```json
{
  "id": "string",
  "name": "string",
  "type": "Personal/Business",
  "amount": "number",
  "interest": "number",
  "balance": "number",
  "repaymentDate": "date",
  "aging": "number"
}
```

### Transaction Model

```json
{
  "date": "date",
  "narration": "string",
  "amount": "number",
  "closingBalance": "number"
}
```

### Balance Sheet Model

```json
{
  "assets": {
    "cashAtHand": "number",
    "cashAtBank": "number",
    "debtors": "number"
  },
  "liabilities": {
    "loans": "number"
  },
  "equity": {
    "capital": "number",
    "retainedEarnings": "number"
  }
}
```

## Technical Considerations

- **React Libraries**: Implement react-router-dom for page navigation, chart.js for creating dynamic graphs.
- **CSS Framework**: Utilize Tailwind CSS for styling components.
- **State Management**: Utilize Redux or the Context API to manage global state across components.
- **Data Persistence**: Use LocalStorage or a backend database (like Firebase) for persistent data storage and user sessions.
- **Form Validation**: Implement comprehensive validation to ensure correct inputs (e.g., non-negative numbers, valid date formats).

## Setup Instructions

1. Install dependencies:
   ```sh
   npm install
   ```

2. Build Tailwind CSS:
   ```sh
   npm run build:css
   ```

3. Start the development server:
   ```sh
   npm start
   ```

## User Flow Example

1. Add a loan via the Loan Management interface → Input necessary data → Confirm submission.
2. Record monthly interest/expenses through the Interest & Expenses module.
3. View aggregated data on the Balance Sheet Dashboard.
4. Export financial data to CSV format for external reporting.

## UI Functionality and Design

### Core Pages

1. **Login/Registration Page**

   **Functionality**: Enable users to create accounts or log in.

   **UI Elements**:
   - Input fields for username and password.
   - Buttons for submitting login/register requests.
   - Links for password recovery.

2. **Dashboard Page**

   **Functionality**: Overview of financial activity, quick access to manage loans and transactions.

   **UI Elements**:
   - Summary cards displaying total loans, interest earned, and ongoing expenses.
   - Quick links to common actions (Add Loan, Add Transaction).
   - Visual graphs representing income and expenses.

3. **Loan Management Page**

   **Functionality**: Add, edit, or view details of loans.

   **UI Elements**:
   - A form to input loan details (amount, interest rate, repayment terms).
   - Table displaying a list of current loans with editing options.
   - Buttons for submitting or deleting loan entries.

4. **Transaction Ledger Page**

   **Functionality**: Log and track all financial transactions.

   **UI Elements**:
   - Input fields for entering transaction details (narration, amount, date).
   - A table showing all transactions with sortable columns.
   - Filtering options by date or transaction type.

5. **Balance Sheet Page**

   **Functionality**: Summarize the company's financial health based on assets and liabilities.

   **UI Elements**:
   - Sections for Assets, Liabilities, and Equity with detailed breakdowns.
   - Calculated totals for easy assessments.
   - Visual summaries (charts) highlighting financial allocations.

6. **Reporting Page**

   **Functionality**: Generate comprehensive reports for analysis.

   **UI Elements**:
   - Filters for selecting report date ranges.
   - Export options for generating reports in CSV format.
   - Visual representations of financial data through charts and graphs.

7. **User Settings Page**

   **Functionality**: Manage user account details.

   **UI Elements**:
   - Editable fields for personal information and password changes.
   - A logout button.

## Technical Design

### Technology Stack

- **Front-End**: React.js, React Router for routing, Chart.js for data visualization.
- **State Management**: Redux or Context API for managing application state.
- **Back-End (if applicable)**: Firebase or a custom API for managing stored data and user authentication.
- **Database**: NoSQL or SQL database to store user and transaction data securely.

### User Interface Principles

- **Responsive Design**: Ensure the application is responsive for use on desktops and mobile devices.
- **User Experience (UX)**: Simplify navigation and ensure that the application is intuitive and easy to use.
- **Accessibility**: Follow best practices for accessibility to make the application usable for all users.

## Conclusion

LoanBook aims to provide a comprehensive solution for managing loans and financial transactions with a focus on ease of use and accurate data representation. This README serves as a guide for developers and stakeholders by outlining the structure, functionality, and technical considerations involved in the project. Implementing these features effectively will create a powerful tool for users looking to manage their financial portfolios efficiently.

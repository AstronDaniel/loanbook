
# Dashboard Components and Features

## Overview

The dashboard provides a comprehensive view of the loan management system, including statistics, recent transactions, loan status, notifications, user activity, and more. Below is a detailed description of each component and feature available on the dashboard.

## Components

### Sidebar
- **Description**: The sidebar allows users to navigate between different sections of the application.
- **Features**:
  - Toggle visibility
  - Highlight active section

### Header
- **Description**: The header contains the top navigation bar with options to toggle the sidebar and switch between dark and light modes.
- **Features**:
  - Sidebar toggle button
  - Dark mode switch

### Stats Overview
- **Description**: Displays key statistics about the loan management system.
- **Features**:
  - Principal Advanced
  - Active Borrowers
  - Interest Charged
  - Due Payments

### Filters
- **Description**: Provides filtering options to narrow down the list of debtors based on various criteria.
- **Features**:
  - Search by query
  - Filter by loan type
  - Filter by date range

### Overdue Debtors Card
- **Description**: Displays a list of debtors who have overdue payments.
- **Features**:
  - List of overdue debtors
  - Clickable items to view more details

### Bad Debtors Card
- **Description**: Displays a list of debtors who are classified as bad debtors.
- **Features**:
  - List of bad debtors
  - Clickable items to view more details

### Loan Disbursements Over Time
- **Description**: Visual representation of loan disbursements over a period of time.
- **Features**:
  - Line chart showing disbursements

### Interest Earned Over Time
- **Description**: Visual representation of interest earned over a period of time.
- **Features**:
  - Line chart showing interest earned

### Asset Distribution
- **Description**: Pie chart showing the distribution of assets.
- **Features**:
  - Pie chart with segments for Cash at Hand, Cash at Bank, and Outstanding Loans

### Monthly Details Card
- **Description**: Displays detailed statistics for the current month.
- **Features**:
  - Monthly statistics

### Recent Transactions
- **Description**: Displays a list of recent transactions.
- **Features**:
  - List of transactions with date, narration, amount, and closing balance

### Loan Status Overview
- **Description**: Provides an overview of the status of various loans.
- **Features**:
  - Summary of loan statuses

### Notifications
- **Description**: Displays notifications and alerts.
- **Features**:
  - List of notifications

### User Activity
- **Description**: Displays recent user activity.
- **Features**:
  - List of user activities

## Features

### Dark Mode
- **Description**: Allows users to switch between dark and light themes.
- **Features**:
  - Toggle switch to change themes
  - Persistent theme preference using localStorage

### Responsive Design
- **Description**: The dashboard is designed to be responsive and works well on different screen sizes.
- **Features**:
  - Mobile-friendly layout
  - Adaptive components

### Data Fetching
- **Description**: Fetches data from Firestore to populate various components.
- **Features**:
  - Fetch recent transactions
  - Fetch statistics
  - Fetch filtered debtors

### Filtering and Search
- **Description**: Provides filtering and search functionality to narrow down the list of debtors.
- **Features**:
  - Search by query
  - Filter by loan type
  - Filter by date range

### Interactive Charts
- **Description**: Provides interactive charts for visual representation of data.
- **Features**:
  - Pie chart for asset distribution
  - Line charts for loan disbursements and interest earned


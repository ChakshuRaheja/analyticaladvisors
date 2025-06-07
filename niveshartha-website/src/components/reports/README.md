# Report Components

This directory contains modular components for displaying financial reports in the Niveshartha application.

## Components

### NFOMasterReport

A comprehensive component for displaying and interacting with NFO (National Financial Organization) master data.

**Features:**
- Filterable by industry, search term, and market cap range
- Interactive stock selection and comparison functionality
- Customizable columns with sticky headers and first column
- Pagination for large datasets

### CSPAnalysisReport

A component for displaying Cash Secured Put (CSP) analysis data.

**Features:**
- Symbol and expiry date filtering
- Fixed column structure with hardcoded column names
- Sticky Symbol column for easier navigation
- Pagination with total record count display

### ColumnSelector

A reusable modal component for selecting which columns to display in report tables.

**Features:**
- Checkboxes for toggling column visibility
- Select all/deselect all functionality
- Column count display

### ReportStyles

A utility module containing shared styles and helper functions for report components.

**Exported utilities:**
- `stickyColumnStyles`: Object containing CSS styles for sticky table elements
- `formatColumnName`: Function to format column names for display (converts DB_COLUMN_NAME to "Db Column Name")
- `getSortedColumns`: Function that sorts columns based on predefined priority order

## Styling Consistency

These components maintain the exact styling, headings, and section structure from the original implementation:

- NFO Master Report includes section headers like "Stock Data" with the appropriate styling and layout
- CSP Analysis maintains the original fixed column structure with "Filter Options" and "Options Data" sections
- Both reports use consistent styling for tables, filters, and pagination
- Headers and symbol columns remain sticky when scrolling horizontally

## Usage

Import components directly:

```jsx
import { NFOMasterReport, CSPAnalysisReport } from '../components/reports';

// Use in your component
<NFOMasterReport 
  reportData={data}
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  // ... other props
/>
```

## Props

### Shared Props

All report components accept these common props:

- `reportData`: Array of data objects to display
- `searchTerm`: Current search term
- `setSearchTerm`: Function to update search term
- `currentPage`: Current page number
- `setCurrentPage`: Function to update page number
- `visibleColumns`: Object mapping column names to boolean visibility values
- `setVisibleColumns`: Function to update visible columns
- `showColumnSelector`: Boolean to control column selector modal visibility
- `setShowColumnSelector`: Function to toggle column selector
- `itemsPerPage`: Number of items to display per page (default: 10)

### NFOMasterReport Specific Props

- `marketCapFilter`: Object with min/max values for market cap filtering
- `setMarketCapFilter`: Function to update market cap filter
- `selectedRows`: Array of selected row indices
- `setSelectedRows`: Function to update selected rows
- `isSelectMode`: Boolean indicating if select mode is active
- `setIsSelectMode`: Function to toggle select mode
- `isCompareMode`: Boolean indicating if compare mode is active
- `setIsCompareMode`: Function to toggle compare mode 
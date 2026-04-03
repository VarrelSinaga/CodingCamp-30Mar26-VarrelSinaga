# Implementation Plan: Expense & Budget Visualizer

## Overview

This plan implements a vanilla JavaScript expense tracking application with three files: index.html, css/styles.css, and js/app.js. The implementation follows a function-based architecture with clear separation between state management, storage, UI rendering, and event handling. All JavaScript code is organized in a single file with logical sections.

## Tasks

- [ ] 1. Set up project structure and HTML foundation
  - Create directory structure: css/ and js/ folders
  - Create index.html with semantic HTML structure
  - Include meta tags for viewport and charset
  - Add Chart.js CDN link in HTML head
  - Create placeholder divs for balance, form, transaction list, and chart
  - Link to css/styles.css and js/app.js
  - _Requirements: 10.1, 10.6_

- [ ] 2. Implement data models and storage service
  - [ ] 2.1 Create storage service functions in js/app.js
    - Implement saveToStorage(transactions) function
    - Implement loadFromStorage() function with error handling
    - Handle JSON serialization/deserialization
    - Handle corrupted data and storage unavailable scenarios
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ]* 2.2 Write property test for storage round-trip
    - **Property 4: Storage Round-Trip Preservation**
    - **Validates: Requirements 1.8, 3.3, 6.1, 6.2, 6.3, 6.4**
    - Generate random transaction lists, save and load, verify equivalence
    - Use fast-check with minimum 100 iterations

- [ ] 3. Implement state management functions
  - [ ] 3.1 Create state manager section in js/app.js
    - Initialize transactions array as application state
    - Implement getTransactions() function
    - Implement addTransaction(transaction) function with ID generation
    - Implement deleteTransaction(id) function
    - Implement getBalance() function to calculate total
    - Implement getCategoryTotals() function to group by category
    - Integrate storage service calls in add/delete operations
    - _Requirements: 1.5, 1.6, 3.2, 4.1, 5.2_
  
  - [ ]* 3.2 Write property test for valid transaction creation
    - **Property 2: Valid Transaction Creation**
    - **Validates: Requirements 1.5, 1.6**
    - Generate random valid transactions and verify they are added with unique IDs
  
  - [ ]* 3.3 Write property test for balance calculation
    - **Property 8: Balance Equals Sum of Amounts**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.5**
    - Generate random transaction lists and verify balance equals sum
  
  - [ ]* 3.4 Write property test for category totals accuracy
    - **Property 9: Category Totals Accuracy**
    - **Validates: Requirements 5.2**
    - Generate random transaction lists and verify category sums are correct

- [ ] 4. Checkpoint - Verify core data layer
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement UI rendering functions
  - [ ] 5.1 Create balance display renderer
    - Implement renderBalance() function
    - Query balance display DOM element
    - Format balance as currency (2 decimal places)
    - Update DOM with calculated balance
    - _Requirements: 4.1, 4.4, 4.5_
  
  - [ ] 5.2 Create transaction list renderer
    - Implement renderTransactionList() function
    - Generate HTML for each transaction with item name, amount, category
    - Add delete button for each transaction with data-id attribute
    - Handle empty list state
    - Make list scrollable with CSS
    - _Requirements: 2.1, 2.2, 2.3, 3.1_
  
  - [ ]* 5.3 Write property test for transaction rendering completeness
    - **Property 5: Transaction Rendering Completeness**
    - **Validates: Requirements 2.1, 2.2**
    - Generate random transactions and verify all fields appear in rendered HTML
  
  - [ ]* 5.4 Write property test for delete control presence
    - **Property 6: Delete Control Presence**
    - **Validates: Requirements 3.1**
    - Generate random transaction lists and verify each has a delete control
  
  - [ ] 5.5 Create chart renderer with Chart.js
    - Implement renderChart() function
    - Get canvas element from DOM
    - Calculate category totals using getCategoryTotals()
    - Configure Chart.js pie chart with category data
    - Handle empty data state with placeholder message
    - Destroy previous chart instance before creating new one
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [ ]* 5.6 Write property test for category percentages
    - **Property 10: Category Percentages Sum to 100%**
    - **Validates: Requirements 5.3**
    - Generate random transaction lists and verify percentages sum to 100%
  
  - [ ] 5.7 Create utility rendering functions
    - Implement clearForm() function to reset input fields
    - Implement showError(message) function to display validation errors
    - Implement renderAll() function to coordinate all renderers
    - _Requirements: 1.7, 1.4_

- [ ] 6. Implement form validation and event handlers
  - [ ] 6.1 Create form validation function
    - Implement validateForm(itemName, amount, category) function
    - Check for empty fields
    - Validate amount is positive number
    - Validate category is one of: Food, Transport, Fun
    - Return boolean validation result
    - _Requirements: 1.3, 1.4_
  
  - [ ]* 6.2 Write property test for form validation
    - **Property 1: Form Validation Rejects Invalid Input**
    - **Validates: Requirements 1.3, 1.4**
    - Generate random invalid form inputs and verify rejection
  
  - [ ] 6.3 Create form submission handler
    - Implement handleFormSubmit(event) function
    - Prevent default form submission
    - Get form field values
    - Call validateForm() and show error if invalid
    - Create transaction object with unique ID
    - Call addTransaction() to update state
    - Call clearForm() to reset inputs
    - Call renderAll() to update UI
    - _Requirements: 1.5, 1.6, 1.7, 1.8_
  
  - [ ]* 6.4 Write property test for form clearing
    - **Property 3: Form Clearing After Submission**
    - **Validates: Requirements 1.7**
    - Generate random transactions, submit, and verify form is cleared
  
  - [ ] 6.5 Create delete handler
    - Implement handleDelete(transactionId) function
    - Call deleteTransaction(id) to update state
    - Call renderAll() to update UI
    - _Requirements: 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 6.6 Write property test for transaction deletion
    - **Property 7: Transaction Deletion Removes from List**
    - **Validates: Requirements 3.2**
    - Generate random transaction lists, delete random transactions, verify removal
  
  - [ ] 6.7 Create event listener initialization
    - Implement initializeEventListeners() function
    - Bind form submit event to handleFormSubmit
    - Use event delegation for delete button clicks
    - _Requirements: 1.3, 3.1_

- [ ] 7. Checkpoint - Verify UI and event handling
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement application initialization
  - [ ] 8.1 Create initialization function
    - Implement init() function as entry point
    - Load transactions from storage using loadFromStorage()
    - Initialize state with loaded transactions
    - Call initializeEventListeners()
    - Call renderAll() to display initial UI
    - Add DOMContentLoaded event listener to call init()
    - _Requirements: 6.3, 6.4, 6.5, 6.6_
  
  - [ ]* 8.2 Write unit tests for initialization flow
    - Test loading empty storage
    - Test loading existing transactions
    - Test handling corrupted storage data
    - _Requirements: 6.3, 6.4_

- [ ] 9. Implement CSS styling
  - [ ] 9.1 Create base styles in css/styles.css
    - Reset default margins and padding
    - Set box-sizing to border-box
    - Define color palette and CSS variables
    - Set body font family and base font size (14px minimum)
    - _Requirements: 9.2, 9.3_
  
  - [ ] 9.2 Style layout and components
    - Create container with max-width and centered layout
    - Style balance display at top with large, prominent text
    - Style input form with clear field labels and spacing
    - Style transaction list with scrollable container
    - Style individual transaction items with delete buttons
    - Add hover effects for interactive elements
    - Ensure sufficient spacing between components
    - _Requirements: 9.1, 9.4, 9.5_
  
  - [ ] 9.3 Style chart component
    - Create chart container with appropriate dimensions
    - Add empty state styling for "no transactions" message
    - Ensure chart is responsive within container
    - _Requirements: 5.1, 5.6_

- [ ] 10. Final integration and polish
  - [ ] 10.1 Add error handling throughout application
    - Wrap storage operations in try-catch blocks
    - Handle Chart.js load failure gracefully
    - Add storage quota exceeded handling
    - Display user-friendly error messages
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 10.2 Verify browser compatibility
    - Test in Chrome 90+
    - Test in Firefox 88+
    - Test in Edge 90+
    - Test in Safari 14+
    - Ensure Local Storage API usage is compatible
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 10.3 Run full property-based test suite
    - Execute all 10 property tests with 100+ iterations each
    - Verify all properties pass
    - Document any edge cases discovered
    - _Requirements: All_

- [ ] 11. Final checkpoint - Complete testing and validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All JavaScript code goes in a single js/app.js file organized in logical sections
- Property tests use fast-check library with minimum 100 iterations
- Each property test references its design document property number
- Focus on minimal, functional implementation without over-engineering
- Chart.js is loaded via CDN, no build process required
- Application is entirely client-side with no backend dependencies

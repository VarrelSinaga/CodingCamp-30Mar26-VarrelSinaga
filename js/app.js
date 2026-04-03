// ============================================
// STORAGE SERVICE SECTION
// ============================================

const STORAGE_KEY = 'expense-tracker-transactions';
const CATEGORIES_KEY = 'expense-tracker-categories';

/**
 * Saves transaction array to Local Storage
 * @param {Array} transactions - Array of transaction objects
 */
function saveToStorage(transactions) {
    try {
        const jsonData = JSON.stringify(transactions);
        localStorage.setItem(STORAGE_KEY, jsonData);
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            showError('Storage limit reached. Please delete some transactions.');
        } else {
            console.error('Error saving to storage:', error);
            showError('Could not save data. Your changes may not persist.');
        }
    }
}

/**
 * Loads transaction array from Local Storage
 * @returns {Array} Array of transaction objects
 */
function loadFromStorage() {
    try {
        const jsonData = localStorage.getItem(STORAGE_KEY);
        if (!jsonData) {
            return [];
        }
        return JSON.parse(jsonData);
    } catch (error) {
        console.error('Error loading from storage:', error);
        console.warn('Could not load previous data. Starting fresh.');
        return [];
    }
}

/**
 * Saves categories to Local Storage
 * @param {Array} categories - Array of category objects
 */
function saveCategoriesToStorage(categories) {
    try {
        const jsonData = JSON.stringify(categories);
        localStorage.setItem(CATEGORIES_KEY, jsonData);
    } catch (error) {
        console.error('Error saving categories:', error);
    }
}

/**
 * Loads categories from Local Storage
 * @returns {Array} Array of category objects
 */
function loadCategoriesFromStorage() {
    try {
        const jsonData = localStorage.getItem(CATEGORIES_KEY);
        if (!jsonData) {
            return getDefaultCategories();
        }
        return JSON.parse(jsonData);
    } catch (error) {
        console.error('Error loading categories:', error);
        return getDefaultCategories();
    }
}

/**
 * Returns default categories
 * @returns {Array} Array of default category objects
 */
function getDefaultCategories() {
    return [
        { name: 'Food', color: '#e74c3c', isDefault: true },
        { name: 'Transport', color: '#3498db', isDefault: true },
        { name: 'Fun', color: '#9b59b6', isDefault: true }
    ];
}

// ============================================
// STATE MANAGEMENT SECTION
// ============================================

let transactions = [];
let categories = [];
let currentMonthFilter = null; // null means "All Time", otherwise { year, month }
let currentSort = { field: 'date', order: 'desc' }; // default sort by date descending

/**
 * Returns all transactions
 * @returns {Array} Array of transaction objects
 */
function getTransactions() {
    return transactions;
}

/**
 * Returns filtered transactions based on current month filter
 * @returns {Array} Array of filtered transaction objects
 */
function getFilteredTransactions() {
    let filtered = transactions;
    
    // Apply month filter
    if (currentMonthFilter) {
        filtered = transactions.filter(t => {
            const date = new Date(parseInt(t.id));
            return date.getFullYear() === currentMonthFilter.year && 
                   date.getMonth() === currentMonthFilter.month;
        });
    }
    
    // Apply sorting
    return getSortedTransactions(filtered);
}

/**
 * Sorts transactions based on current sort settings
 * @param {Array} transactionsToSort - Array of transactions to sort
 * @returns {Array} Sorted array of transactions
 */
function getSortedTransactions(transactionsToSort) {
    const sorted = [...transactionsToSort];
    
    sorted.sort((a, b) => {
        let comparison = 0;
        
        switch (currentSort.field) {
            case 'amount':
                comparison = a.amount - b.amount;
                break;
            case 'category':
                comparison = a.category.localeCompare(b.category);
                break;
            case 'name':
                comparison = a.itemName.localeCompare(b.itemName);
                break;
            case 'date':
            default:
                comparison = parseInt(a.id) - parseInt(b.id);
                break;
        }
        
        return currentSort.order === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
}

/**
 * Sets the sort field and order
 * @param {string} field - Field to sort by (date, amount, category, name)
 */
function setSortField(field) {
    // If clicking the same field, toggle order
    if (currentSort.field === field) {
        currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
    } else {
        // New field, default to descending for amount/date, ascending for text
        currentSort.field = field;
        currentSort.order = (field === 'amount' || field === 'date') ? 'desc' : 'asc';
    }
}

/**
 * Gets monthly summary data
 * @returns {Array} Array of monthly summary objects
 */
function getMonthlySummary() {
    const monthlyData = {};
    
    transactions.forEach(t => {
        const date = new Date(parseInt(t.id));
        const year = date.getFullYear();
        const month = date.getMonth();
        const key = `${year}-${month}`;
        
        if (!monthlyData[key]) {
            monthlyData[key] = {
                year,
                month,
                total: 0,
                count: 0
            };
        }
        
        monthlyData[key].total += t.amount;
        monthlyData[key].count += 1;
    });
    
    // Convert to array and sort by date (newest first)
    return Object.values(monthlyData).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
    });
}

/**
 * Sets the current month filter
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 */
function setMonthFilter(year, month) {
    currentMonthFilter = { year, month };
}

/**
 * Clears the month filter
 */
function clearMonthFilter() {
    currentMonthFilter = null;
}

/**
 * Navigates to previous month
 */
function navigateToPreviousMonth() {
    if (!currentMonthFilter) {
        // Start from current month
        const now = new Date();
        currentMonthFilter = { year: now.getFullYear(), month: now.getMonth() };
    }
    
    let { year, month } = currentMonthFilter;
    month -= 1;
    if (month < 0) {
        month = 11;
        year -= 1;
    }
    
    currentMonthFilter = { year, month };
}

/**
 * Navigates to next month
 */
function navigateToNextMonth() {
    if (!currentMonthFilter) {
        // Start from current month
        const now = new Date();
        currentMonthFilter = { year: now.getFullYear(), month: now.getMonth() };
    }
    
    let { year, month } = currentMonthFilter;
    month += 1;
    if (month > 11) {
        month = 0;
        year += 1;
    }
    
    // Don't go beyond current month
    const now = new Date();
    if (year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth())) {
        return;
    }
    
    currentMonthFilter = { year, month };
}

/**
 * Returns all categories
 * @returns {Array} Array of category objects
 */
function getCategories() {
    return categories;
}

/**
 * Adds a new category
 * @param {string} name - Category name
 * @param {string} color - Category color
 */
function addCategory(name, color) {
    const newCategory = {
        name: name,
        color: color,
        isDefault: false
    };
    categories.push(newCategory);
    saveCategoriesToStorage(categories);
}

/**
 * Removes a category
 * @param {string} name - Category name to remove
 */
function removeCategory(name) {
    // Don't remove if it's a default category
    const category = categories.find(c => c.name === name);
    if (category && category.isDefault) {
        return;
    }
    
    // Check if any transactions use this category
    const hasTransactions = transactions.some(t => t.category === name);
    if (hasTransactions) {
        showError('Cannot delete category that has transactions');
        return;
    }
    
    categories = categories.filter(c => c.name !== name);
    saveCategoriesToStorage(categories);
}

/**
 * Gets color for a category
 * @param {string} categoryName - Category name
 * @returns {string} Color hex code
 */
function getCategoryColor(categoryName) {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.color : '#95a5a6';
}

/**
 * Returns all transactions
 * @returns {Array} Array of transaction objects
 */
function getTransactions() {
    return transactions;
}

/**
 * Adds a transaction and persists to storage
 * @param {Object} transaction - Transaction object with itemName, amount, category
 */
function addTransaction(transaction) {
    // Generate unique ID using timestamp
    const newTransaction = {
        id: Date.now().toString(),
        ...transaction
    };
    
    transactions.push(newTransaction);
    saveToStorage(transactions);
}

/**
 * Removes a transaction by ID and persists to storage
 * @param {string} id - Transaction ID to remove
 */
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveToStorage(transactions);
}

/**
 * Calculates total of all transaction amounts
 * @returns {number} Sum of all transaction amounts
 */
function getBalance() {
    const filtered = getFilteredTransactions();
    return filtered.reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Groups transactions by category with totals
 * @returns {Object} Object with category names as keys and totals as values
 */
function getCategoryTotals() {
    const totals = {};
    
    // Initialize all categories with 0
    categories.forEach(cat => {
        totals[cat.name] = 0;
    });
    
    // Sum up filtered transactions
    const filtered = getFilteredTransactions();
    filtered.forEach(t => {
        if (totals.hasOwnProperty(t.category)) {
            totals[t.category] += t.amount;
        }
    });
    
    return totals;
}

// ============================================
// UI RENDERING SECTION
// ============================================

let chartInstance = null;

/**
 * Renders the balance display
 */
function renderBalance() {
    const balanceElement = document.getElementById('balance-amount');
    const monthElement = document.getElementById('current-month');
    const balance = getBalance();
    
    balanceElement.textContent = `$${balance.toFixed(2)}`;
    
    if (currentMonthFilter) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        monthElement.textContent = `${monthNames[currentMonthFilter.month]} ${currentMonthFilter.year}`;
    } else {
        monthElement.textContent = 'All Time';
    }
}

/**
 * Renders the transaction list
 */
function renderTransactionList() {
    const listElement = document.getElementById('transaction-list');
    const filtered = getFilteredTransactions();
    
    if (filtered.length === 0) {
        listElement.innerHTML = '';
        return;
    }
    
    const html = filtered.map(t => {
        const color = getCategoryColor(t.category);
        const date = new Date(parseInt(t.id));
        const dateStr = date.toLocaleDateString();
        return `
        <div class="transaction-item" style="border-left-color: ${color}">
            <div class="transaction-info">
                <div class="transaction-name">${escapeHtml(t.itemName)}</div>
                <div class="transaction-category">${escapeHtml(t.category)} • ${dateStr}</div>
            </div>
            <div class="transaction-amount">$${t.amount.toFixed(2)}</div>
            <button class="btn-delete" data-id="${t.id}">Delete</button>
        </div>
    `;
    }).join('');
    
    listElement.innerHTML = html;
}

/**
 * Renders the pie chart using Chart.js
 */
function renderChart() {
    const canvas = document.getElementById('expense-chart');
    const emptyState = document.getElementById('chart-empty-state');
    
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js library not loaded');
        emptyState.textContent = 'Chart visualization unavailable';
        emptyState.classList.add('visible');
        canvas.style.display = 'none';
        return;
    }
    
    const filtered = getFilteredTransactions();
    
    // Handle empty data
    if (filtered.length === 0) {
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
        canvas.style.display = 'none';
        emptyState.classList.add('visible');
        return;
    }
    
    // Show canvas, hide empty state
    canvas.style.display = 'block';
    emptyState.classList.remove('visible');
    
    const categoryTotals = getCategoryTotals();
    const categoryNames = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);
    const colors = categoryNames.map(name => getCategoryColor(name));
    
    // Destroy previous chart instance
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    // Create new chart
    const ctx = canvas.getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categoryNames,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Clears the input form
 */
function clearForm() {
    document.getElementById('item-name').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('category').value = '';
    document.getElementById('error-message').textContent = '';
}

/**
 * Displays an error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
}

/**
 * Renders all components
 */
function renderAll() {
    renderBalance();
    renderTransactionList();
    renderChart();
    renderCategorySelect();
    renderCategoryList();
    renderMonthlySummary();
    updateSortDropdown();
}

/**
 * Renders the monthly summary cards
 */
function renderMonthlySummary() {
    const summaryElement = document.getElementById('monthly-summary');
    const monthlySummary = getMonthlySummary();
    
    if (monthlySummary.length === 0) {
        summaryElement.innerHTML = '';
        return;
    }
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const html = monthlySummary.map(summary => {
        const isActive = currentMonthFilter && 
                        currentMonthFilter.year === summary.year && 
                        currentMonthFilter.month === summary.month;
        
        return `
        <div class="monthly-card ${isActive ? 'active' : ''}" 
             data-year="${summary.year}" 
             data-month="${summary.month}">
            <div class="monthly-card-month">${monthNames[summary.month]} ${summary.year}</div>
            <div class="monthly-card-amount">$${summary.total.toFixed(2)}</div>
            <div class="monthly-card-count">${summary.count} transaction${summary.count !== 1 ? 's' : ''}</div>
        </div>
    `;
    }).join('');
    
    summaryElement.innerHTML = html;
}

/**
 * Renders the category dropdown
 */
function renderCategorySelect() {
    const selectElement = document.getElementById('category');
    const currentValue = selectElement.value;
    
    const options = categories.map(cat => 
        `<option value="${escapeHtml(cat.name)}">${escapeHtml(cat.name)}</option>`
    ).join('');
    
    selectElement.innerHTML = '<option value="">Select a category</option>' + options;
    selectElement.value = currentValue;
}

/**
 * Renders the category management list
 */
function renderCategoryList() {
    const listElement = document.getElementById('category-list');
    
    const html = categories.map(cat => `
        <div class="category-badge ${cat.isDefault ? 'default' : ''}">
            <span class="category-color" style="background-color: ${cat.color}"></span>
            <span>${escapeHtml(cat.name)}</span>
            <button class="btn-remove-category" data-name="${escapeHtml(cat.name)}" title="Remove category">×</button>
        </div>
    `).join('');
    
    listElement.innerHTML = html;
}

/**
 * Escapes HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// EVENT HANDLERS SECTION
// ============================================

/**
 * Validates form input
 * @param {string} itemName - Item name
 * @param {string} amount - Amount as string
 * @param {string} category - Category
 * @returns {boolean} True if valid, false otherwise
 */
function validateForm(itemName, amount, category) {
    // Check for empty fields
    if (!itemName.trim() || !amount || !category) {
        showError('Please fill in all fields');
        return false;
    }
    
    // Validate amount is a positive number
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
        showError('Please enter a valid positive amount');
        return false;
    }
    
    // Validate category exists
    const categoryExists = categories.some(c => c.name === category);
    if (!categoryExists) {
        showError('Please select a valid category');
        return false;
    }
    
    return true;
}

/**
 * Handles form submission
 * @param {Event} event - Form submit event
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    const itemName = document.getElementById('item-name').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    
    if (!validateForm(itemName, amount, category)) {
        return;
    }
    
    const transaction = {
        itemName: itemName.trim(),
        amount: parseFloat(amount),
        category: category
    };
    
    addTransaction(transaction);
    clearForm();
    renderAll();
}

/**
 * Handles delete button clicks
 * @param {string} transactionId - ID of transaction to delete
 */
function handleDelete(transactionId) {
    deleteTransaction(transactionId);
    renderAll();
}

/**
 * Handles add category button click
 */
function handleAddCategory() {
    const categoryName = prompt('Enter new category name:');
    
    if (!categoryName || !categoryName.trim()) {
        return;
    }
    
    const trimmedName = categoryName.trim();
    
    // Check if category already exists
    if (categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
        showError('Category already exists');
        return;
    }
    
    // Generate a random color
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    
    addCategory(trimmedName, randomColor);
    renderAll();
}

/**
 * Handles remove category button click
 * @param {string} categoryName - Name of category to remove
 */
function handleRemoveCategory(categoryName) {
    if (confirm(`Are you sure you want to delete the "${categoryName}" category?`)) {
        removeCategory(categoryName);
        renderAll();
    }
}

/**
 * Handles sort dropdown change
 * @param {string} sortValue - Selected sort value
 */
function handleSortChange(sortValue) {
    // Parse the sort value and set the sort field
    setSortField(sortValue);
    
    // Update the dropdown text to show current order
    updateSortDropdown();
    
    // Re-render transactions with new sort
    renderTransactionList();
}

/**
 * Updates the sort dropdown options based on current sort
 */
function updateSortDropdown() {
    const sortSelect = document.getElementById('sort-select');
    const options = sortSelect.options;
    
    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const field = option.value;
        
        if (field === currentSort.field) {
            // Update the text to show current order
            let baseText = '';
            switch (field) {
                case 'date':
                    baseText = 'Date';
                    option.text = currentSort.order === 'desc' ? 'Date (Newest)' : 'Date (Oldest)';
                    break;
                case 'amount':
                    baseText = 'Amount';
                    option.text = currentSort.order === 'desc' ? 'Amount (Highest)' : 'Amount (Lowest)';
                    break;
                case 'category':
                    baseText = 'Category';
                    option.text = currentSort.order === 'asc' ? 'Category (A-Z)' : 'Category (Z-A)';
                    break;
                case 'name':
                    baseText = 'Name';
                    option.text = currentSort.order === 'asc' ? 'Name (A-Z)' : 'Name (Z-A)';
                    break;
            }
        }
    }
}

/**
 * Initializes event listeners
 */
function initializeEventListeners() {
    // Form submission
    const form = document.getElementById('expense-form');
    form.addEventListener('submit', handleFormSubmit);
    
    // Delete buttons using event delegation
    const transactionList = document.getElementById('transaction-list');
    transactionList.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-delete')) {
            const transactionId = event.target.getAttribute('data-id');
            handleDelete(transactionId);
        }
    });
    
    // Add category button
    const addCategoryBtn = document.getElementById('add-category-btn');
    addCategoryBtn.addEventListener('click', handleAddCategory);
    
    // Remove category buttons using event delegation
    const categoryList = document.getElementById('category-list');
    categoryList.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-remove-category')) {
            const categoryName = event.target.getAttribute('data-name');
            handleRemoveCategory(categoryName);
        }
    });
    
    // Month navigation buttons
    const prevMonthBtn = document.getElementById('prev-month');
    prevMonthBtn.addEventListener('click', () => {
        navigateToPreviousMonth();
        renderAll();
    });
    
    const nextMonthBtn = document.getElementById('next-month');
    nextMonthBtn.addEventListener('click', () => {
        navigateToNextMonth();
        renderAll();
    });
    
    const resetMonthBtn = document.getElementById('reset-month');
    resetMonthBtn.addEventListener('click', () => {
        clearMonthFilter();
        renderAll();
    });
    
    // Monthly summary card clicks using event delegation
    const monthlySummary = document.getElementById('monthly-summary');
    monthlySummary.addEventListener('click', (event) => {
        const card = event.target.closest('.monthly-card');
        if (card) {
            const year = parseInt(card.getAttribute('data-year'));
            const month = parseInt(card.getAttribute('data-month'));
            setMonthFilter(year, month);
            renderAll();
        }
    });
    
    // Theme toggle button
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Sort select dropdown
    const sortSelect = document.getElementById('sort-select');
    sortSelect.addEventListener('change', (event) => {
        handleSortChange(event.target.value);
    });
}

// ============================================
// APPLICATION INITIALIZATION
// ============================================

/**
 * Toggles between light and dark theme
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update theme icon
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

/**
 * Loads theme preference from storage
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update theme icon
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
}

/**
 * Initializes the application
 */
function init() {
    // Check if Local Storage is available
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
    } catch (error) {
        console.warn('Local Storage is not available. Your data will not be saved.');
    }
    
    // Load theme preference
    loadTheme();
    
    // Load categories from storage
    categories = loadCategoriesFromStorage();
    
    // Load transactions from storage
    transactions = loadFromStorage();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Render initial UI
    renderAll();
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', init);

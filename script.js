// DOM elements
const platformSelect = document.getElementById('platform');
const actionButtons = document.getElementById('action-buttons');
const backToCategoriesBtn = document.getElementById('back-to-categories');
const copyChecklistBtn = document.getElementById('copy-checklist');
const downloadExcelBtn = document.getElementById('download-excel');
const flashcardsContainer = document.getElementById('flashcards-container');

// Current state
let currentTech = '';
let currentCategory = null;
let checklistData = {};

// Initialize the application
async function init() {
    // Load checklist data
    try {
        const response = await fetch('checklist.json');
        checklistData = await response.json();
        console.log('Checklist data loaded successfully');
        
        // Set up event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error loading checklist data:', error);
        showError('Error loading checklist data. Please try again later.');
    }
}

function setupEventListeners() {
    platformSelect.addEventListener('change', handlePlatformChange);
    backToCategoriesBtn.addEventListener('click', showCategories);
    copyChecklistBtn.addEventListener('click', copyChecklist);
    downloadExcelBtn.addEventListener('click', downloadExcel);
}

function showError(message) {
    flashcardsContainer.innerHTML = `<div class="error-message">${message}</div>`;
}

// Handle platform selection
function handlePlatformChange() {
    currentTech = platformSelect.value;
    currentCategory = null;
    
    if (!currentTech) {
        actionButtons.classList.add('hidden');
        flashcardsContainer.innerHTML = '';
        return;
    }
    
    // Show action buttons
    actionButtons.classList.remove('hidden');
    
    // Render categories
    renderCategories();
}

// Show categories view
function showCategories() {
    currentCategory = null;
    renderCategories();
}

// Render categories as flashcards
function renderCategories() {
    flashcardsContainer.innerHTML = '';
    
    if (currentCategory) {
        renderControls();
        return;
    }
    
    const categories = checklistData[currentTech] || [];
    
    if (categories.length === 0) {
        flashcardsContainer.innerHTML = '<div class="empty-state">No categories available for this platform</div>';
        return;
    }
    
    // Create flashcards for each category
    categories.forEach(category => {
        const flashcard = document.createElement('div');
        flashcard.className = 'flashcard';
        flashcard.innerHTML = `
            <h3>${category.name} <span class="count">${category.controls.length}</span></h3>
            <p>Click to view controls</p>
        `;
        flashcard.addEventListener('click', () => {
            currentCategory = category;
            renderControls();
        });
        flashcardsContainer.appendChild(flashcard);
    });
}

// Render controls as cards
function renderControls() {
    if (!currentCategory) {
        showError('No category selected');
        return;
    }
    
    flashcardsContainer.innerHTML = '';
    
    // Add back button
    const backButton = document.createElement('button');
    backButton.id = 'back-to-categories';
    backButton.textContent = '← Back to categories';
    backButton.addEventListener('click', showCategories);
    flashcardsContainer.appendChild(backButton);
    
    // Add title
    const title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = currentCategory.name;
    flashcardsContainer.appendChild(title);
    
    // Add reference link if available
    if (currentCategory.reference) {
        const reference = document.createElement('a');
        reference.className = 'reference-link';
        reference.href = currentCategory.reference;
        reference.textContent = 'View Reference Documentation →';
        reference.target = '_blank';
        flashcardsContainer.appendChild(reference);
    }
    
    // Create cards for each control
    currentCategory.controls.forEach((control, index) => {
        const controlCard = createControlCard(control, index + 1);
        flashcardsContainer.appendChild(controlCard);
    });
}

function createControlCard(control, index) {
    const controlCard = document.createElement('div');
    controlCard.className = 'control-card';
    
    // Extract tag if present (format: "Control text [tag]")
    const { controlText, tag } = extractControlInfo(control);
    
    controlCard.innerHTML = `
        <div class="control-content">
            <span class="index">${index}.</span> ${controlText}
        </div>
        ${tag ? `<span class="tag tag-${tag}">${tag}</span>` : ''}
    `;
    
    return controlCard;
}

function extractControlInfo(control) {
    let controlText = control;
    let tag = '';
    const tagMatch = control.match(/\[(mandatory|optional|basic|advanced)\]/i);
    
    if (tagMatch) {
        tag = tagMatch[1].toLowerCase();
        controlText = control.replace(tagMatch[0], '').trim();
    }
    
    return { controlText, tag };
}

// Copy checklist to clipboard
function copyChecklist() {
    if (!currentTech) {
        alert('Please select a platform first');
        return;
    }
    
    let checklistText = '';
    
    if (currentCategory) {
        checklistText = createCategoryChecklistText();
    } else {
        checklistText = createPlatformChecklistText();
    }
    
    navigator.clipboard.writeText(checklistText)
        .then(() => alert('Checklist copied to clipboard!'))
        .catch(err => {
            console.error('Failed to copy checklist:', err);
            alert('Failed to copy checklist. Please try again.');
        });
}

function createCategoryChecklistText() {
    let text = `${currentTech.toUpperCase()} - ${currentCategory.name}\n\n`;
    currentCategory.controls.forEach((control, index) => {
        const { controlText } = extractControlInfo(control);
        text += `${index + 1}. ${controlText}\n`;
    });
    return text;
}

function createPlatformChecklistText() {
    const categories = checklistData[currentTech] || [];
    let text = `${currentTech.toUpperCase()} Categories\n\n`;
    categories.forEach(category => {
        text += `${category.name} (${category.controls.length} controls)\n`;
    });
    return text;
}

// Download checklist as Excel
function downloadExcel() {
    if (!currentTech) {
        alert('Please select a platform first');
        return;
    }
    
    const ws_data = currentCategory 
        ? createSingleCategoryWorksheet() 
        : createPlatformWorksheet();
    
    // Create and download workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    
    // Set column widths
    ws['!cols'] = [
        {wch: 15},  // Platform
        {wch: 20},  // Category
        {wch: 80},  // Control
        {wch: 12}   // Type
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, "Security Checklist");
    XLSX.writeFile(wb, generateFilename());
}

function createSingleCategoryWorksheet() {
    return [
        ["Platform", "Category", "Control", "Type"],
        ...currentCategory.controls.map(control => {
            const { controlText, tag } = extractControlInfo(control);
            return [
                currentTech.toUpperCase(),
                currentCategory.name,
                controlText,
                tag || 'N/A'
            ];
        })
    ];
}

function createPlatformWorksheet() {
    const categories = checklistData[currentTech] || [];
    return [
        ["Platform", "Category", "Control", "Type"],
        ...categories.flatMap(category => 
            category.controls.map(control => {
                const { controlText, tag } = extractControlInfo(control);
                return [
                    currentTech.toUpperCase(),
                    category.name,
                    controlText,
                    tag || 'N/A'
                ];
            })
        )
    ];
}

function generateFilename() {
    let filename = `SecurityChecklist_${currentTech}`;
    if (currentCategory) {
        filename += `_${currentCategory.name.replace(/[^a-z0-9]/gi, '_')}`;
    }
    return `${filename}.xlsx`;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);

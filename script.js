// DOM elements
const platformSelect = document.getElementById('platform');
const categorySelector = document.getElementById('category-selector');
const categorySelect = document.getElementById('category');
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
  } catch (error) {
    console.error('Error loading checklist data:', error);
    flashcardsContainer.innerHTML = '<p>Error loading checklist data. Please try again later.</p>';
    return;
  }

  // Set up event listeners
  platformSelect.addEventListener('change', handlePlatformChange);
  categorySelect.addEventListener('change', handleCategoryChange);
  backToCategoriesBtn.addEventListener('click', showCategories);
  copyChecklistBtn.addEventListener('click', copyChecklist);
  downloadExcelBtn.addEventListener('click', downloadExcel);
}

// Handle platform selection
function handlePlatformChange() {
  currentTech = platformSelect.value;
  currentCategory = null;
  
  if (!currentTech) {
    categorySelector.classList.add('hidden');
    actionButtons.classList.add('hidden');
    flashcardsContainer.innerHTML = '';
    return;
  }
  
  // Show category selector
  categorySelector.classList.remove('hidden');
  
  // Populate categories
  categorySelect.innerHTML = '<option value="">-- Select Category --</option>';
  const categories = checklistData[currentTech] || [];
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.name;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
  
  // Hide action buttons until category is selected
  actionButtons.classList.add('hidden');
  flashcardsContainer.innerHTML = '';
}

// Handle category selection
function handleCategoryChange() {
  const categoryName = categorySelect.value;
  
  if (!categoryName) {
    actionButtons.classList.add('hidden');
    flashcardsContainer.innerHTML = '';
    return;
  }
  
  // Find the selected category
  const categories = checklistData[currentTech] || [];
  currentCategory = categories.find(cat => cat.name === categoryName);
  
  if (currentCategory) {
    // Show action buttons
    actionButtons.classList.remove('hidden');
    // Render controls
    renderControls();
  }
}

// Show categories view
function showCategories() {
  currentCategory = null;
  categorySelect.value = '';
  actionButtons.classList.add('hidden');
  flashcardsContainer.innerHTML = '';
}

// Render controls as flashcards
function renderControls() {
  if (!currentCategory) return;
  
  flashcardsContainer.innerHTML = '';
  
  // Add category title
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
  
  // Create flashcards for each control
  currentCategory.controls.forEach((control, index) => {
    const flashcard = document.createElement('div');
    flashcard.className = 'flashcard';
    
    // Extract tag if present (format: "Control text [tag]")
    let controlText = control;
    let tag = '';
    const tagMatch = control.match(/\[(mandatory|optional|basic|advanced)\]/i);
    if (tagMatch) {
      tag = tagMatch[1].toLowerCase();
      controlText = control.replace(tagMatch[0], '').trim();
    }
    
    flashcard.innerHTML = `
      <span class="index">${index + 1}.</span> ${controlText}
      ${tag ? `<span class="tag tag-${tag}">${tag}</span>` : ''}
    `;
    flashcardsContainer.appendChild(flashcard);
  });
}

// Copy checklist to clipboard
function copyChecklist() {
  if (!currentCategory) return;
  
  let checklistText = `${currentTech.toUpperCase()} - ${currentCategory.name}\n\n`;
  
  currentCategory.controls.forEach((control, index) => {
    checklistText += `${index + 1}. ${control}\n`;
  });
  
  navigator.clipboard.writeText(checklistText)
    .then(() => {
      alert('Checklist copied to clipboard!');
    })
    .catch(err => {
      console.error('Failed to copy checklist:', err);
      alert('Failed to copy checklist. Please try again.');
    });
}

// Download checklist as Excel
function downloadExcel() {
  if (!currentTech || !currentCategory) return;
  
  // Prepare worksheet data
  const ws_data = [
    ["Platform", "Category", "Control", "Type"],
    ...currentCategory.controls.map(control => {
      // Extract tag if present
      let controlText = control;
      let controlType = '';
      const tagMatch = control.match(/\[(mandatory|optional|basic|advanced)\]/i);
      if (tagMatch) {
        controlType = tagMatch[1].toLowerCase();
        controlText = control.replace(tagMatch[0], '').trim();
      }
      
      return [
        currentTech.toUpperCase(),
        currentCategory.name,
        controlText,
        controlType || 'N/A'
      ];
    })
  ];
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  
  // Set column widths
  ws['!cols'] = [
    {wch: 15},  // Platform
    {wch: 20},  // Category
    {wch: 80},  // Control
    {wch: 12}   // Type
  ];
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Security Checklist");
  
  // Generate filename
  const filename = `SecurityChecklist_${currentTech}_${currentCategory.name.replace(/[^a-z0-9]/gi, '_')}.xlsx`;
  
  // Download the file
  XLSX.writeFile(wb, filename);
}

// Initialize the application
init();

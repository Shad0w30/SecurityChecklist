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
  } catch (error) {
    console.error('Error loading checklist data:', error);
    flashcardsContainer.innerHTML = '<p>Error loading checklist data. Please try again later.</p>';
    return;
  }

  // Set up event listeners
  platformSelect.addEventListener('change', handlePlatformChange);
  backToCategoriesBtn.addEventListener('click', showCategories);
  copyChecklistBtn.addEventListener('click', copyChecklist);
  downloadExcelBtn.addEventListener('click', downloadExcel);
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
    // Render controls for the selected category
    renderControls();
    return;
  }
  
  const categories = checklistData[currentTech] || [];
  
  if (!categories.length) {
    flashcardsContainer.innerHTML = '<p>No categories available for this platform</p>';
    return;
  }
  
  // Add title
  const title = document.createElement('h2');
  title.className = 'category-title';
  title.textContent = `${currentTech.toUpperCase()} Categories`;
  flashcardsContainer.appendChild(title);
  
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

// Render controls as flashcards
function renderControls() {
  if (!currentCategory) return;
  
  flashcardsContainer.innerHTML = '';
  
  // Add title
  const title = document.createElement('h2');
  title.className = 'category-title';
  title.textContent = `${currentTech.toUpperCase()} - ${currentCategory.name}`;
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
    flashcard.className = 'control-item';
    
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
  let checklistText = '';
  
  if (currentCategory) {
    checklistText = `${currentTech.toUpperCase()} - ${currentCategory.name}\n\n`;
    currentCategory.controls.forEach((control, index) => {
      checklistText += `${index + 1}. ${control}\n`;
    });
  } else {
    const categories = checklistData[currentTech] || [];
    checklistText = `${currentTech.toUpperCase()} Categories\n\n`;
    categories.forEach(category => {
      checklistText += `${category.name} (${category.controls.length} controls)\n`;
    });
  }
  
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
  if (!currentTech) return;
  
  // Prepare worksheet data
  let ws_data = [];
  
  if (currentCategory) {
    // Export single category
    ws_data = [
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
  } else {
    // Export all categories for the platform
    const categories = checklistData[currentTech] || [];
    ws_data = [
      ["Platform", "Category", "Control", "Type"]
    ];
    
    categories.forEach(category => {
      category.controls.forEach(control => {
        // Extract tag if present
        let controlText = control;
        let controlType = '';
        const tagMatch = control.match(/\[(mandatory|optional|basic|advanced)\]/i);
        if (tagMatch) {
          controlType = tagMatch[1].toLowerCase();
          controlText = control.replace(tagMatch[0], '').trim();
        }
        
        ws_data.push([
          currentTech.toUpperCase(),
          category.name,
          controlText,
          controlType || 'N/A'
        ]);
      });
    });
  }
  
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
  let filename = `SecurityChecklist_${currentTech}`;
  if (currentCategory) {
    filename += `_${currentCategory.name.replace(/[^a-z0-9]/gi, '_')}`;
  }
  filename += '.xlsx';
  
  // Download the file
  XLSX.writeFile(wb, filename);
}

// Initialize the application
init();

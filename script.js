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
  
  // Create flashcards for each category
  categories.forEach(category => {
    const flashcard = document.createElement('div');
    flashcard.className = 'flashcard';
    flashcard.innerHTML = `
      <h3>${category.name}</h3>
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
  
  // Add back button
  const backButton = document.createElement('div');
  backButton.className = 'back-button';
  backButton.innerHTML = '← Back to categories';
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
    reference.textContent = 'Reference →';
    reference.target = '_blank';
    flashcardsContainer.appendChild(reference);
  }
  
  // Create flashcards for each control
  currentCategory.controls.forEach((control, index) => {
    const controlCard = document.createElement('div');
    controlCard.className = 'control-card';
    
    // Extract tag if present (format: "Control text [tag]")
    let controlText = control;
    let tag = '';
    const tagMatch = control.match(/\[(mandatory|optional|basic|advanced)\]/i);
    if (tagMatch) {
      tag = tagMatch[1].toLowerCase();
      controlText = control.replace(tagMatch[0], '').trim();
    }
    
    controlCard.innerHTML = `
      <div class="control-content">
        <span class="index">${index + 1}.</span> ${controlText}
      </div>
      ${tag ? `<span class="tag tag-${tag}">${tag}</span>` : ''}
    `;
    flashcardsContainer.appendChild(controlCard);
  });
}

// ... (keep existing copyChecklist and downloadExcel functions)

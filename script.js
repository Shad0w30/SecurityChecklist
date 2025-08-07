// DOM elements
const platformSelect = document.getElementById('platform');
const categoryView = document.getElementById('category-view');
const controlsView = document.getElementById('controls-view');

// Current state
let currentTech = '';
let currentCategory = null;
let checklistData = {};

// Initialize the application
async function init() {
  platformSelect.addEventListener('change', handlePlatformChange);
  renderCategories([]);
  renderControls([]);
}

// Handle platform selection
async function handlePlatformChange() {
  currentTech = platformSelect.value;
  currentCategory = null;
  
  if (!currentTech) {
    renderCategories([]);
    renderControls([]);
    return;
  }
  
  try {
    // Load the specific technology file
    const response = await fetch(`checklist-${currentTech}.json`);
    const techData = await response.json();
    
    // Store the loaded data in our checklistData object
    checklistData[currentTech] = techData;
    
    renderCategories(techData);
    renderControls([]);
  } catch (error) {
    console.error(`Error loading data for ${currentTech}:`, error);
    categoryView.innerHTML = `<p>Error loading data for ${currentTech}. Please try again later.</p>`;
  }
}

// Render category flashcards
function renderCategories(categories) {
  categoryView.innerHTML = '';
  
  if (!categories.length) {
    categoryView.innerHTML = '<p>Select a technology to view categories</p>';
    return;
  }
  
  categories.forEach(category => {
    const flashcard = document.createElement('div');
    flashcard.className = 'flashcard';
    flashcard.innerHTML = `
      <h3>${category.name} <span class="count">${category.controls.length}</span></h3>
      <p>Click to view controls</p>
    `;
    flashcard.addEventListener('click', () => showCategoryControls(category));
    categoryView.appendChild(flashcard);
  });
}

// Show controls for a specific category
function showCategoryControls(category) {
  currentCategory = category;
  renderControls(category.controls);
}

// Render controls list
function renderControls(controls) {
  controlsView.innerHTML = '';
  
  if (currentCategory) {
    const backButton = document.createElement('div');
    backButton.className = 'back-button';
    backButton.addEventListener('click', () => {
      currentCategory = null;
      const categories = checklistData[currentTech] || [];
      renderCategories(categories);
      renderControls([]);
    });
    controlsView.appendChild(backButton);
    
    const title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = currentCategory.name;
    controlsView.appendChild(title);
    
    if (currentCategory.reference) {
      const reference = document.createElement('a');
      reference.className = 'reference-link';
      reference.href = currentCategory.reference;
      reference.textContent = 'Reference →';
      reference.target = '_blank';
      controlsView.appendChild(reference);
    }
  }
    
  controls.forEach((control, index) => {
    const controlItem = document.createElement('div');
    controlItem.className = 'control-item';
    controlItem.innerHTML = `
      <span class="index">${index + 1}.</span> ${control}
    `;
    controlsView.appendChild(controlItem);
  });
}

// Initialize the application
init();

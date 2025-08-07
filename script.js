// DOM elements
const platformSelect = document.getElementById('platform');
const categoryView = document.getElementById('category-view');
const controlsView = document.getElementById('controls-view');

// Current state
let currentTech = '';
let currentCategory = null;

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
    // Load the specific technology file from the data folder
    const response = await fetch(`data/${currentTech}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const categories = await response.json();
    renderCategories(categories);
    renderControls([]);
  } catch (error) {
    console.error(`Error loading data for ${currentTech}:`, error);
    categoryView.innerHTML = `<p class="error">Error loading data for ${currentTech}. Please try again later.</p>`;
  }
}

// Render category flashcards in grid layout
function renderCategories(categories) {
  categoryView.innerHTML = '';
  controlsView.innerHTML = '';
  
  if (!categories.length) {
    if (currentTech) {
      categoryView.innerHTML = '<p>Loading categories...</p>';
    } else {
      categoryView.innerHTML = '<p>Select a platform to view categories</p>';
    }
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
  categoryView.innerHTML = ''; // Clear categories view
  renderControls(category.controls);
}

// Render controls list in grid layout
function renderControls(controls) {
  controlsView.innerHTML = '';
  
  if (currentCategory) {
    const headerDiv = document.createElement('div');
    headerDiv.className = 'controls-header';
    
    const backButton = document.createElement('div');
    backButton.className = 'back-button';
    backButton.innerHTML = '&larr; Back to categories';
    backButton.addEventListener('click', () => {
      currentCategory = null;
      handlePlatformChange(); // Reload categories
    });
    
    const title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = currentCategory.name;
    
    headerDiv.appendChild(backButton);
    headerDiv.appendChild(title);
    
    if (currentCategory.reference) {
      const reference = document.createElement('a');
      reference.className = 'reference-link';
      reference.href = currentCategory.reference;
      reference.textContent = 'Reference &rarr;';
      reference.target = '_blank';
      headerDiv.appendChild(reference);
    }
    
    controlsView.appendChild(headerDiv);
    
    const controlsGrid = document.createElement('div');
    controlsGrid.className = 'grid-container';
    
    controls.forEach((control, index) => {
      const controlItem = document.createElement('div');
      controlItem.className = 'control-item';
      controlItem.innerHTML = `
        <span class="index">${index + 1}.</span> ${control}
      `;
      controlsGrid.appendChild(controlItem);
    });
    
    controlsView.appendChild(controlsGrid);
  } else {
    controlsView.innerHTML = '';
  }
}

// Initialize the application
init();

// Security checklist data
const checklistData = {
  web: [
    {
      name: "Authentication",
      reference: "https://owasp.org/www-project-top-ten/",
      controls: [
        "Implement multi-factor authentication",
        "Enforce strong password policies",
        "Secure password recovery mechanisms",
        "Use secure session management",
        "Implement account lockout",
        "Use OAuth 2.0 or OpenID Connect",
        "Protect against credential stuffing",
        "Implement biometric authentication",
        "Use passwordless authentication",
        "Secure session tokens properly"
      ]
    },
    {
      name: "Authorization",
      reference: "https://owasp.org/www-project-top-ten/",
      controls: [
        "Implement least privilege principle",
        "Use role-based access control",
        "Implement attribute-based access control",
        "Enforce access control checks",
        "Protect against IDOR attacks",
        "Secure admin interfaces",
        "Segregate duties",
        "Implement time-based restrictions",
        "Enforce location-based controls",
        "Secure API access controls"
      ]
    }
  ],
  mobile: [
    {
      name: "Data Storage",
      reference: "https://owasp.org/www-project-mobile-top-10/",
      controls: [
        "Use secure storage for sensitive data",
        "Encrypt data at rest",
        "Avoid plain text storage",
        "Use platform secure storage",
        "Implement secure file storage",
        "Protect against insecure storage",
        "Use encrypted databases",
        "Secure app storage areas",
        "Manage cache properly",
        "Clear sensitive data from memory"
      ]
    }
  ],
  cloud: [
    {
      name: "AWS Security",
      reference: "https://aws.amazon.com/security/",
      controls: [
        "Implement least privilege IAM",
        "Enable CloudTrail logging",
        "Use AWS Config",
        "Enable GuardDuty",
        "Secure VPC configurations",
        "Encrypt S3 buckets",
        "Use AWS KMS",
        "Enable MFA for root",
        "Secure security groups",
        "Rotate access keys"
      ]
    }
  ],
  cert: [
    {
      name: "CISSP",
      reference: "https://www.isc2.org/Certifications/CISSP",
      controls: [
        "Security and Risk Management",
        "Asset Security",
        "Security Architecture",
        "Network Security",
        "Identity Management",
        "Security Assessment",
        "Security Operations",
        "Software Development Security",
        "Legal and Compliance",
        "Incident response"
      ]
    }
  ]
};

// DOM elements
const platformSelect = document.getElementById('platform');
const categoryView = document.getElementById('category-view');
const controlsView = document.getElementById('controls-view');

// Current state
let currentTech = '';
let currentCategory = null;

// Initialize the application
function init() {
  platformSelect.addEventListener('change', handlePlatformChange);
  renderCategories([]);
  renderControls([]);
}

// Handle platform selection
function handlePlatformChange() {
  currentTech = platformSelect.value;
  currentCategory = null;
  
  if (!currentTech) {
    renderCategories([]);
    renderControls([]);
    return;
  }
  
  const categories = checklistData[currentTech] || [];
  renderCategories(categories);
  renderControls([]);
}

// Render category flashcards
function renderCategories(categories) {
  categoryView.innerHTML = '';
  
  if (!categories.length) {
    categoryView.innerHTML = '<p>No categories available</p>';
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
    backButton.textContent = '← Back to categories';
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
    
    const reference = document.createElement('a');
    reference.className = 'reference-link';
    reference.href = currentCategory.reference;
    reference.textContent = 'OWASP Reference →';
    reference.target = '_blank';
    controlsView.appendChild(reference);
  }
  
  if (!controls.length) {
    if (!currentCategory) {
      controlsView.innerHTML = '<p>Select a category to view controls</p>';
    }
    return;
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

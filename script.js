// Security checklist data
const checklistData = {
  web: [
    {
      name: "Authentication",
      reference: "https://owasp.org/www-project-top-ten/",
      controls: [
        "Implement multi-factor authentication for all user accounts",
        "Enforce strong password policies (min 12 chars, complexity)",
        "Implement secure password recovery mechanisms",
        "Use secure session management with expiration",
        "Implement account lockout after multiple failed attempts",
        "Use OAuth 2.0 or OpenID Connect for third-party auth",
        "Protect against credential stuffing attacks",
        "Implement biometric authentication securely",
        "Use passwordless authentication where appropriate",
        "Secure session tokens with HttpOnly and Secure flags"
      ]
    },
    {
      name: "Authorization",
      reference: "https://owasp.org/www-project-top-ten/",
      controls: [
        "Implement least privilege principle for all roles",
        "Use role-based access control (RBAC)",
        "Implement attribute-based access control (ABAC) where needed",
        "Enforce access control checks on every request",
        "Protect against IDOR (Insecure Direct Object Reference)",
        "Implement proper admin interface security",
        "Segregate duties for sensitive operations",
        "Implement time-based access restrictions",
        "Enforce location-based access controls where appropriate",
        "Implement proper access control for APIs"
      ]
    },
    {
      name: "Input Validation",
      reference: "https://owasp.org/www-project-top-ten/",
      controls: [
        "Validate all user inputs on server side",
        "Implement allow-list validation approach",
        "Sanitize all inputs before processing",
        "Validate content type for file uploads",
        "Implement maximum length constraints",
        "Use parameterized queries for database access",
        "Validate and sanitize HTML output",
        "Protect against SQL injection attacks",
        "Prevent cross-site scripting (XSS) vulnerabilities",
        "Protect against command injection attacks"
      ]
    }
  ],
  mobile: [
    {
      name: "Data Storage",
      reference: "https://owasp.org/www-project-mobile-top-10/",
      controls: [
        "Use secure storage for sensitive data",
        "Encrypt sensitive data at rest",
        "Avoid storing sensitive data in plain text",
        "Use Keychain (iOS) and Keystore (Android)",
        "Implement secure file storage practices",
        "Protect against insecure data storage",
        "Use encrypted databases when needed",
        "Secure app-specific storage areas",
        "Implement proper cache management",
        "Clear sensitive data from memory after use"
      ]
    },
    {
      name: "Authentication",
      reference: "https://owasp.org/www-project-mobile-top-10/",
      controls: [
        "Implement biometric authentication securely",
        "Use secure token storage",
        "Implement session timeout",
        "Protect against credential caching",
        "Secure authentication tokens",
        "Implement multi-factor authentication",
        "Protect against insecure authentication"
      ]
    }
  ],
  cloud: [
    {
      name: "AWS Security",
      reference: "https://aws.amazon.com/security/",
      controls: [
        "Implement IAM roles and policies with least privilege",
        "Enable CloudTrail logging for all regions",
        "Use AWS Config for resource tracking",
        "Enable GuardDuty for threat detection",
        "Implement VPC security groups properly",
        "Encrypt S3 buckets and enable versioning",
        "Use AWS KMS for encryption key management",
        "Enable multi-factor authentication for root account",
        "Implement security groups and NACLs properly",
        "Regularly rotate access keys and credentials"
      ]
    },
    {
      name: "Azure Security",
      reference: "https://azure.microsoft.com/en-us/services/security-center/",
      controls: [
        "Implement Azure AD with conditional access",
        "Use Azure Security Center for monitoring",
        "Enable Azure Defender for advanced protection",
        "Implement network security groups properly",
        "Use Azure Key Vault for secrets management",
        "Enable Azure Monitor and Log Analytics",
        "Implement Azure Policy for compliance",
        "Use managed identities for resources",
        "Enable JIT VM access with Azure Security Center",
        "Encrypt storage accounts and virtual disks"
      ]
    },
    {
      name: "GCP Security",
      reference: "https://cloud.google.com/security",
      controls: [
        "Implement Cloud Identity and Access Management",
        "Use VPC Service Controls for data isolation",
        "Enable Security Command Center",
        "Use Cloud KMS for encryption key management",
        "Implement Cloud Audit Logging for all services",
        "Use Identity-Aware Proxy for secure access",
        "Implement firewall rules with least privilege",
        "Enable Data Loss Prevention API",
        "Use Cloud Security Scanner for vulnerabilities",
        "Implement organization policies for compliance"
      ]
    }
  ],
  cert: [
    {
      name: "CISSP",
      reference: "https://www.isc2.org/Certifications/CISSP",
      controls: [
        "Security and Risk Management concepts",
        "Asset Security classification and protection",
        "Security Architecture and Engineering principles",
        "Communication and Network Security",
        "Identity and Access Management controls",
        "Security Assessment and Testing methodologies",
        "Security Operations best practices",
        "Software Development Security principles",
        "Legal, regulations, and compliance requirements",
        "Incident response and disaster recovery planning"
      ]
    },
    {
      name: "CISM",
      reference: "https://www.isaca.org/credentialing/cism",
      controls: [
        "Information Security Governance framework",
        "Information Risk Management practices",
        "Information Security Program development",
        "Incident Management and response",
        "Security metrics and reporting",
        "Compliance management strategies",
        "Security policy development",
        "Business continuity planning",
        "Vendor and third-party risk management",
        "Security awareness and training programs"
      ]
    },
    {
      name: "CCSP",
      reference: "https://www.isc2.org/Certifications/CCSP",
      controls: [
        "Cloud Concepts, Architecture and Design",
        "Cloud Data Security principles",
        "Cloud Platform and Infrastructure Security",
        "Cloud Application Security best practices",
        "Cloud Security Operations",
        "Legal, Risk and Compliance in cloud",
        "Secure cloud migration strategies",
        "Cloud identity and access management",
        "Cloud encryption and key management",
        "Incident response in cloud environments"
      ]
    }
  ]
};

// DOM elements
const platformSelect = document.getElementById('platform');
const searchInput = document.getElementById('search');
const categoriesContainer = document.getElementById('categories');
const controlsContainer = document.getElementById('controls');

// Current state
let currentTech = '';
let currentCategory = null;

// Initialize the application
function init() {
  // Set up event listeners
  platformSelect.addEventListener('change', handlePlatformChange);
  searchInput.addEventListener('input', filterCategories);
  
  // Initial render
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

// Filter categories based on search input
function filterCategories() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const categories = checklistData[currentTech] || [];
  
  if (!searchTerm) {
    renderCategories(categories);
    return;
  }
  
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm)
  );
  
  renderCategories(filteredCategories);
}

// Render category flashcards
function renderCategories(categories) {
  categoriesContainer.innerHTML = '';
  
  if (!categories.length) {
    categoriesContainer.innerHTML = '<p>No categories found</p>';
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
    categoriesContainer.appendChild(flashcard);
  });
}

// Show controls for a specific category
function showCategoryControls(category) {
  currentCategory = category;
  renderControls(category.controls);
}

// Render controls list
function renderControls(controls) {
  controlsContainer.innerHTML = '';
  
  if (currentCategory) {
    const backButton = document.createElement('div');
    backButton.className = 'back-button';
    backButton.innerHTML = '← Back to categories';
    backButton.addEventListener('click', () => {
      currentCategory = null;
      const categories = checklistData[currentTech] || [];
      renderCategories(categories);
      renderControls([]);
    });
    controlsContainer.appendChild(backButton);
    
    const title = document.createElement('h2');
    title.textContent = currentCategory.name;
    controlsContainer.appendChild(title);
    
    const reference = document.createElement('a');
    reference.href = currentCategory.reference;
    reference.textContent = 'Reference: ' + currentCategory.reference;
    reference.target = '_blank';
    controlsContainer.appendChild(reference);
  }
  
  if (!controls.length) {
    if (!currentCategory) {
      controlsContainer.innerHTML = '<p>Select a category to view controls</p>';
    }
    return;
  }
  
  controls.forEach((control, index) => {
    const controlItem = document.createElement('div');
    controlItem.className = 'control-item';
    controlItem.innerHTML = `
      <span class="index">${index + 1}.</span> ${control}
    `;
    controlsContainer.appendChild(controlItem);
  });
}

// Initialize the application
init();

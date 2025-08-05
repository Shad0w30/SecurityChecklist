// Theme configuration - maps platforms to themes
const platformThemes = {
  "Web": "dark",
  "Mobile": "dark",
  "APIs": "dark",
  "Server": "dark",
  "Kubernetes": "bright",
  "CI/CD": "bright",
  "Network": "dark",
  "Container": "bright",
  "Cloud": "bright"
};

// Load checklist data
let bestPractices = {};

fetch('checklist.json')
  .then(response => response.json())
  .then(data => {
    bestPractices = data;
    console.log('Checklist data loaded successfully');
  })
  .catch(error => {
    console.error('Error loading checklist data:', error);
    document.getElementById('results').textContent = "Error loading checklist data. Please try again later.";
  });

// DOM elements
const platformSelect = document.getElementById('platform');
const generateBtn = document.getElementById('generate');
const copyBtn = document.getElementById('copy');
const downloadBtn = document.getElementById('download');
const resultsElement = document.getElementById('results');

// Event listeners
generateBtn.addEventListener('click', generate);
copyBtn.addEventListener('click', copyToClipboard);
downloadBtn.addEventListener('click', downloadExcel);
platformSelect.addEventListener('change', updateTheme);

// Update theme based on selected platform
function updateTheme() {
  const platform = platformSelect.value;
  const theme = platformThemes[platform] || 'light';
  
  // Remove all theme attributes
  document.body.removeAttribute('data-theme');
  
  // Apply selected theme if not default
  if (theme !== 'light') {
    document.body.setAttribute('data-theme', theme);
  }
}

function generate() {
  const platform = platformSelect.value;
  const output = resultsElement;
  
  if (!platform) {
    output.textContent = "Please select a platform.";
    return;
  }
  
  const cases = bestPractices[platform];
  if (cases) {
    output.textContent = cases.map((item, i) => `${i + 1}. ${item}`).join('\n');
  } else {
    output.textContent = "No test cases found for the selected platform.";
  }
}

function copyToClipboard() {
  const text = resultsElement.textContent;
  navigator.clipboard.writeText(text)
    .then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = "✓ Copied!";
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    })
    .catch(() => {
      alert("Copy failed. Please try again.");
    });
}

function downloadExcel() {
  const platform = platformSelect.value;
  const cases = bestPractices[platform];
  
  if (!platform || !cases) {
    alert("Please select a platform with available test cases.");
    return;
  }
  
  const ws_data = [["#", "Platform", "Test Case"]];
  cases.forEach((tc, i) => ws_data.push([i + 1, platform, tc]));
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  
  // Set column widths
  ws['!cols'] = [
    {wch: 5},  // # column
    {wch: 15}, // Platform column
    {wch: 100} // Test Case column
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, "Security Checklist");
  XLSX.writeFile(wb, `SecurityChecklist_${platform}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

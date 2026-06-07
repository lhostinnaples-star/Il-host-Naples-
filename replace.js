const fs = require('fs');

const files = [
  'src/pages/SafetyCenterPage.tsx',
  'src/pages/HowItWorksPage.tsx',
  'src/pages/LandingPage.tsx',
  'src/pages/TermsPage.tsx',
  'src/pages/AboutPage.tsx',
  'src/pages/HelpCenterPage.tsx',
  'src/pages/InsurancePage.tsx',
  'src/pages/HostGuidelinesPage.tsx',
  'src/pages/PrivacyPage.tsx',
  'src/components/SEOHead.tsx',
  'src/components/Logo.tsx',
  'src/components/PendingApprovalScreen.tsx',
  'src/components/DashboardLayout.tsx',
  'src/contexts/SettingsContext.tsx',
  'src/utils/seo.ts',
  'index.html',
  'public/logo.svg',
  'functions/src/templates.ts',
  'functions/src/index.ts',
  'metadata.json'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/Il Host/g, 'L Host');
    content = content.replace(/IL HOST/g, 'L HOST');
    fs.writeFileSync(file, content);
  } else {
    console.warn(`File not found: ${file}`);
  }
}
console.log('Replacement complete.');


/**
 * This is a utility script to help split the large JSON files into sections.
 * It's not meant to be included in the production build.
 * 
 * Usage example:
 * 1. Copy the original JSON files to this directory
 * 2. Run: node generate-sections.js <locale> <section>
 * 
 * For example:
 * node generate-sections.js en testimonials
 */

const fs = require('fs');
const path = require('path');

const locale = process.argv[2];
const section = process.argv[3];

if (!locale || !section) {
  console.error('Usage: node generate-sections.js <locale> <section>');
  process.exit(1);
}

try {
  // Read the full JSON file
  const fullJsonPath = path.join(__dirname, `${locale}.json`);
  const fullJson = JSON.parse(fs.readFileSync(fullJsonPath, 'utf8'));
  
  // Extract the section
  const sectionData = fullJson[section];
  
  if (!sectionData) {
    console.error(`Section '${section}' not found in ${locale}.json`);
    process.exit(1);
  }
  
  // Create directory if it doesn't exist
  const outDir = path.join(__dirname, 'output', locale);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  // Write the section to a new file
  const outPath = path.join(outDir, `${section}.json`);
  fs.writeFileSync(outPath, JSON.stringify(sectionData, null, 2));
  
  console.log(`Successfully extracted '${section}' from ${locale}.json to ${outPath}`);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

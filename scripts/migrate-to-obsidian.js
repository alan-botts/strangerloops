#!/usr/bin/env node
/**
 * migrate-to-obsidian.js - Convert a PARA knowledge graph to Obsidian format
 * 
 * Converts:
 *   life/areas/people/<name>/summary.md + items.json
 *   → vault/people/<name>.md (Obsidian format with frontmatter + wikilinks)
 * 
 * Usage:
 *   node migrate-to-obsidian.js [source-dir] [target-dir]
 * 
 * Defaults:
 *   source-dir: ./life
 *   target-dir: ./vault
 */

const fs = require('fs');
const path = require('path');

const LIFE_DIR = process.argv[2] || path.join(process.cwd(), 'life');
const VAULT_DIR = process.argv[3] || path.join(process.cwd(), 'vault');

// Ensure vault directories exist
const dirs = ['people', 'companies', 'projects', 'resources', 'daily', 'templates'];
dirs.forEach(d => fs.mkdirSync(path.join(VAULT_DIR, d), { recursive: true }));

// Create .obsidian config
const obsidianDir = path.join(VAULT_DIR, '.obsidian');
fs.mkdirSync(obsidianDir, { recursive: true });

fs.writeFileSync(path.join(obsidianDir, 'app.json'), JSON.stringify({
  alwaysUpdateLinks: true,
  newFileLocation: "current",
  newLinkFormat: "relative",
  useMarkdownLinks: false
}, null, 2));

fs.writeFileSync(path.join(obsidianDir, 'daily-notes.json'), JSON.stringify({
  folder: "daily",
  format: "YYYY-MM-DD",
  template: "templates/daily-note"
}, null, 2));

function slugToTitle(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function extractWikilinks(text) {
  // Convert markdown links to wikilinks
  return text
    .replace(/\[([^\]]+)\]\(\.\.\/people\/([^\/]+)\/?\)/g, '[[$2|$1]]')
    .replace(/\[([^\]]+)\]\(\.\.\/companies\/([^\/]+)\/?\)/g, '[[$2|$1]]')
    .replace(/\[([^\]]+)\]\(areas\/people\/([^\/]+)\/?\)/g, '[[$2|$1]]')
    .replace(/\[([^\]]+)\]\(areas\/companies\/([^\/]+)\/?\)/g, '[[$2|$1]]');
}

function migrateEntity(type, name, sourceDir) {
  const summaryPath = path.join(sourceDir, 'summary.md');
  const itemsPath = path.join(sourceDir, 'items.json');
  
  let summary = '';
  let items = [];
  
  if (fs.existsSync(summaryPath)) {
    summary = fs.readFileSync(summaryPath, 'utf8');
  }
  
  if (fs.existsSync(itemsPath)) {
    try {
      items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
    } catch (e) {
      console.error(`  Error parsing ${itemsPath}: ${e.message}`);
    }
  }
  
  // Extract last updated from summary
  const lastUpdatedMatch = summary.match(/\*Last updated: ([^*]+)\*/);
  const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1].trim() : new Date().toISOString().split('T')[0];
  
  // Build frontmatter
  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];
  const entityType = type === 'people' ? 'person' : type === 'companies' ? 'company' : type.slice(0, -1);
  
  const frontmatter = {
    type: entityType,
    aliases: [slugToTitle(name)],
    tags: categories.map(c => `${type}/${c}`),
    created: items.length > 0 ? items.reduce((min, i) => i.timestamp < min ? i.timestamp : min, items[0].timestamp) : lastUpdated,
    updated: lastUpdated
  };
  
  // Build content
  let content = `---
type: ${frontmatter.type}
aliases: [${frontmatter.aliases.map(a => `"${a}"`).join(', ')}]
tags: [${frontmatter.tags.join(', ')}]
created: ${frontmatter.created}
updated: ${frontmatter.updated}
---

# ${slugToTitle(name)}

`;

  // Add summary content (skip the header and last-updated line)
  const summaryLines = summary.split('\n');
  const contentStart = summaryLines.findIndex(l => l.startsWith('##'));
  if (contentStart > -1) {
    content += extractWikilinks(summaryLines.slice(contentStart).join('\n'));
  }
  
  // Add items as a section if there are many
  if (items.length > 0) {
    content += `\n\n## All Facts (${items.length})\n\n`;
    
    // Group by category
    const byCategory = {};
    items.forEach(item => {
      const cat = item.category || 'uncategorized';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(item);
    });
    
    Object.entries(byCategory).forEach(([cat, catItems]) => {
      content += `### ${cat.charAt(0).toUpperCase() + cat.slice(1)}\n\n`;
      catItems.forEach(item => {
        const status = item.status === 'superseded' ? '~~' : '';
        content += `- ${status}${item.fact}${status}`;
        if (item.timestamp) content += ` *(${item.timestamp})*`;
        content += '\n';
      });
      content += '\n';
    });
  }
  
  // Write to vault
  const targetDir = path.join(VAULT_DIR, type);
  const targetPath = path.join(targetDir, `${name}.md`);
  fs.writeFileSync(targetPath, content);
  
  return { name, items: items.length, hasSummary: summary.length > 0 };
}

function migrateType(type) {
  const sourceBase = path.join(LIFE_DIR, 'areas', type);
  if (!fs.existsSync(sourceBase)) {
    console.log(`Skipping ${type} - directory not found`);
    return [];
  }
  
  const entities = fs.readdirSync(sourceBase).filter(f => {
    const stat = fs.statSync(path.join(sourceBase, f));
    return stat.isDirectory();
  });
  
  console.log(`\nMigrating ${type}: ${entities.length} entities`);
  
  const results = [];
  entities.forEach(name => {
    try {
      const result = migrateEntity(type, name, path.join(sourceBase, name));
      results.push(result);
      process.stdout.write('.');
    } catch (e) {
      console.error(`\n  Error migrating ${name}: ${e.message}`);
    }
  });
  console.log(' Done!');
  
  return results;
}

function migrateMemory(memoryDir) {
  const dailyDir = path.join(VAULT_DIR, 'daily');
  
  if (!fs.existsSync(memoryDir)) {
    console.log('No memory directory found');
    return;
  }
  
  const files = fs.readdirSync(memoryDir).filter(f => f.endsWith('.md'));
  console.log(`\nMigrating memory: ${files.length} daily notes`);
  
  files.forEach(file => {
    const source = path.join(memoryDir, file);
    const content = fs.readFileSync(source, 'utf8');
    
    // Add frontmatter if not present
    let newContent = content;
    if (!content.startsWith('---')) {
      const date = file.replace('.md', '');
      newContent = `---
type: daily
date: ${date}
---

${content}`;
    }
    
    // Convert to wikilinks
    newContent = extractWikilinks(newContent);
    
    fs.writeFileSync(path.join(dailyDir, file), newContent);
    process.stdout.write('.');
  });
  console.log(' Done!');
}

function createIndexFiles() {
  const types = ['people', 'companies'];
  
  types.forEach(type => {
    const dir = path.join(VAULT_DIR, type);
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    
    let index = `# ${type.charAt(0).toUpperCase() + type.slice(1)}\n\n`;
    index += `Total: ${files.length}\n\n`;
    
    files.sort().forEach(f => {
      const name = f.replace('.md', '');
      index += `- [[${type}/${name}|${slugToTitle(name)}]]\n`;
    });
    
    fs.writeFileSync(path.join(VAULT_DIR, `${type}.md`), index);
  });
  
  console.log('\nCreated index files (MOCs)');
}

function createDailyTemplate() {
  const template = `# {{date:YYYY-MM-DD}}

## Session Notes
- 

## Decisions
- 

## Links
- [[{{date:YYYY-MM-DD, -1 day}}|Yesterday]]
`;
  
  fs.writeFileSync(path.join(VAULT_DIR, 'templates', 'daily-note.md'), template);
  console.log('Created daily note template');
}

// Main
console.log('=== Obsidian Migration ===\n');
console.log(`Source: ${LIFE_DIR}`);
console.log(`Target: ${VAULT_DIR}`);

const peopleResults = migrateType('people');
const companyResults = migrateType('companies');

// Try to migrate memory folder if it exists alongside life/
const memoryDir = path.join(path.dirname(LIFE_DIR), 'memory');
if (fs.existsSync(memoryDir)) {
  migrateMemory(memoryDir);
}

createIndexFiles();
createDailyTemplate();

console.log('\n=== Summary ===');
console.log(`People: ${peopleResults.length} migrated`);
console.log(`Companies: ${companyResults.length} migrated`);
console.log(`\nVault ready at: ${VAULT_DIR}`);

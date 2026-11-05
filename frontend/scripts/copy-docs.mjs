import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const sourceRoot = path.join(repoRoot, 'docs', 'project-notes');
const destinationRoot = path.join(repoRoot, 'frontend', 'public', 'docs', 'content');

async function collect(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = path.posix.join(prefix, entry.name);
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(absolutePath, relativePath));
    else if (/\.(md|mmd)$/i.test(entry.name)) files.push({ relativePath, absolutePath });
  }
  return files;
}

const files = await collect(sourceRoot);
const docs = [];
const diagrams = [];

for (const file of files) {
  const destination = path.join(destinationRoot, file.relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(file.absolutePath, destination);
  if (file.relativePath.endsWith('.md')) {
    const content = await readFile(file.absolutePath, 'utf8');
    const title = content.match(/^#\s+(.+)$/m)?.[1]?.replace(/^\d+\s*[·.]\s*/, '') || file.relativePath;
    const summary = content.split(/\r?\n\s*\r?\n/).find((part) => part.trim() && !part.trim().startsWith('#'))?.replace(/[#*`>\[\]]/g, '').trim().slice(0, 180) || '';
    docs.push({ file: file.relativePath, slug: path.basename(file.relativePath, '.md'), title, summary });
  } else {
    diagrams.push({ file: file.relativePath, slug: file.relativePath.replace(/^diagrams\//, '').replace(/\.mmd$/i, ''), title: path.basename(file.relativePath, '.mmd').replace(/[-_]/g, ' ') });
  }
}

docs.sort((a, b) => a.file.localeCompare(b.file));
diagrams.sort((a, b) => a.file.localeCompare(b.file));
await mkdir(destinationRoot, { recursive: true });
await writeFile(path.join(destinationRoot, 'manifest.json'), JSON.stringify({ docs, diagrams }, null, 2));
console.log(`Copied ${docs.length} documentation pages and ${diagrams.length} Mermaid diagrams.`);

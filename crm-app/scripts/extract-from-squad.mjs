/**
 * Extrai blocos de código dos arquivos .md gerados pelo squad Opensquad
 * e grava em arquivos reais no projeto crm-app.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SQUAD_OUTPUT = path.resolve(
  ROOT,
  '../squads/crm-techmalhas/output/2026-05-24-162435/code',
);

const SOURCES = [
  path.join(SQUAD_OUTPUT, 'v1/db-schema.md'),
  path.join(SQUAD_OUTPUT, 'v2/backend.md'),
  path.join(SQUAD_OUTPUT, 'v3/frontend.md'),
];

function extractFiles(markdown) {
  const files = new Map();
  const headerRegex = /^#{2,3} `([^`]+)`/gm;
  const matches = [...markdown.matchAll(headerRegex)];

  for (let i = 0; i < matches.length; i++) {
    const filePath = matches[i][1].trim();
    if (filePath.includes('package.json') && filePath.includes('dependências')) continue;

    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : markdown.length;
    const section = markdown.slice(start, end);

    const codeMatch = section.match(/```[\w]*\n([\s\S]*?)```/);
    if (!codeMatch) continue;

    let content = codeMatch[1];
    if (content.endsWith('\n')) content = content.slice(0, -1);

    files.set(filePath, content);
  }

  return files;
}

let total = 0;
const allFiles = new Map();

for (const source of SOURCES) {
  if (!fs.existsSync(source)) {
    console.warn(`⚠️  Não encontrado: ${source}`);
    continue;
  }
  const md = fs.readFileSync(source, 'utf8');
  const extracted = extractFiles(md);
  console.log(`📄 ${path.basename(source)} → ${extracted.size} arquivos`);
  for (const [fp, content] of extracted) {
    allFiles.set(fp, content);
  }
}

for (const [relPath, content] of allFiles) {
  const outPath = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content, 'utf8');
  total++;
  console.log(`  ✅ ${relPath}`);
}

console.log(`\n🎉 ${total} arquivos extraídos para ${ROOT}`);

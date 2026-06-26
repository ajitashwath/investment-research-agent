import fs from 'fs';
import path from 'path';
import { runInvestmentAnalysis } from '../langgraph/graph.js';

// Setup directories
const outputDir = path.resolve('assignment/outputs');
fs.mkdirSync(outputDir, { recursive: true });

const companies = [
  { name: 'Apple Inc.', filename: 'company_1.md' },
  { name: 'Tesla Inc.', filename: 'company_2.md' },
  { name: 'NVIDIA Corporation', filename: 'company_3.md' }
];

async function run() {
  console.log('Starting analysis for companies...');
  for (const comp of companies) {
    console.log(`\n========================================`);
    console.log(`Analyzing: ${comp.name}`);
    console.log(`========================================`);
    try {
      const onProgress = (prog) => {
        if (prog.status === 'running') {
          console.log(`[${prog.agent}] Running... ${prog.message || ''}`);
        } else if (prog.status === 'done') {
          console.log(`[${prog.agent}] Done! ${prog.message || ''}`);
        } else if (prog.status === 'warning') {
          console.log(`[${prog.agent}] Warning: ${prog.message || ''}`);
        } else if (prog.status === 'error') {
          console.log(`[${prog.agent}] Error: ${prog.message || ''}`);
        }
      };

      const result = await runInvestmentAnalysis(comp.name, onProgress, {
        model: 'gemini-2.5-flash',
        depth: 'advanced'
      });

      if (result.report) {
        const filePath = path.join(outputDir, comp.filename);
        fs.writeFileSync(filePath, result.report, 'utf8');
        console.log(`Successfully saved report for ${comp.name} to ${filePath}`);
      } else {
        console.error(`Failed to generate report text for ${comp.name}`);
      }
    } catch (error) {
      console.error(`Error analyzing ${comp.name}:`, error);
    }
  }
  console.log('\nAll runs completed.');
}

run().catch(console.error);

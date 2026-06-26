import fs from 'fs';
import path from 'path';
import readline from 'readline';

const chatLogsDir = path.resolve('assignment/llm_chat_logs');
fs.mkdirSync(chatLogsDir, { recursive: true });

async function convertTranscript(transcriptPath, outputPath, title) {
  if (!fs.existsSync(transcriptPath)) {
    console.warn(`Transcript not found: ${transcriptPath}`);
    return;
  }

  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let markdown = `# ${title}\n\n`;
  markdown += `*Generated from development session logs.*\n\n---\n\n`;

  let currentSource = null;

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const step = JSON.parse(line);

      // Handle User Input
      if (step.type === 'USER_INPUT') {
        let content = step.content || '';
        // Strip XML tags like <USER_REQUEST> if present
        content = content.replace(/<USER_REQUEST>|<\/USER_REQUEST>/g, '').trim();
        // Hide metadata blocks in details if they are verbose
        content = content.split('<ADDITIONAL_METADATA>')[0].trim();
        
        markdown += `## 👤 User\n\n${content}\n\n---\n\n`;
      } 
      // Handle Planner/Model Output
      else if (step.source === 'MODEL' && step.type === 'PLANNER_RESPONSE') {
        let content = step.content || '';
        markdown += `## 🤖 Assistant\n\n${content}\n\n`;

        if (step.tool_calls && step.tool_calls.length > 0) {
          markdown += `### 🛠️ Tool Execution\n`;
          for (const call of step.tool_calls) {
            markdown += `- **Tool**: \`${call.name}\`\n`;
            if (call.args) {
              const argsStr = typeof call.args === 'string' ? call.args : JSON.stringify(call.args, null, 2);
              markdown += `  - **Arguments**:\n\`\`\`json\n${argsStr}\n\`\`\`\n`;
            }
          }
          markdown += `\n`;
        }
        markdown += `---\n\n`;
      }
      // Handle Tool Output
      else if (step.source === 'MODEL' && step.type !== 'PLANNER_RESPONSE') {
        // This is the output returned by a tool execution
        let content = step.content || '';
        // If content is very long, truncate it for readability in logs
        if (content.length > 1500) {
          content = content.substring(0, 1500) + '\n\n... [Output Truncated for Log Readability] ...';
        }
        markdown += `> **System/Tool Output** (\`${step.type}\`):\n>\n`;
        // Format content as blockquote lines
        const lines = content.split('\n');
        for (const l of lines) {
          markdown += `> ${l}\n`;
        }
        markdown += `\n---\n\n`;
      }
    } catch (err) {
      // Ignore parsing errors for partial lines
    }
  }

  fs.writeFileSync(outputPath, markdown, 'utf8');
  console.log(`Saved formatted log to ${outputPath}`);
}

async function run() {
  // Session 1 logs
  const session1Path = 'C:\\Users\\AJIT ASHWATH R\\.gemini\\antigravity-ide\\brain\\32ec7930-1808-441e-b136-ff160f0d73e5\\.system_generated\\logs\\transcript_full.jsonl';
  const out1Path = path.join(chatLogsDir, 'chat_01.md');
  await convertTranscript(session1Path, out1Path, 'LLM Chat Log - Session 1: Supabase Integration & Account Dashboard');

  // Session 2 logs (current conversation)
  const session2Path = 'C:\\Users\\AJIT ASHWATH R\\.gemini\\antigravity-ide\\brain\\c6bb8e3e-3368-4a7a-af5c-c170055b726f\\.system_generated\\logs\\transcript_full.jsonl';
  const out2Path = path.join(chatLogsDir, 'chat_02.md');
  await convertTranscript(session2Path, out2Path, 'LLM Chat Log - Session 2: Assignment Packaging & Setup');
}

run().catch(console.error);

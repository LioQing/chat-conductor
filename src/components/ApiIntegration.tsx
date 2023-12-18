import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import MarkdownEditor from './MarkdownEditor';

export interface ApiIntegrationProps {
  pipelineId: number;
  open: boolean;
  onClose: () => void;
}

function ApiIntegration({ pipelineId, open, onClose }: ApiIntegrationProps) {
  const [tab, setTab] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const [timer, setTimer] = React.useState<NodeJS.Timeout | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setCopied(false);
    if (timer) {
      clearTimeout(timer);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(instructions[tab].copy);
    setCopied(true);
    if (timer) {
      clearTimeout(timer);
    }
    setTimer(
      setTimeout(() => {
        setCopied(false);
      }, 3000),
    );
  };

  const instructions = [
    {
      label: 'Curl',
      language: 'bash',
      copy:
        `curl -X 'POST' \\\n` +
        `  'http://localhost:8001/conductor/chat/send/${pipelineId}/' \\\n` +
        `  -H 'accept: application/json' \\\n` +
        `  -H 'Authorization: Api-Key API_KEY' \\\n` +
        `  -H 'Content-Type: application/json' \\\n` +
        `  -d '{"user_message": "USER_MESSAGE"}'`,
    },
    {
      label: 'Python',
      language: 'py',
      copy:
        `import requests\n` +
        `\n` +
        `response = requests.post(\n` +
        `    'http://localhost:8001/conductor/chat/send/${pipelineId}/',\n` +
        `    json={"user_message": "USER_MESSAGE"},\n` +
        `    headers={\n` +
        `        "Accept": "application/json",\n` +
        `        "Authorization": "Api-Key API_KEY",\n` +
        `        "Content-Type": "application/json",\n` +
        `    },\n` +
        `)\n` +
        `\n` +
        `print(response.json())`,
    },
    {
      label: 'JavaScript',
      language: 'js',
      copy:
        `fetch('http://localhost:8001/conductor/chat/send/${pipelineId}/', {\n` +
        `  method: 'POST',\n` +
        `  headers: {\n` +
        `    'Accept': 'application/json',\n` +
        `    'Authorization': 'Api-Key API_KEY',\n` +
        `    'Content-Type': 'application/json'\n` +
        `  },\n` +
        `  body: JSON.stringify({ "user_message": "USER_MESSAGE" })\n` +
        `})\n` +
        `.then(response => response.json())\n` +
        `.then(response => console.log(response));`,
    },
  ];

  const copy =
    `\`\`\`${instructions[tab].language}\n` +
    `${instructions[tab].copy}\n` +
    `\`\`\``;

  const text =
    `Replace \`API_KEY\` with your API key and \`USER_MESSAGE\` with the user message.\n\n` +
    `You can find your API key in *Account > API Key*.`;

  return (
    <Dialog onClose={onClose} open={open} maxWidth="xl">
      <DialogTitle>API Integration</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={1}>
          <Tabs value={tab} onChange={handleTabChange}>
            {instructions.map((instruction) => (
              <Tab key={instruction.label} label={instruction.label} />
            ))}
          </Tabs>
          <MarkdownEditor readonly content={copy} />
          <Button
            variant="outlined"
            onClick={handleCopyToClipboard}
            startIcon={<ContentCopyIcon />}
            color={copied ? 'success' : 'primary'}
            sx={{ mb: 2 }}
          >
            {copied ? 'Copied to clipboard' : 'Copy to clipboard'}
          </Button>
          <MarkdownEditor readonly content={text} />
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ApiIntegration;

import usePrompt from '../hooks/usePrompt';

export interface PromptProps {
  when: boolean;
  message: string;
  beforeUnload: boolean;
}

function Prompt({
  when,
  message,
  beforeUnload,
}: PromptProps): JSX.Element | null {
  usePrompt(when ? message : null, beforeUnload);
  return null;
}

export default Prompt;

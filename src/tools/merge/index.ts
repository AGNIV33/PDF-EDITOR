import type { ToolDefinition } from '../types';
import { runMerge } from './run';

export const mergeTool: ToolDefinition = {
  id: 'merge',
  name: 'Merge PDF',
  description: 'Join many PDF files into one, in the order you choose.',
  icon: 'merge',
  category: 'organize',
  platform: 'both',
  accepts: ['application/pdf', '.pdf'],
  multiple: true,
  enabled: true,
  run: runMerge,
};

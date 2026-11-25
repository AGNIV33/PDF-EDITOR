import type { ComponentType } from 'react';

export type ToolCategory =
  | 'organize' | 'optimize' | 'convert-to-pdf' | 'convert-from-pdf'
  | 'edit' | 'security' | 'india' | 'ai' | 'image' | 'other';

export type ToolPlatform = 'web' | 'desktop' | 'both';

export interface ToolResult { name: string; blob: Blob }

export interface ToolDefinition {
  id: string;                    // url slug, e.g. 'merge'
  name: string;                  // 'Merge PDF'
  description: string;           // one simple line
  icon: string;                  // icon name from the icon set
  category: ToolCategory;
  platform: ToolPlatform;
  accepts: string[];             // MIME types or extensions
  multiple: boolean;
  maxFiles?: number;
  enabled: boolean;              // default; admin may override via tool_settings
  defaultOptions?: Record<string, unknown>;
  run: (
    files: File[],
    options: Record<string, unknown>,
    onProgress: (percent: number) => void,
    signal?: AbortSignal         // user pressed Cancel
  ) => Promise<ToolResult[]>;
  OptionsPanel?: ComponentType<{
    value: Record<string, unknown>;
    onChange: (v: Record<string, unknown>) => void;
  }>;
}

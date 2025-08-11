import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

export function renderMarkdown(content: string): string {
  const html = marked(content) as string;
  return DOMPurify.sanitize(html);
}
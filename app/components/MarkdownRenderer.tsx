"use client";

export default function MarkdownRenderer({ content }: { content: string }) {
  // Basic markdown parsing - handles common markdown syntax
  const parseMarkdown = (text: string): string => {
    if (!text) return "";
    
    let html = text;
    
    // Process code blocks first (before escaping)
    const codeBlocks: string[] = [];
    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
      const id = `CODE_BLOCK_${codeBlocks.length}`;
      codeBlocks.push(code);
      return id;
    });
    
    // Process inline code
    const inlineCodes: string[] = [];
    html = html.replace(/`([^`]+)`/g, (match, code) => {
      const id = `INLINE_CODE_${inlineCodes.length}`;
      inlineCodes.push(code);
      return id;
    });
    
    // Escape HTML
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Restore code blocks (they're already escaped)
    codeBlocks.forEach((code, i) => {
      html = html.replace(`CODE_BLOCK_${i}`, `<pre class="bg-muted p-2 rounded overflow-x-auto my-2"><code>${code}</code></pre>`);
    });
    
    // Restore inline code
    inlineCodes.forEach((code, i) => {
      html = html.replace(`INLINE_CODE_${i}`, `<code class="bg-muted px-1 rounded">${code}</code>`);
    });
    
    // Process links (after escaping to avoid issues)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>');
    
    // Process headers (must be after code processing to avoid matching in code)
    const lines = html.split("\n");
    const processedLines: string[] = [];
    let inList = false;
    let listItems: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Headers
      if (line.match(/^###\s+/)) {
        if (inList) {
          processedLines.push(`<ul>${listItems.join("")}</ul>`);
          listItems = [];
          inList = false;
        }
        processedLines.push(`<h3 class="font-semibold text-lg mt-4 mb-2">${line.replace(/^###\s+/, "")}</h3>`);
        continue;
      }
      if (line.match(/^##\s+/)) {
        if (inList) {
          processedLines.push(`<ul>${listItems.join("")}</ul>`);
          listItems = [];
          inList = false;
        }
        processedLines.push(`<h2 class="font-semibold text-xl mt-4 mb-2">${line.replace(/^##\s+/, "")}</h2>`);
        continue;
      }
      if (line.match(/^#\s+/)) {
        if (inList) {
          processedLines.push(`<ul>${listItems.join("")}</ul>`);
          listItems = [];
          inList = false;
        }
        processedLines.push(`<h1 class="font-bold text-2xl mt-4 mb-2">${line.replace(/^#\s+/, "")}</h1>`);
        continue;
      }
      
      // Lists
      if (line.match(/^[-*]\s+/)) {
        if (!inList) {
          inList = true;
        }
        listItems.push(`<li class="ml-4 list-disc">${line.replace(/^[-*]\s+/, "")}</li>`);
        continue;
      }
      if (line.match(/^\d+\.\s+/)) {
        if (!inList) {
          inList = true;
        }
        listItems.push(`<li class="ml-4 list-decimal">${line.replace(/^\d+\.\s+/, "")}</li>`);
        continue;
      }
      
      // End list if we hit a non-list line
      if (inList && line.trim() === "") {
        processedLines.push(`<ul>${listItems.join("")}</ul>`);
        listItems = [];
        inList = false;
        processedLines.push("");
        continue;
      }
      if (inList) {
        processedLines.push(`<ul>${listItems.join("")}</ul>`);
        listItems = [];
        inList = false;
      }
      
      // Regular paragraph lines
      if (line.trim() === "") {
        processedLines.push("");
      } else {
        processedLines.push(line);
      }
    }
    
    // Close any remaining list
    if (inList && listItems.length > 0) {
      processedLines.push(`<ul>${listItems.join("")}</ul>`);
    }
    
    html = processedLines.join("\n");
    
    // Bold and italic (must be after list processing)
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    
    // Convert double newlines to paragraphs
    html = html.split("\n\n").map(para => {
      if (!para.trim()) return "";
      if (para.match(/^<(h[1-6]|ul|pre)/)) return para;
      return `<p class="mb-2">${para.replace(/\n/g, "<br />")}</p>`;
    }).join("\n");
    
    // Handle remaining single newlines
    html = html.replace(/\n/g, "<br />");
    
    return html;
  };

  return (
    <div
      className="text-foreground max-w-none"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
}

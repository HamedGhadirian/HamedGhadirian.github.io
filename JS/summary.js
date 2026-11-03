document.addEventListener('DOMContentLoaded', async () => {
    const summaryPanel = document.querySelector('.summary-panel');

    if (!summaryPanel) {
        console.error('Summary element not found');
        return;
    }

    // **text** becomes bold
    const appendText = (parent, text) => {
        text.split('**').forEach((part, i) => {
            if (i % 2 === 1) {
                const strong = document.createElement('strong');
                strong.textContent = part;
                parent.appendChild(strong);
            } else {
                parent.appendChild(document.createTextNode(part));
            }
        });
    };

    try {
        const response = await fetch('/Config/summary.txt');
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const text = await response.text();
        summaryPanel.replaceChildren();

        // Blank lines split paragraphs; [label](url) becomes a link
        text.split(/\r?\n\s*\r?\n/).forEach(block => {
            if (!block.trim()) return;
            const paragraph = document.createElement('p');
            const parts = block.trim().split(/\[([^\]]+)\]\(([^)\s]+)\)/);
            for (let i = 0; i < parts.length; i += 3) {
                appendText(paragraph, parts[i]);
                if (i + 2 < parts.length) {
                    const anchor = document.createElement('a');
                    anchor.textContent = parts[i + 1];
                    anchor.href = parts[i + 2];
                    if (parts[i + 2].startsWith('http')) {
                        anchor.target = '_blank';
                        anchor.rel = 'noopener';
                    }
                    paragraph.appendChild(anchor);
                }
            }
            summaryPanel.appendChild(paragraph);
        });
    } catch (error) {
        console.error('Failed to load summary:', error);
    }
});

export function removeHtmlTags(htmlString: string): string {
    // Create a new DOMParser instance
    const parser = new DOMParser();
    // Parse the HTML string into a DOM document
    const doc = parser.parseFromString(htmlString, 'text/html');
    // Extract the text content from the parsed document
    let textContent = doc.body.textContent || "";
    // Remove newline characters and reduce multiple spaces to a single space
    textContent = textContent.replace(/\s+/g, ' ').trim();
    return textContent;
}
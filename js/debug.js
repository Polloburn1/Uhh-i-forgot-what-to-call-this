/* 
  debug.js
  Global Debugger Tool.
  Usage: Debug.log("Category", "Message", object);
  Toggle DEBUG_MODE to true to see logs.
*/

export const Debug = {
    enabled: true, // Default to true for development

    log(category, message, ...args) {
        if (!this.enabled) return;

        const timestamp = new Date().toLocaleTimeString();
        const style = this.getStyle(category);

        console.log(
            `%c[${timestamp}] [${category}] ${message}`,
            style,
            ...args
        );
    },

    getStyle(category) {
        switch (category.toLowerCase()) {
            case 'net': return 'color: #3b82f6; font-weight: bold;'; // Blue
            case 'game': return 'color: #10b981; font-weight: bold;'; // Green
            case 'error': return 'color: #ef4444; font-weight: bold; background: #fee2e2; padding: 2px;'; // Red
            case 'warn': return 'color: #f59e0b; font-weight: bold;'; // Orange
            case 'editor': return 'color: #8b5cf6; font-weight: bold;'; // Purple
            default: return 'color: #64748b;'; // Gray
        }
    },

    warn(message, ...args) { this.log('WARN', message, ...args); },
    error(message, ...args) { this.log('ERROR', message, ...args); }
};

// Make it globally available for ease of use in console
window.Debug = Debug;

// Global Error Handler
window.onerror = function (msg, url, lineNo, columnNo, error) {
    Debug.error('Global', `${msg} @ ${url}:${lineNo}:${columnNo}`, error);
    return false; // Let default handler run too
};

console.log('%c Debugger Loaded Successfully ', 'background: #222; color: #bada55');

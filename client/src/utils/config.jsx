let config = null;

export async function loadConfig() {
    if (!config) {
        try {
            const response = await fetch('/config.json'); // Fetch the dynamically generated config
            if (!response.ok) {
                throw new Error('Failed to load configuration');
            }
            config = await response.json();
        } catch (error) {
            console.error('Error loading configuration:', error);
            throw error;
        }
    }
    return config;
}

export function getApiBaseUrl() {
    if (!config) {
        throw new Error('Configuration not loaded yet. Call loadConfig first.');
    }
    return config.apiBaseUrl;
}

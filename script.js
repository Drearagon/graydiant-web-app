// DOM elements
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const imageContainer = document.getElementById('imageContainer');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const charCount = document.getElementById('charCount');
const spinner = document.getElementById('spinner');

// API configuration
const API_ENDPOINT = 'https://your-vps-url/render';

// State management
let isGenerating = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateCharCounter();
});

// Setup event listeners
function setupEventListeners() {
    // Generate button click handler
    generateBtn.addEventListener('click', handleGenerate);
    
    // Enter key handler for textarea
    promptInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleGenerate();
        }
    });
    
    // Character counter update
    promptInput.addEventListener('input', updateCharCounter);
    
    // Input validation on type
    promptInput.addEventListener('input', function() {
        if (errorMessage.style.display !== 'none') {
            hideError();
        }
    });
}

// Update character counter
function updateCharCounter() {
    const currentLength = promptInput.value.length;
    charCount.textContent = currentLength;
    
    // Update counter color based on length
    if (currentLength > 450) {
        charCount.style.color = '#ef4444';
    } else if (currentLength > 400) {
        charCount.style.color = '#f59e0b';
    } else {
        charCount.style.color = '#888';
    }
}

// Main generate function
async function handleGenerate() {
    if (isGenerating) return;
    
    const prompt = promptInput.value.trim();
    
    // Validate input
    if (!prompt) {
        showError('Please enter a prompt to generate an image.');
        promptInput.focus();
        return;
    }
    
    if (prompt.length < 3) {
        showError('Please enter a more descriptive prompt (at least 3 characters).');
        promptInput.focus();
        return;
    }
    
    // Start generation process
    setLoadingState(true);
    hideError();
    
    try {
        const imageUrl = await generateImage(prompt);
        displayImage(imageUrl);
    } catch (error) {
        handleGenerationError(error);
    } finally {
        setLoadingState(false);
    }
}

// Generate image via API
async function generateImage(prompt) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                timestamp: Date.now() // Add timestamp to prevent caching
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validate response structure
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid response format from server');
        }
        
        // Handle different possible response formats
        let imageUrl;
        if (data.image_url) {
            imageUrl = data.image_url;
        } else if (data.url) {
            imageUrl = data.url;
        } else if (data.image) {
            imageUrl = data.image;
        } else if (typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'))) {
            imageUrl = data;
        } else {
            throw new Error('No image URL found in server response');
        }
        
        // Validate image URL
        if (!imageUrl || typeof imageUrl !== 'string') {
            throw new Error('Invalid image URL received from server');
        }
        
        return imageUrl;
        
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please try again with a shorter prompt.');
        }
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Unable to connect to the image generation service. Please check your internet connection and try again.');
        }
        
        throw error;
    }
}

// Display generated image
function displayImage(imageUrl) {
    // Create image element
    const img = document.createElement('img');
    img.className = 'generated-image';
    img.alt = 'Generated image';
    
    // Handle image loading
    img.onload = function() {
        // Clear container and add image
        imageContainer.innerHTML = '';
        imageContainer.appendChild(img);
        imageContainer.classList.add('has-image');
        
        // Add download functionality
        addDownloadButton(imageUrl);
    };
    
    img.onerror = function() {
        showError('Failed to load the generated image. The image URL may be invalid or the image may be corrupted.');
        resetImageContainer();
    };
    
    // Start loading image
    img.src = imageUrl;
}

// Add download button for generated image
function addDownloadButton(imageUrl) {
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download-btn';
    downloadBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Download
    `;
    
    downloadBtn.onclick = function() {
        downloadImage(imageUrl);
    };
    
    // Add download button styling
    const style = document.createElement('style');
    style.textContent = `
        .download-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            border: none;
            border-radius: 8px;
            padding: 0.5rem 1rem;
            color: white;
            font-size: 0.875rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
            z-index: 10;
        }
        .download-btn:hover {
            background: rgba(0, 0, 0, 0.9);
            transform: translateY(-1px);
        }
        .image-container {
            position: relative;
        }
    `;
    
    if (!document.querySelector('style[data-download-btn]')) {
        style.setAttribute('data-download-btn', '');
        document.head.appendChild(style);
    }
    
    imageContainer.appendChild(downloadBtn);
}

// Download image functionality
async function downloadImage(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `graydient-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download failed:', error);
        showError('Failed to download image. You can right-click the image and select "Save image as..."');
    }
}

// Set loading state
function setLoadingState(loading) {
    isGenerating = loading;
    
    if (loading) {
        generateBtn.classList.add('loading');
        generateBtn.disabled = true;
        imageContainer.classList.add('loading');
        promptInput.disabled = true;
    } else {
        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;
        imageContainer.classList.remove('loading');
        promptInput.disabled = false;
    }
}

// Handle generation errors
function handleGenerationError(error) {
    console.error('Generation error:', error);
    
    let errorMsg = 'An unexpected error occurred while generating the image.';
    
    if (error.message) {
        errorMsg = error.message;
    } else if (typeof error === 'string') {
        errorMsg = error;
    }
    
    // Add helpful suggestions for common errors
    if (errorMsg.toLowerCase().includes('network') || errorMsg.toLowerCase().includes('fetch')) {
        errorMsg += ' Please check your internet connection and try again.';
    } else if (errorMsg.toLowerCase().includes('timeout')) {
        errorMsg += ' Try using a shorter, more specific prompt.';
    } else if (errorMsg.toLowerCase().includes('server') || errorMsg.includes('5')) {
        errorMsg += ' The server may be experiencing high load. Please try again in a moment.';
    }
    
    showError(errorMsg);
    resetImageContainer();
}

// Show error message
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    
    // Auto-hide error after 10 seconds
    setTimeout(() => {
        if (errorMessage.style.display !== 'none') {
            hideError();
        }
    }, 10000);
}

// Hide error message
function hideError() {
    errorMessage.style.display = 'none';
}

// Reset image container to placeholder state
function resetImageContainer() {
    imageContainer.classList.remove('has-image', 'loading');
    imageContainer.innerHTML = `
        <div class="placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
            </svg>
            <p>Your generated image will appear here</p>
        </div>
    `;
}

// Utility function to validate image URL
function isValidImageUrl(url) {
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url) || url.startsWith('data:image/');
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to clear/reset
    if (e.key === 'Escape') {
        if (isGenerating) {
            // Cancel generation if possible
            setLoadingState(false);
        } else {
            // Clear input and reset
            promptInput.value = '';
            updateCharCounter();
            hideError();
            resetImageContainer();
            promptInput.focus();
        }
    }
});

// Add service worker for offline functionality (optional enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Service worker registration would go here if needed
        // Currently not implemented to keep the app simple
    });
}

// Performance monitoring
const startTime = performance.now();
window.addEventListener('load', function() {
    const loadTime = performance.now() - startTime;
    console.log(`App loaded in ${loadTime.toFixed(2)}ms`);
});

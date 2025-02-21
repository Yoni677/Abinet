// Load prayers data
async function loadPrayers() {
    try {
        const response = await fetch('prayers.json');
        const data = await response.json();
        return data.prayers;
    } catch (error) {
        console.error('Error loading prayers:', error);
        return [];
    }
}

// Load quotes data
async function loadQuotes() {
    try {
        const response = await fetch('quotes.json');
        const data = await response.json();
        return data.quotes;
    } catch (error) {
        console.error('Error loading quotes:', error);
        return [];
    }
}

// Get daily quote
function getDailyQuote(quotes) {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return quotes[dayOfYear % quotes.length];
}

// Generate prayer page content
function generatePrayerContent(prayer) {
    return `
        <div class="prayer-header">
            <div class="prayer-info">
                <h1>${prayer.title}</h1>
                <p class="prayer-category">${prayer.category}</p>
            </div>
            <div class="prayer-actions">
                <button class="play-btn large" onclick="playAudio('${prayer.audioFile}')">▶ ያዳምጡ</button>
                <button class="favorite-btn">❤</button>
            </div>
        </div>

        <div class="prayer-text">
            <div class="geez-text">
                <h3>በግእዝ</h3>
                <p>${prayer.geezText}</p>
            </div>

            <div class="amharic-text">
                <h3>በአማርኛ</h3>
                <p>${prayer.amharicText}</p>
            </div>
        </div>
    `;
}

// Play audio function
let currentAudio = null;
let currentPrayer = null;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function createAudioControls(prayer) {
    const controls = document.createElement('div');
    controls.className = 'audio-controls';
    controls.innerHTML = `
        <div class="audio-info">
            <h4 class="audio-title">${prayer.title}</h4>
            <span class="audio-category">${prayer.category}</span>
        </div>
        <div class="control-buttons">
            <button onclick="currentAudio.currentTime -= 10">⏪</button>
            <button onclick="togglePlay()">⏸</button>
            <button onclick="currentAudio.currentTime += 10">⏩</button>
        </div>
        <span class="audio-time" id="currentTime">0:00</span>
        <div class="audio-progress">
            <div class="progress-bar"></div>
        </div>
        <span class="audio-time" id="duration">0:00</span>
    `;
    return controls;
}

function togglePlay() {
    if (!currentAudio) return;
    
    if (currentAudio.paused) {
        currentAudio.play();
        document.querySelector('.control-buttons button:nth-child(2)').textContent = '⏸';
    } else {
        currentAudio.pause();
        document.querySelector('.control-buttons button:nth-child(2)').textContent = '▶';
    }
}

function updateProgress() {
    if (!currentAudio) return;
    
    const progressBar = document.querySelector('.progress-bar');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    
    const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
    progressBar.style.width = `${progress}%`;
    
    currentTimeEl.textContent = formatTime(currentAudio.currentTime);
    durationEl.textContent = formatTime(currentAudio.duration);
}

function playAudio(prayerId) {
    try {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        
        // Remove existing controls if any
        const existingControls = document.querySelector('.audio-controls');
        if (existingControls) {
            existingControls.remove();
        }

        fetch('prayers.json')
            .then(response => response.json())
            .then(data => {
                const prayer = data.prayers.find(p => p.id === prayerId);
                if (prayer && prayer.audioFile) {
                    currentPrayer = prayer;
                    currentAudio = new Audio(prayer.audioFile);
                    
                    // Add controls to the page
                    const controls = createAudioControls(prayer);
                    document.body.appendChild(controls);
                    
                    // Set up event listeners
                    currentAudio.addEventListener('timeupdate', updateProgress);
                    currentAudio.addEventListener('ended', () => {
                        document.querySelector('.control-buttons button:nth-child(2)').textContent = '▶';
                    });
                    
                    // Set up progress bar click handling
                    const progressBar = document.querySelector('.audio-progress');
                    progressBar.addEventListener('click', (e) => {
                        const rect = progressBar.getBoundingClientRect();
                        const percent = (e.clientX - rect.left) / rect.width;
                        currentAudio.currentTime = percent * currentAudio.duration;
                    });
                    
                    currentAudio.play()
                        .catch(error => {
                            console.error('Error playing audio:', error);
                            alert('ፋይሉን ማጫወት አልተቻለም። እባክዎ ዳግም ይሞክሩ።');
                        });
                }
            });
    } catch (error) {
        console.error('Error playing audio:', error);
        alert('ፋይሉን ማጫወት አልተቻለም። እባክዎ ዳግም ይሞክሩ።');
    }
}

// Generate quote HTML
function generateQuoteHTML(quote) {
    return `
        <div class="daily-quote">
            <div class="quote-text">${quote.text}</div>
            <div class="quote-reference">${quote.reference}</div>
            <div class="quote-languages">
                <div class="quote-geez">${quote.geezText}</div>
                <div class="quote-amharic">${quote.amharicText}</div>
            </div>
        </div>
    `;
}

// Initialize prayer page
async function initPrayerPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const prayerId = urlParams.get('id');
    
    if (!prayerId) return;
    
    try {
        const response = await fetch('prayers.json');
        const data = await response.json();
        const prayer = data.prayers.find(p => p.id === prayerId);
        
        if (prayer) {
            const content = `
                <div class="prayer-header">
                    <div class="prayer-info">
                        <h1>${prayer.title}</h1>
                        <p class="prayer-category">${prayer.category}</p>
                    </div>
                    <div class="prayer-actions">
                        <button class="like-btn" data-prayer-id="${prayer.id}">🤍</button>
                        <button class="play-btn" onclick="playAudio('${prayer.id}')">▶ ያዳምጡ</button>
                    </div>
                </div>
                <div class="prayer-text">
                    <div class="geez-text">
                        <h2>ግዕዝ</h2>
                        <p>${prayer.geezText}</p>
                    </div>
                    <div class="amharic-text">
                        <h2>አማርኛ</h2>
                        <p>${prayer.amharicText}</p>
                    </div>
                </div>`;
            
            document.querySelector('.prayer-content').innerHTML = content;
            initLikeButtons();
        }
    } catch (error) {
        console.error('Error loading prayer:', error);
    }
}

// Initialize home page
async function initHomePage() {
    const quotes = await loadQuotes();
    const dailyQuote = getDailyQuote(quotes);
    
    const mainContent = document.querySelector('.main-content');
    const featuredSection = mainContent.querySelector('.featured');
    
    const quoteHTML = generateQuoteHTML(dailyQuote);
    featuredSection.insertAdjacentHTML('beforebegin', quoteHTML);
}

// Add this function to initialize the liked prayers page
async function initLikedPage() {
    try {
        const response = await fetch('prayers.json');
        const data = await response.json();
        const likedPrayers = JSON.parse(localStorage.getItem('likedPrayers') || '[]');
        
        const likedPrayersContainer = document.getElementById('liked-prayers');
        
        if (likedPrayers.length === 0) {
            likedPrayersContainer.innerHTML = `
                <div class="no-results">
                    <h3>ምንም የተወደደ ፀሎት የለም</h3>
                    <p>ፀሎቶችን ለመውደድ በፀሎቱ ገጽ ላይ ያለውን ❤️ ይጫኑ</p>
                </div>
            `;
            return;
        }

        const likedPrayersContent = data.prayers
            .filter(prayer => likedPrayers.includes(prayer.id))
            .map(prayer => `
                <div class="prayer-card">
                    <div class="prayer-text">
                        <h3>${prayer.title}</h3>
                        <small class="prayer-category">${prayer.category}</small>
                    </div>
                    <div class="prayer-actions">
                        <button class="like-btn liked" data-prayer-id="${prayer.id}">❤️</button>
                        <a href="prayer.html?id=${prayer.id}" class="play-btn" onclick="navigateToPage(this.href); return false;">
                            ▶ ያዳምጡ
                        </a>
                    </div>
                </div>
            `).join('');

        likedPrayersContainer.innerHTML = likedPrayersContent;
        initLikeButtons();
    } catch (error) {
        console.error('Error loading liked prayers:', error);
    }
}

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('prayer.html')) {
        initPrayerPage();
    } else if (window.location.pathname.includes('liked.html')) {
        initLikedPage();
    } else {
        initHomePage();
    }
});

// Navigation history functions
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
        updateNavButtons();
    }
}

function goForward() {
    window.history.forward();
    updateNavButtons();
}

function updateNavButtons() {
    const backButton = document.querySelector('.nav-btn:first-child');
    const forwardButton = document.querySelector('.nav-btn:last-child');
    
    // Enable back button if there's history to go back to
    backButton.disabled = window.history.length <= 1;
    
    // Enable forward button if there's forward history
    forwardButton.disabled = !window.sessionStorage.getItem('hasForwardHistory');
}

// Track navigation
window.addEventListener('popstate', () => {
    updateNavButtons();
});

// When navigating to a new page
function navigateToPage(url) {
    // Store that we have forward history
    window.sessionStorage.setItem('hasForwardHistory', 'true');
    window.location.href = url;
}

// Update buttons when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateNavButtons();
});

// Search functionality
let searchTimeout;
let currentFilter = 'all';

async function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const prayers = await loadPrayers();
        const results = prayers.filter(prayer => {
            if (currentFilter !== 'all' && prayer.category !== currentFilter) {
                return false;
            }
            return prayer.title.toLowerCase().includes(searchTerm) ||
                   prayer.amharicText.toLowerCase().includes(searchTerm) ||
                   prayer.geezText.toLowerCase().includes(searchTerm);
        });
        displaySearchResults(results);
    }, 300);
}

function displaySearchResults(results) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <h3>ምንም ውጤት አልተገኘም</h3>
                <p>እባክዎ በተለየ መልኩ ይፈልጉ</p>
            </div>
        `;
        return;
    }

    resultsContainer.innerHTML = results.map(prayer => `
        <div class="result-card">
            <h3 class="result-title">${prayer.title}</h3>
            <p class="result-category">${prayer.category}</p>
            <p class="result-preview">${prayer.amharicText.substring(0, 100)}...</p>
            <a href="prayer.html?id=${prayer.id}" 
               class="play-btn" 
               onclick="navigateToPage(this.href); return false;">
               ▶ ያዳምጡ
            </a>
        </div>
    `).join('');
}

// Filter functionality
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            handleSearch();
        });
    });
});

// Add these functions for liking prayers
function initLikeButtons() {
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(btn => {
        const prayerId = btn.dataset.prayerId;
        const isLiked = getLikedStatus(prayerId);
        updateLikeButton(btn, isLiked);
        
        btn.addEventListener('click', () => toggleLike(prayerId, btn));
    });
}

function getLikedStatus(prayerId) {
    const likedPrayers = JSON.parse(localStorage.getItem('likedPrayers') || '[]');
    return likedPrayers.includes(prayerId);
}

function toggleLike(prayerId, button) {
    const likedPrayers = JSON.parse(localStorage.getItem('likedPrayers') || '[]');
    const isLiked = likedPrayers.includes(prayerId);
    
    if (isLiked) {
        const index = likedPrayers.indexOf(prayerId);
        likedPrayers.splice(index, 1);
    } else {
        likedPrayers.push(prayerId);
    }
    
    localStorage.setItem('likedPrayers', JSON.stringify(likedPrayers));
    updateLikeButton(button, !isLiked);
}

function updateLikeButton(button, isLiked) {
    if (isLiked) {
        button.classList.add('liked');
        button.innerHTML = '❤️';
    } else {
        button.classList.remove('liked');
        button.innerHTML = '🤍';
    }
}

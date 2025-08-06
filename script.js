// Simple FocusFlow App
let timer = {
    minutes: 25,
    seconds: 0,
    isRunning: false,
    interval: null
};

let stats = {
    focusTime: 0,
    breakCount: 0,
    streak: 0,
    sessions: 0
};

let breakReminder = {
    enabled: true,
    interval: 60, // minutes
    timer: null
};

// Start the app when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateDisplay();
    setupEventListeners();
    startBreakReminder();
});

// Setup all event listeners
function setupEventListeners() {
    // Timer buttons
    document.getElementById('start-btn').addEventListener('click', startTimer);
    document.getElementById('pause-btn').addEventListener('click', pauseTimer);
    document.getElementById('reset-btn').addEventListener('click', resetTimer);
    
    // Timer presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!timer.isRunning) {
                setTimerMinutes(parseInt(this.dataset.time));
                updatePresetButtons(this);
            }
        });
    });
    
    // Break settings
    document.getElementById('break-interval').addEventListener('change', function() {
        breakReminder.interval = parseInt(this.value);
        startBreakReminder();
        saveData();
    });
    
    document.getElementById('break-enabled').addEventListener('change', function() {
        breakReminder.enabled = this.checked;
        if (this.checked) {
            startBreakReminder();
        } else {
            stopBreakReminder();
        }
        saveData();
    });
    
    // Modal buttons
    document.getElementById('take-break').addEventListener('click', function() {
        hideModal('break-modal');
        startBreakTimer();
    });
    
    document.getElementById('skip-break').addEventListener('click', function() {
        hideModal('break-modal');
    });
    
    document.getElementById('close-success').addEventListener('click', function() {
        hideModal('success-modal');
    });
}

// Timer Functions
function startTimer() {
    if (!timer.isRunning) {
        timer.isRunning = true;
        timer.interval = setInterval(updateTimer, 1000);
        
        document.getElementById('start-btn').disabled = true;
        document.getElementById('pause-btn').disabled = false;
        document.querySelector('.timer-display').classList.add('running');
    }
}

function pauseTimer() {
    if (timer.isRunning) {
        timer.isRunning = false;
        clearInterval(timer.interval);
        
        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
        document.querySelector('.timer-display').classList.remove('running');
    }
}

function resetTimer() {
    pauseTimer();
    timer.seconds = 0;
    updateTimerDisplay();
}

function updateTimer() {
    if (timer.seconds === 0) {
        if (timer.minutes === 0) {
            timerComplete();
            return;
        }
        timer.minutes--;
        timer.seconds = 59;
    } else {
        timer.seconds--;
    }
    updateTimerDisplay();
}

function timerComplete() {
    pauseTimer();
    
    // Update stats
    const sessionMinutes = getActivePresetTime();
    stats.focusTime += sessionMinutes;
    stats.sessions++;
    
    updateStats();
    saveData();
    
    // Show success message
    showModal('success-modal');
    document.getElementById('success-message').textContent = 
        `You completed a ${sessionMinutes} minute focus session!`;
    
    // Reset timer to original time
    timer.minutes = getActivePresetTime();
    timer.seconds = 0;
    updateTimerDisplay();
}

function setTimerMinutes(minutes) {
    timer.minutes = minutes;
    timer.seconds = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    document.getElementById('minutes').textContent = 
        timer.minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = 
        timer.seconds.toString().padStart(2, '0');
}

function getActivePresetTime() {
    const activeBtn = document.querySelector('.preset-btn.active');
    return activeBtn ? parseInt(activeBtn.dataset.time) : 25;
}

function updatePresetButtons(activeBtn) {
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
}

// Break Functions
function startBreakReminder() {
    stopBreakReminder();
    
    if (!breakReminder.enabled) return;
    
    const intervalMs = breakReminder.interval * 60 * 1000;
    
    breakReminder.timer = setInterval(() => {
        if (!timer.isRunning) {
            showBreakModal();
        }
    }, intervalMs);
}

function stopBreakReminder() {
    if (breakReminder.timer) {
        clearInterval(breakReminder.timer);
        breakReminder.timer = null;
    }
}

function showBreakModal() {
    const messages = [
        "Take a moment to rest your eyes and stretch.",
        "Time for a short walk to refresh your mind.",
        "Drink some water and do light stretching.",
        "Look away from the screen and breathe deeply.",
        "Take a break to avoid eye strain and fatigue."
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    document.getElementById('break-message').textContent = randomMessage;
    showModal('break-modal');
}

function startBreakTimer() {
    stats.breakCount++;
    updateStats();
    saveData();
    
    // Set timer to 5 minutes for break
    setTimerMinutes(5);
    startTimer();
}

// Modal Functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Stats Functions
function updateStats() {
    document.getElementById('focus-time').textContent = `${stats.focusTime} min`;
    document.getElementById('break-count').textContent = stats.breakCount;
    document.getElementById('streak').textContent = stats.streak;
    
    // Update session progress (goal: 3 sessions per day)
    const sessionProgress = Math.min(stats.sessions, 3);
    document.getElementById('session-progress').textContent = `${sessionProgress} / 3`;
    document.getElementById('session-bar').style.width = `${(sessionProgress / 3) * 100}%`;
    
    // Check if daily goal is reached
    if (stats.sessions >= 3 && stats.streak === 0) {
        stats.streak = 1;
    }
}

function updateDisplay() {
    updateTimerDisplay();
    updateStats();
}

// Data Functions
function saveData() {
    const data = {
        stats: stats,
        breakReminder: breakReminder,
        lastSaved: new Date().toDateString()
    };
    localStorage.setItem('focusflow-simple', JSON.stringify(data));
}

function loadData() {
    try {
        const saved = localStorage.getItem('focusflow-simple');
        if (saved) {
            const data = JSON.parse(saved);
            
            // Check if it's a new day
            const today = new Date().toDateString();
            if (data.lastSaved !== today) {
                // Reset daily stats but keep streak if goals were met
                if (stats.sessions >= 3) {
                    stats.streak = (stats.streak || 0) + 1;
                } else if (stats.sessions > 0) {
                    stats.streak = 0;
                }
                stats.focusTime = 0;
                stats.breakCount = 0;
                stats.sessions = 0;
            } else {
                // Load saved stats
                stats = { ...stats, ...data.stats };
            }
            
            // Load break settings
            breakReminder = { ...breakReminder, ...data.breakReminder };
            
            // Update UI
            document.getElementById('break-interval').value = breakReminder.interval;
            document.getElementById('break-enabled').checked = breakReminder.enabled;
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// Save data when leaving page
window.addEventListener('beforeunload', saveData);

// Show simple notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--secondary);
        color: white;
        padding: 1rem;
        border-radius: 10px;
        z-index: 2000;
        box-shadow: var(--shadow);
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 3000);
}

// Auto-save every minute
setInterval(saveData, 60000);
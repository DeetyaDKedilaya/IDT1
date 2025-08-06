// FocusFlow Digital Detox App JavaScript

// Global state management
const AppState = {
    timer: {
        minutes: 25,
        seconds: 0,
        isRunning: false,
        interval: null,
        mode: 'focus',
        originalMinutes: 25
    },
    breaks: {
        interval: 60, // minutes
        notifications: true,
        lastBreakTime: Date.now(),
        breakTimer: null,
        isBreakActive: false
    },
    stats: {
        totalFocusTime: 0,
        streak: 0,
        goalsCompleted: 0,
        dailyUsage: {
            hours: 4,
            minutes: 35
        },
        weeklyData: [3.5, 4.2, 2.8, 5.1, 3.9, 6.2, 4.5]
    },
    goals: [
        {
            id: 'screen-time-limit',
            type: 'screen-time',
            target: 6,
            current: 4.58,
            timeframe: 'daily',
            name: 'Daily Screen Time Limit'
        },
        {
            id: 'focus-sessions',
            type: 'focus-sessions',
            target: 5,
            current: 3,
            timeframe: 'weekly',
            name: 'Focus Sessions'
        },
        {
            id: 'mindful-breaks',
            type: 'breaks',
            target: 10,
            current: 8,
            timeframe: 'weekly',
            name: 'Mindful Breaks'
        }
    ],
    achievements: [
        { id: 'first-focus', name: 'First Focus', description: 'Complete your first focus session', earned: true },
        { id: 'streak-3', name: '3-Day Streak', description: 'Maintain goals for 3 consecutive days', earned: true },
        { id: 'week-warrior', name: 'Week Warrior', description: 'Complete all weekly goals', earned: false },
        { id: 'digital-minimalist', name: 'Digital Minimalist', description: 'Stay under screen time goal for 7 days', earned: false }
    ]
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadStoredData();
    updateAllDisplays();
    setupEventListeners();
    startBreakReminders();
});

// Initialize app
function initializeApp() {
    console.log('FocusFlow initialized successfully!');
    
    // Initialize charts
    initializeUsageChart();
    initializeWeeklyChart();
    
    // Load saved state from localStorage
    const savedState = localStorage.getItem('focusflow-state');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        Object.assign(AppState, parsed);
    }
}

// Load stored data
function loadStoredData() {
    try {
        const stored = localStorage.getItem('focusflow-data');
        if (stored) {
            const data = JSON.parse(stored);
            AppState.stats = { ...AppState.stats, ...data.stats };
            AppState.goals = data.goals || AppState.goals;
            AppState.achievements = data.achievements || AppState.achievements;
        }
    } catch (error) {
        console.error('Error loading stored data:', error);
    }
}

// Save data to localStorage
function saveData() {
    try {
        const dataToSave = {
            stats: AppState.stats,
            goals: AppState.goals,
            achievements: AppState.achievements,
            lastSaved: Date.now()
        };
        localStorage.setItem('focusflow-data', JSON.stringify(dataToSave));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    setupNavigation();
    
    // Timer controls
    setupTimerControls();
    
    // Timer presets
    setupTimerPresets();
    
    // Focus modes
    setupFocusModes();
    
    // Break settings
    setupBreakSettings();
    
    // Goal creation
    setupGoalCreation();
    
    // Modal controls
    setupModalControls();
    
    // Responsive navigation
    setupResponsiveNav();
}

// Navigation setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            scrollToSection(target.replace('#', ''));
        });
    });
    
    // CTA button
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => scrollToSection('focus-mode'));
    }
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Timer controls setup
function setupTimerControls() {
    const startBtn = document.getElementById('timer-start');
    const pauseBtn = document.getElementById('timer-pause');
    const resetBtn = document.getElementById('timer-reset');
    
    startBtn?.addEventListener('click', startTimer);
    pauseBtn?.addEventListener('click', pauseTimer);
    resetBtn?.addEventListener('click', resetTimer);
}

// Timer functions
function startTimer() {
    if (!AppState.timer.isRunning) {
        AppState.timer.isRunning = true;
        AppState.timer.interval = setInterval(updateTimer, 1000);
        
        // Update UI
        document.getElementById('timer-start').disabled = true;
        document.getElementById('timer-pause').disabled = false;
        
        // Add visual indication
        document.querySelector('.timer-display').style.color = '#7ED321';
    }
}

function pauseTimer() {
    if (AppState.timer.isRunning) {
        AppState.timer.isRunning = false;
        clearInterval(AppState.timer.interval);
        
        // Update UI
        document.getElementById('timer-start').disabled = false;
        document.getElementById('timer-pause').disabled = true;
        
        // Reset color
        document.querySelector('.timer-display').style.color = '#4A90E2';
    }
}

function resetTimer() {
    pauseTimer();
    AppState.timer.minutes = AppState.timer.originalMinutes;
    AppState.timer.seconds = 0;
    updateTimerDisplay();
}

function updateTimer() {
    if (AppState.timer.seconds === 0) {
        if (AppState.timer.minutes === 0) {
            // Timer finished
            timerComplete();
            return;
        }
        AppState.timer.minutes--;
        AppState.timer.seconds = 59;
    } else {
        AppState.timer.seconds--;
    }
    
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutesEl = document.getElementById('timer-minutes');
    const secondsEl = document.getElementById('timer-seconds');
    
    if (minutesEl && secondsEl) {
        minutesEl.textContent = AppState.timer.minutes.toString().padStart(2, '0');
        secondsEl.textContent = AppState.timer.seconds.toString().padStart(2, '0');
    }
}

function timerComplete() {
    pauseTimer();
    
    // Update stats
    const sessionTime = AppState.timer.originalMinutes;
    AppState.stats.totalFocusTime += sessionTime;
    
    // Check for achievements
    checkAchievements();
    
    // Update displays
    updateAllDisplays();
    
    // Save data
    saveData();
    
    // Show completion notification
    showNotification('🎉 Focus session complete!', 'Great job! Time for a well-deserved break.');
    
    // Suggest break if it's a focus session
    if (AppState.timer.mode === 'focus') {
        setTimeout(() => {
            showBreakModal();
        }, 2000);
    }
}

// Timer presets setup
function setupTimerPresets() {
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const minutes = parseInt(this.dataset.minutes);
            setTimerPreset(minutes);
            
            // Update active state
            presetBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function setTimerPreset(minutes) {
    if (!AppState.timer.isRunning) {
        AppState.timer.minutes = minutes;
        AppState.timer.seconds = 0;
        AppState.timer.originalMinutes = minutes;
        updateTimerDisplay();
    }
}

// Focus modes setup
function setupFocusModes() {
    const modeCards = document.querySelectorAll('.mode-card');
    modeCards.forEach(card => {
        card.addEventListener('click', function() {
            const mode = this.dataset.mode;
            setFocusMode(mode);
            
            // Update active state
            modeCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function setFocusMode(mode) {
    AppState.timer.mode = mode;
    
    // Set appropriate timer based on mode
    let minutes;
    switch (mode) {
        case 'focus':
            minutes = 25;
            break;
        case 'break':
            minutes = 5;
            break;
        case 'long-break':
            minutes = 15;
            break;
        default:
            minutes = 25;
    }
    
    if (!AppState.timer.isRunning) {
        setTimerPreset(minutes);
        
        // Update preset buttons
        const presetBtns = document.querySelectorAll('.preset-btn');
        presetBtns.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.minutes) === minutes);
        });
    }
}

// Break settings setup
function setupBreakSettings() {
    // Interval buttons
    const intervalBtns = document.querySelectorAll('.interval-btn');
    intervalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const interval = parseInt(this.dataset.interval);
            AppState.breaks.interval = interval;
            
            intervalBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Restart break reminders with new interval
            startBreakReminders();
            saveData();
        });
    });
    
    // Notification toggle
    const notificationToggle = document.getElementById('break-notifications');
    notificationToggle?.addEventListener('change', function() {
        AppState.breaks.notifications = this.checked;
        saveData();
        
        if (this.checked) {
            startBreakReminders();
        } else {
            stopBreakReminders();
        }
    });
    
    // Activity checkboxes
    const activityOptions = document.querySelectorAll('.activity-option input[type="checkbox"]');
    activityOptions.forEach(checkbox => {
        checkbox.addEventListener('change', saveData);
    });
}

// Break reminder system
function startBreakReminders() {
    stopBreakReminders(); // Clear any existing reminders
    
    if (!AppState.breaks.notifications) return;
    
    const intervalMs = AppState.breaks.interval * 60 * 1000; // Convert to milliseconds
    
    AppState.breaks.breakTimer = setInterval(() => {
        if (!AppState.timer.isRunning && !AppState.breaks.isBreakActive) {
            showBreakModal();
        }
    }, intervalMs);
}

function stopBreakReminders() {
    if (AppState.breaks.breakTimer) {
        clearInterval(AppState.breaks.breakTimer);
        AppState.breaks.breakTimer = null;
    }
}

// Modal controls setup
function setupModalControls() {
    const modal = document.getElementById('break-modal');
    const closeBtn = document.querySelector('.close-modal');
    const startBreakBtn = document.getElementById('start-break');
    const skipBreakBtn = document.getElementById('skip-break');
    const snoozeBreakBtn = document.getElementById('snooze-break');
    
    closeBtn?.addEventListener('click', hideBreakModal);
    skipBreakBtn?.addEventListener('click', hideBreakModal);
    startBreakBtn?.addEventListener('click', startBreak);
    snoozeBreakBtn?.addEventListener('click', snoozeBreak);
    
    // Close modal when clicking outside
    modal?.addEventListener('click', function(e) {
        if (e.target === this) {
            hideBreakModal();
        }
    });
}

function showBreakModal() {
    const modal = document.getElementById('break-modal');
    const suggestion = document.getElementById('break-suggestion');
    
    // Random break suggestion
    const suggestions = [
        'Take a 5-minute walk while focusing on your breathing',
        'Do some gentle stretches to relax your muscles',
        'Drink a glass of water and step away from screens',
        'Practice the 20-20-20 rule: look at something 20 feet away for 20 seconds',
        'Take deep breaths and clear your mind'
    ];
    
    if (suggestion) {
        suggestion.textContent = suggestions[Math.floor(Math.random() * suggestions.length)];
    }
    
    modal.style.display = 'block';
    AppState.breaks.isBreakActive = true;
}

function hideBreakModal() {
    const modal = document.getElementById('break-modal');
    modal.style.display = 'none';
    AppState.breaks.isBreakActive = false;
}

function startBreak() {
    hideBreakModal();
    
    // Set break mode and start timer
    setFocusMode('break');
    
    // Update break stats
    const currentGoal = AppState.goals.find(g => g.type === 'breaks');
    if (currentGoal && currentGoal.current < currentGoal.target) {
        currentGoal.current++;
        updateGoalProgress();
        saveData();
    }
    
    showNotification('🌿 Break time!', 'Take this time to recharge and relax.');
}

function snoozeBreak() {
    hideBreakModal();
    
    // Restart break reminder in 5 minutes
    setTimeout(() => {
        if (!AppState.timer.isRunning && !AppState.breaks.isBreakActive) {
            showBreakModal();
        }
    }, 5 * 60 * 1000); // 5 minutes
}

// Goal creation setup
function setupGoalCreation() {
    const goalForm = document.getElementById('goal-form');
    goalForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        createNewGoal();
    });
}

function createNewGoal() {
    const type = document.getElementById('goal-type').value;
    const target = parseInt(document.getElementById('goal-target').value);
    const timeframe = document.getElementById('goal-timeframe').value;
    
    if (!target || target <= 0) {
        showNotification('⚠️ Invalid target', 'Please enter a valid target value.');
        return;
    }
    
    const newGoal = {
        id: `custom-${Date.now()}`,
        type: type,
        target: target,
        current: 0,
        timeframe: timeframe,
        name: getGoalName(type, target, timeframe)
    };
    
    AppState.goals.push(newGoal);
    updateGoalProgress();
    saveData();
    
    // Reset form
    document.getElementById('goal-form').reset();
    
    showNotification('🎯 Goal created!', 'Your new goal has been added to your dashboard.');
}

function getGoalName(type, target, timeframe) {
    const typeNames = {
        'screen-time': `${target}h Screen Time Limit`,
        'focus-sessions': `${target} Focus Sessions`,
        'breaks': `${target} Mindful Breaks`,
        'app-limit': `${target}h App Usage Limit`
    };
    
    return `${timeframes[timeframe]} ${typeNames[type]}`;
}

const timeframes = {
    daily: 'Daily',
    weekly: 'Weekly', 
    monthly: 'Monthly'
};

// Responsive navigation setup
function setupResponsiveNav() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger?.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        
        // Animate hamburger
        this.classList.toggle('active');
    });
    
    // Close mobile menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// Update all displays
function updateAllDisplays() {
    updateHeroStats();
    updateGoalProgress();
    updateAchievements();
    updateTimerDisplay();
    updateScreenTimeTracker();
}

// Update hero stats
function updateHeroStats() {
    const totalFocusTimeEl = document.getElementById('total-focus-time');
    const streakCounterEl = document.getElementById('streak-counter');
    const goalsCompletedEl = document.getElementById('goals-completed');
    
    if (totalFocusTimeEl) {
        const hours = Math.floor(AppState.stats.totalFocusTime / 60);
        const minutes = AppState.stats.totalFocusTime % 60;
        totalFocusTimeEl.textContent = `${hours}h ${minutes}m`;
    }
    
    if (streakCounterEl) {
        streakCounterEl.textContent = AppState.stats.streak;
    }
    
    if (goalsCompletedEl) {
        goalsCompletedEl.textContent = AppState.stats.goalsCompleted;
    }
}

// Update goal progress
function updateGoalProgress() {
    const goalCards = document.querySelectorAll('.goal-card');
    
    AppState.goals.forEach((goal, index) => {
        if (goalCards[index]) {
            const card = goalCards[index];
            const progressSpan = card.querySelector('.goal-progress');
            const progressFill = card.querySelector('.progress-fill');
            const titleEl = card.querySelector('h4');
            const descEl = card.querySelector('p');
            
            const percentage = Math.min(100, (goal.current / goal.target) * 100);
            
            if (progressSpan) {
                if (goal.type === 'focus-sessions' || goal.type === 'breaks') {
                    progressSpan.textContent = `${goal.current}/${goal.target}`;
                } else {
                    progressSpan.textContent = `${Math.round(percentage)}%`;
                }
            }
            
            if (progressFill) {
                progressFill.style.width = `${percentage}%`;
            }
            
            if (titleEl) {
                titleEl.textContent = goal.name;
            }
            
            if (descEl) {
                descEl.textContent = getGoalDescription(goal);
            }
        }
    });
}

function getGoalDescription(goal) {
    const descriptions = {
        'screen-time': `Stay under ${goal.target} hours ${goal.timeframe}`,
        'focus-sessions': `Complete ${goal.target} focus sessions this ${goal.timeframe.replace('ly', '')}`,
        'breaks': `Take ${goal.target} mindful breaks this ${goal.timeframe.replace('ly', '')}`,
        'app-limit': `Limit app usage to ${goal.target} hours ${goal.timeframe}`
    };
    
    return descriptions[goal.type] || `Achieve ${goal.target} ${goal.timeframe}`;
}

// Update achievements
function updateAchievements() {
    const achievementCards = document.querySelectorAll('.achievement-card');
    
    AppState.achievements.forEach((achievement, index) => {
        if (achievementCards[index]) {
            const card = achievementCards[index];
            if (achievement.earned) {
                card.classList.add('earned');
            } else {
                card.classList.remove('earned');
            }
        }
    });
}

// Check achievements
function checkAchievements() {
    let newAchievements = [];
    
    // First Focus achievement
    if (!AppState.achievements.find(a => a.id === 'first-focus')?.earned && AppState.stats.totalFocusTime > 0) {
        const achievement = AppState.achievements.find(a => a.id === 'first-focus');
        if (achievement) {
            achievement.earned = true;
            newAchievements.push(achievement);
        }
    }
    
    // 3-Day Streak achievement
    if (!AppState.achievements.find(a => a.id === 'streak-3')?.earned && AppState.stats.streak >= 3) {
        const achievement = AppState.achievements.find(a => a.id === 'streak-3');
        if (achievement) {
            achievement.earned = true;
            newAchievements.push(achievement);
        }
    }
    
    // Show notifications for new achievements
    newAchievements.forEach(achievement => {
        showNotification('🏆 Achievement Unlocked!', achievement.name);
        AppState.stats.goalsCompleted++;
    });
    
    if (newAchievements.length > 0) {
        updateAchievements();
        saveData();
    }
}

// Update screen time tracker
function updateScreenTimeTracker() {
    const todayHoursEl = document.getElementById('today-hours');
    const todayMinutesEl = document.getElementById('today-minutes');
    
    if (todayHoursEl && todayMinutesEl) {
        todayHoursEl.textContent = `${AppState.stats.dailyUsage.hours}h`;
        todayMinutesEl.textContent = `${AppState.stats.dailyUsage.minutes}m`;
    }
}

// Initialize charts
function initializeUsageChart() {
    const canvas = document.getElementById('usage-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate usage percentage (assuming 8 hours is 100%)
    const totalMinutes = AppState.stats.dailyUsage.hours * 60 + AppState.stats.dailyUsage.minutes;
    const maxMinutes = 8 * 60; // 8 hours
    const percentage = Math.min(100, (totalMinutes / maxMinutes) * 100);
    const angle = (percentage / 100) * 2 * Math.PI;
    
    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#E9ECEF';
    ctx.lineWidth = 12;
    ctx.stroke();
    
    // Progress arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + angle);
    ctx.strokeStyle = percentage > 75 ? '#E74C3C' : percentage > 50 ? '#F5A623' : '#7ED321';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.stroke();
}

function initializeWeeklyChart() {
    const canvas = document.getElementById('weekly-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    const data = AppState.stats.weeklyData;
    const maxValue = Math.max(...data);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Draw bars
    const barWidth = chartWidth / data.length;
    data.forEach((value, index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding + index * barWidth + barWidth * 0.2;
        const y = height - padding - barHeight;
        const width = barWidth * 0.6;
        
        // Bar
        ctx.fillStyle = '#4A90E2';
        ctx.fillRect(x, y, width, barHeight);
        
        // Day label
        ctx.fillStyle = '#7F8C8D';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(days[index], x + width / 2, height - padding + 20);
        
        // Value label
        ctx.fillStyle = '#2C3E50';
        ctx.fillText(`${value}h`, x + width / 2, y - 5);
    });
}

// Notification system
function showNotification(title, message) {
    // Check if browser supports notifications
    if ('Notification' in window) {
        // Request permission if not granted
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    createNotification(title, message);
                }
            });
        } else if (Notification.permission === 'granted') {
            createNotification(title, message);
        }
    }
    
    // Fallback: show in-app notification
    showInAppNotification(title, message);
}

function createNotification(title, message) {
    new Notification(title, {
        body: message,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%237ED321"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234A90E2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>'
    });
}

function showInAppNotification(title, message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'in-app-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 5px 30px rgba(0,0,0,0.15);
        padding: 1rem;
        max-width: 300px;
        z-index: 9999;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        border-left: 4px solid #7ED321;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Auto-save data every 30 seconds
setInterval(saveData, 30000);

// Update charts every 5 seconds
setInterval(() => {
    initializeUsageChart();
    initializeWeeklyChart();
}, 5000);

// Window events
window.addEventListener('beforeunload', saveData);

// Handle visibility change (when user switches tabs)
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        // User returned to tab
        updateAllDisplays();
    }
});

// Utility functions
function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
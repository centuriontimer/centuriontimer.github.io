// Initialize variables
let counter = 0;
const maxCount = 100;
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('resetButton');
const counterDisplay = document.getElementById('counter');
const counterFill = document.getElementById('counterFill');
const timerDisplay = document.getElementById('timer');
const timerProgress = document.querySelector('.timer-progress');
const resetAudio = document.getElementById('resetAudio');
const timerRadius = 80;
const timerCircumference = 2 * Math.PI * timerRadius;
const intervalLength = 60;

// Mapping of specific counter values to their corresponding audio elements
const specialAlerts = {
    50: document.getElementById('ge'),
    80: document.getElementById('whats-up'),
    // Add more mappings as needed, e.g.,
    // 90: document.getElementById('alertAudio90'),
};

// Timer state variables
let timerInterval = null;
let totalDuration = 0;
let remainingTime = 0;
let isPaused = false;
let isInitialTimer = true;

// Setup the circular timer
timerProgress.style.strokeDasharray = timerCircumference;
timerProgress.style.strokeDashoffset = 0;

// Function to play the reset audio (only for automatic resets)
function playResetAudio() {
    resetAudio.currentTime = 0; // Reset to start
    resetAudio.play().catch((error) => {
        console.error('Error playing audio:', error);
    });
}

// Function to update the counter display and fill bar
function updateCounter() {
    counterDisplay.textContent = counter;
    const fillPercentage = (counter / maxCount) * 100;
    counterFill.style.width = `${fillPercentage}%`;
}

// Function to update the timer display
function updateTimerDisplay(seconds) {
    timerDisplay.textContent = seconds > 0 ? seconds : '-';
}

// Function to start the circular timer
function startCircularTimer(duration, callback) {
    totalDuration = duration;
    remainingTime = duration;
    updateTimerDisplay(remainingTime);
    updateStrokeDashoffset();

    timerInterval = setInterval(() => {
        if (!isPaused) {
            remainingTime--;

            // Update the timer display
            updateTimerDisplay(remainingTime);

            // Update the stroke dash offset
            updateStrokeDashoffset();

            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                callback();
            }
        }
    }, 1000);
}

// Function to update the stroke dash offset for counter-clockwise unfill
function updateStrokeDashoffset() {
    const elapsed = totalDuration - remainingTime + 1;
    const progressOffset = (elapsed / totalDuration) * timerCircumference;
    timerProgress.style.strokeDashoffset = progressOffset;
}

// Function to handle the process flow
function processFlow(initialDuration, subsequentDuration) {
    startCircularTimer(initialDuration, () => {
        incrementCounter(() => {
            // After initial timer and first increment, start 60-second timers
            repeatSubsequentTimers(subsequentDuration);
        });
    });
}

// Function to increment the counter and check for stop condition
function incrementCounter(callback) {
    counter++;
    updateCounter();

    // Check if the current counter value has a special audio alert
    if (specialAlerts[counter]) {
        specialAlerts[counter].play().catch((error) => {
            console.error(`Error playing audio for counter ${counter}:`, error);
        });
    } else {
        playResetAudio(); // Play default audio for other resets
    }

    // Disable transition temporarily to snap the timer to fully green
    timerProgress.style.transition = 'none';
    timerProgress.style.strokeDashoffset = 0;

    // Re-enable transition after a short delay to allow for future animations
    setTimeout(() => {
        timerProgress.style.transition = 'stroke-dashoffset 1s linear';
    }, 0);

    if (counter >= maxCount) {
        timerDisplay.textContent = '-';
        timerProgress.style.strokeDashoffset = timerCircumference; // Fully unfilled
        alert('Counter has reached 100. Process stopped.');
        resetProcess();
    } else {
        callback();
    }
}

// Function to repeatedly start subsequent timers
function repeatSubsequentTimers(duration) {
    if (counter >= maxCount) return;

    startCircularTimer(duration, () => {
        incrementCounter(() => {
            repeatSubsequentTimers(duration);
        });
    });
}

// Function to start or resume the process
function startProcess() {
    if (isInitialTimer) {
        // Initial Start
        isInitialTimer = false;
        counter = 0; // Reset counter
        updateCounter();
        processFlow(10, intervalLength); // Start with 10 seconds, then 60 seconds
    } else {
        // Resume from pause
        if (remainingTime > 0 && timerInterval === null) {
            startCircularTimer(remainingTime, () => {
                incrementCounter(() => {
                    repeatSubsequentTimers(intervalLength);
                });
            });
        }
    }

    // Update button states
    startButton.disabled = true;
    pauseButton.disabled = false;
    resetButton.disabled = false;
    pauseButton.textContent = 'Pause';
}

// Function to pause the process
function pauseProcess() {
    if (!isPaused) {
        isPaused = true;
        pauseButton.textContent = 'Resume';
    } else {
        isPaused = false;
        pauseButton.textContent = 'Pause';
    }
}

// Function to reset the process
function resetProcess() {
    // Clear any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Reset counter and display
    counter = 0;
    updateCounter();

    // Reset timer display
    updateTimerDisplay(0);

    // Reset the circular timer to fully green instantly
    timerProgress.style.transition = 'none';
    timerProgress.style.strokeDashoffset = 0;
    setTimeout(() => {
        timerProgress.style.transition = 'stroke-dashoffset 1s linear';
    }, 0);

    // Reset button states
    startButton.disabled = false;
    pauseButton.disabled = true;
    pauseButton.textContent = 'Pause';
    resetButton.disabled = true;

    // Reset timer variables
    isPaused = false;
    isInitialTimer = true;
}

// Event listener for the start button
startButton.addEventListener('click', startProcess);

// Event listener for the pause button
pauseButton.addEventListener('click', pauseProcess);

// Event listener for the reset button
resetButton.addEventListener('click', resetProcess);

// Initialize display
updateCounter();
updateTimerDisplay(0);

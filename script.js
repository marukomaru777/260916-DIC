// State management
const state = {
  name: localStorage.getItem('personal_web_name') || 'Wei Yu-Chieh',
  is24Hour: localStorage.getItem('clock_24h_format') !== 'false', // default true
  theme: localStorage.getItem('personal_theme') || 'violet',
};

// DOM Elements
const userNameEl = document.getElementById('user-name');
const avatarInitialsEl = document.getElementById('avatar-initials');
const navInitialsEl = document.getElementById('nav-initials');
const timeGreetingEl = document.getElementById('time-greeting');
const greetingIconContainer = document.getElementById('greeting-icon-container');

const clockHoursEl = document.getElementById('clock-hours');
const clockMinutesEl = document.getElementById('clock-minutes');
const clockSecondsEl = document.getElementById('clock-seconds');
const clockAmpmEl = document.getElementById('clock-ampm');
const formatToggleBtn = document.getElementById('format-toggle');
const formatBadgeEl = document.getElementById('format-badge');

const secondProgressBar = document.getElementById('second-progress-bar');
const secondProgressText = document.getElementById('second-progress-text');

const localTimezoneBadge = document.getElementById('local-timezone-badge');
const offsetBadge = document.getElementById('offset-badge');

const widgetWeekday = document.getElementById('widget-weekday');
const widgetFulldate = document.getElementById('widget-fulldate');
const widgetWeeknum = document.getElementById('widget-weeknum');
const widgetEpoch = document.getElementById('widget-epoch');
const widgetDayofyear = document.getElementById('widget-dayofyear');
const widgetPeriodIcon = document.getElementById('widget-period-icon');
const widgetPeriodName = document.getElementById('widget-period-name');
const widgetPeriodQuote = document.getElementById('widget-period-quote');

// Modal Elements
const editNameBtn = document.getElementById('edit-name-btn');
const nameModal = document.getElementById('name-modal');
const nameInput = document.getElementById('name-input');
const cancelNameBtn = document.getElementById('cancel-name-btn');
const saveNameBtn = document.getElementById('save-name-btn');

// Copy & Toast Elements
const copyTimeBtn = document.getElementById('copy-time-btn');
const toastEl = document.getElementById('toast');
const toastMessageEl = document.getElementById('toast-message');

// Fullscreen Element
const fullscreenToggle = document.getElementById('fullscreen-toggle');

// Theme Elements
const themeBtn = document.getElementById('theme-btn');
const themeDropdown = document.getElementById('theme-dropdown');
const themeOpts = document.querySelectorAll('.theme-opt');
const orb1 = document.getElementById('orb-1');
const orb2 = document.getElementById('orb-2');
const orb3 = document.getElementById('orb-3');

// Resolution footer
const resolutionEl = document.getElementById('client-resolution');

// Helper: derive initials from name
function getInitials(name) {
  if (!name) return 'WY';
  const parts = name.trim().split(/[\s-]+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Update Name and Initials in UI
function renderName() {
  userNameEl.textContent = state.name;
  const initials = getInitials(state.name);
  avatarInitialsEl.textContent = initials;
  navInitialsEl.textContent = initials;
  document.title = `${state.name} | Personal Dashboard & Live Clock`;
}

// Format Offset string e.g. UTC +08:00
function getFormattedOffset(date) {
  const offsetMin = -date.getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const hours = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, '0');
  const minutes = String(Math.abs(offsetMin) % 60).padStart(2, '0');
  return `UTC ${sign}${hours}:${minutes}`;
}

// Calculate Day of Year
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// Calculate ISO Week Number
function getWeekNumber(date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target) / 604800000);
}

// Period / Solar Greetings configuration
function updateGreetingAndPeriod(now) {
  const hours = now.getHours();
  let greeting = 'Hello';
  let periodName = 'Active Phase';
  let periodQuote = '"Every second is an opportunity to build."';
  let periodIcon = 'sun';
  let greetingIcon = 'sparkles';

  if (hours >= 5 && hours < 12) {
    greeting = 'Good morning';
    periodName = 'Morning Focus';
    periodQuote = '"Start clear, build fast, keep learning."';
    periodIcon = 'sunrise';
    greetingIcon = 'coffee';
  } else if (hours >= 12 && hours < 18) {
    greeting = 'Good afternoon';
    periodName = 'Afternoon Flow';
    periodQuote = '"Deep work produces exceptional outcomes."';
    periodIcon = 'sun';
    greetingIcon = 'sun';
  } else if (hours >= 18 && hours < 22) {
    greeting = 'Good evening';
    periodName = 'Evening Reflection';
    periodQuote = '"Reviewing progress, refining architectures."';
    periodIcon = 'sunset';
    greetingIcon = 'sparkles';
  } else {
    greeting = 'Good night';
    periodName = 'Night Focus';
    periodQuote = '"The quiet hours spark the best code."';
    periodIcon = 'moon';
    greetingIcon = 'moon';
  }

  timeGreetingEl.textContent = greeting;
  widgetPeriodName.textContent = periodName;
  widgetPeriodQuote.textContent = periodQuote;
  
  // Update icons if changed
  widgetPeriodIcon.innerHTML = `<i data-lucide="${periodIcon}" class="w-4 h-4"></i>`;
  greetingIconContainer.innerHTML = `<i data-lucide="${greetingIcon}" class="w-4 h-4"></i>`;
}

// Clock tick function
function updateClock() {
  const now = new Date();

  // Time components
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // 12h vs 24h format handling
  if (state.is24Hour) {
    clockAmpmEl.classList.add('hidden');
    clockHoursEl.textContent = String(hours).padStart(2, '0');
    formatBadgeEl.textContent = '24H';
  } else {
    clockAmpmEl.classList.remove('hidden');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    clockAmpmEl.textContent = ampm;
    hours = hours % 12 || 12;
    clockHoursEl.textContent = String(hours).padStart(2, '0');
    formatBadgeEl.textContent = '12H';
  }

  clockMinutesEl.textContent = String(minutes).padStart(2, '0');
  clockSecondsEl.textContent = String(seconds).padStart(2, '0');

  // Minute Progress Bar
  const percent = Math.round((seconds / 60) * 100);
  secondProgressBar.style.width = `${percent}%`;
  secondProgressText.textContent = `${seconds}s / 60s`;

  // Secondary widget data
  widgetWeekday.textContent = now.toLocaleDateString(undefined, { weekday: 'long' });
  widgetFulldate.textContent = now.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  widgetWeeknum.textContent = `W${getWeekNumber(now)}`;
  widgetEpoch.textContent = Math.floor(now.getTime() / 1000);
  widgetDayofyear.textContent = `Day ${getDayOfYear(now)}`;

  // Update greeting every minute or when hours change
  updateGreetingAndPeriod(now);

  // Timezone display
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Taipei';
    localTimezoneBadge.textContent = tz;
  } catch (e) {
    localTimezoneBadge.textContent = 'Local Time';
  }
  offsetBadge.textContent = getFormattedOffset(now);
}

// Apply Theme
function applyTheme(themeName) {
  state.theme = themeName;
  localStorage.setItem('personal_theme', themeName);

  if (themeName === 'violet') {
    orb1.className = 'absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl animate-float';
    orb2.className = 'absolute top-1/3 -right-24 w-[28rem] h-[28rem] bg-violet-600/20 rounded-full blur-3xl animate-float-reverse';
    orb3.className = 'absolute -bottom-24 left-1/4 w-[32rem] h-[32rem] bg-purple-600/15 rounded-full blur-3xl animate-pulse-slow';
  } else if (themeName === 'cyan') {
    orb1.className = 'absolute -top-32 -left-32 w-96 h-96 bg-cyan-600/25 rounded-full blur-3xl animate-float';
    orb2.className = 'absolute top-1/3 -right-24 w-[28rem] h-[28rem] bg-blue-600/20 rounded-full blur-3xl animate-float-reverse';
    orb3.className = 'absolute -bottom-24 left-1/4 w-[32rem] h-[32rem] bg-teal-600/15 rounded-full blur-3xl animate-pulse-slow';
  } else if (themeName === 'emerald') {
    orb1.className = 'absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/25 rounded-full blur-3xl animate-float';
    orb2.className = 'absolute top-1/3 -right-24 w-[28rem] h-[28rem] bg-teal-600/20 rounded-full blur-3xl animate-float-reverse';
    orb3.className = 'absolute -bottom-24 left-1/4 w-[32rem] h-[32rem] bg-green-600/15 rounded-full blur-3xl animate-pulse-slow';
  } else if (themeName === 'amber') {
    orb1.className = 'absolute -top-32 -left-32 w-96 h-96 bg-amber-600/25 rounded-full blur-3xl animate-float';
    orb2.className = 'absolute top-1/3 -right-24 w-[28rem] h-[28rem] bg-orange-600/20 rounded-full blur-3xl animate-float-reverse';
    orb3.className = 'absolute -bottom-24 left-1/4 w-[32rem] h-[32rem] bg-rose-600/15 rounded-full blur-3xl animate-pulse-slow';
  }
}

// Show Toast Message
let toastTimeout = null;
function showToast(message) {
  toastMessageEl.textContent = message;
  toastEl.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
  toastEl.classList.add('opacity-100', 'translate-y-0');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove('opacity-100', 'translate-y-0');
    toastEl.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
  }, 2500);
}

// Event Listeners

// 12h/24h toggle
formatToggleBtn.addEventListener('click', () => {
  state.is24Hour = !state.is24Hour;
  localStorage.setItem('clock_24h_format', state.is24Hour);
  updateClock();
  showToast(`Switched to ${state.is24Hour ? '24-Hour' : '12-Hour'} format`);
});

// Name Modal opening & closing
editNameBtn.addEventListener('click', () => {
  nameInput.value = state.name;
  nameModal.classList.remove('hidden');
  setTimeout(() => nameInput.focus(), 50);
});

cancelNameBtn.addEventListener('click', () => {
  nameModal.classList.add('hidden');
});

nameModal.addEventListener('click', (e) => {
  if (e.target === nameModal) {
    nameModal.classList.add('hidden');
  }
});

function saveNewName() {
  const newName = nameInput.value.trim();
  if (newName) {
    state.name = newName;
    localStorage.setItem('personal_web_name', newName);
    renderName();
    nameModal.classList.add('hidden');
    showToast('Name updated successfully!');
  }
}

saveNameBtn.addEventListener('click', saveNewName);

nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    saveNewName();
  } else if (e.key === 'Escape') {
    nameModal.classList.add('hidden');
  }
});

// Copy Timestamp
copyTimeBtn.addEventListener('click', () => {
  const isoTime = new Date().toISOString();
  navigator.clipboard.writeText(isoTime).then(() => {
    showToast('ISO timestamp copied to clipboard!');
  }).catch(() => {
    showToast(`Current Time: ${isoTime}`);
  });
});

// Fullscreen toggle
fullscreenToggle.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
});

// Theme Dropdown Toggle
themeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  themeDropdown.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
  if (!themeDropdown.contains(e.target) && e.target !== themeBtn) {
    themeDropdown.classList.add('hidden');
  }
});

themeOpts.forEach((btn) => {
  btn.addEventListener('click', () => {
    const selectedTheme = btn.getAttribute('data-theme');
    applyTheme(selectedTheme);
    themeDropdown.classList.add('hidden');
    showToast(`Accent set to ${selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)}`);
  });
});

// Resolution tracking
function updateResolution() {
  if (resolutionEl) {
    resolutionEl.textContent = `${window.innerWidth} × ${window.innerHeight}`;
  }
}
window.addEventListener('resize', updateResolution);

// Initialize application
renderName();
applyTheme(state.theme);
updateClock();
updateResolution();

// Initialize Lucide icons
if (window.lucide) {
  window.lucide.createIcons();
}

// Tick interval (runs every 1000ms)
setInterval(() => {
  updateClock();
  if (window.lucide) {
    window.lucide.createIcons();
  }
}, 1000);

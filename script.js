/**
 * Habesha Eatery - Fine Ethiopian Dining & Cultural Lounge
 * Interactive Application Logic:
 *  - Formal Reservation System & Concierge Tracker
 *  - Reservation Type Categorization & Dynamic Filtering
 *  - Member Authentication & VIP Club Portal
 *  - Interactive Menu Filtering & Pre-selection
 *  - Toast Notifications & Modal Dialogues
 */

// =============================================================================
// State & Storage
// =============================================================================
const STORAGE_KEYS = {
    RESERVATIONS: 'habesha_eatery_reservations',
    USER: 'habesha_eatery_current_user'
};

// Initial sample reservation to demonstrate the feature immediately
const DEFAULT_RESERVATIONS = [
    {
        id: 'HE-7842',
        type: 'Cultural Mesob Experience',
        title: 'Ato',
        name: 'Dawit Hallelujah',
        phone: '+251 91 145 6789',
        email: 'dawit@example.com',
        guests: '4 Guests (Standard Dining)',
        date: getFormattedDateOffset(2),
        time: '07:30 PM - Prime Dinner Seating',
        seating: 'Cultural Mesob Alcove (Intimate Cushions)',
        occasion: 'Anniversary Celebration',
        dietary: 'Strictly 100% Teff Injera (Gluten-Free)',
        requests: 'High table mesob near the live acoustic krar corner. One order of Royal Doro Wat requested in advance.',
        status: 'Confirmed',
        createdAt: new Date().toISOString()
    }
];

let reservations = loadReservations();
let currentUser = loadCurrentUser();
let currentFilter = 'all';

// =============================================================================
// Initialization on DOM Load
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initDateInput();
    initMobileNav();
    initAuthModal();
    initReservationTypeSelector();
    initReservationForm();
    initMenuFilter();
    renderUserAuthSlot();
    renderReservations();
});

// Helper: Get YYYY-MM-DD string offset by days
function getFormattedDateOffset(daysOffset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
}

// Set minimum date for the reservation input to today
function initDateInput() {
    const dateInput = document.getElementById('res-date');
    if (dateInput) {
        const today = getFormattedDateOffset(0);
        dateInput.min = today;
        dateInput.value = getFormattedDateOffset(1); // Default to tomorrow
    }
}

// =============================================================================
// Mobile Navigation
// =============================================================================
function initMobileNav() {
    const toggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
            });
        });
    }
}

// =============================================================================
// Authentication & VIP Member Portal
// =============================================================================
function loadCurrentUser() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.USER);
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        return null;
    }
}

function saveCurrentUser(user) {
    currentUser = user;
    if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
    }
    renderUserAuthSlot();
}

function initAuthModal() {
    const modal = document.getElementById('auth-modal');
    const openBtn = document.getElementById('login-open-btn');
    const closeBtn = document.getElementById('login-close-btn');
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');

    if (openBtn) {
        openBtn.addEventListener('click', openAuthModal);
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAuthModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeAuthModal();
        });
    }

    // Escape key listener for modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAuthModal();
            closeSuccessModal();
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('login-email').value.trim();
            const displayName = emailInput.split('@')[0] || 'Esteemed Guest';
            const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
            loginUser(formattedName, emailInput, 'VIP Member');
        });
    }

    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            loginUser(name, email, 'VIP Dining Society Member');
        });
    }
}

function openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
    }
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }
}

function switchAuthTab(tab) {
    const tabLogin = document.getElementById('tab-login');
    const tabReg = document.getElementById('tab-register');
    const formLogin = document.getElementById('login-form');
    const formReg = document.getElementById('register-form');

    if (tab === 'login') {
        tabLogin.classList.add('active');
        tabReg.classList.remove('active');
        formLogin.classList.add('active');
        formReg.classList.remove('active');
    } else {
        tabReg.classList.add('active');
        tabLogin.classList.remove('active');
        formReg.classList.add('active');
        formLogin.classList.remove('active');
    }
}

function quickLogin(name, email, status) {
    loginUser(name, email, status);
}

function loginUser(name, email, status = 'VIP Member') {
    const user = { name, email, status };
    saveCurrentUser(user);
    closeAuthModal();

    // Autofill reservation form fields if available
    const nameField = document.getElementById('res-name');
    const emailField = document.getElementById('res-email');
    if (nameField && !nameField.value) nameField.value = name;
    if (emailField && !emailField.value) emailField.value = email;

    showToast(`Welcome, ${name}! Your ${status} access is active.`, 'toast-gold');
}

function logoutUser() {
    saveCurrentUser(null);
    showToast('You have signed out of your account.', 'toast');
}

function renderUserAuthSlot() {
    const slot = document.getElementById('user-auth-slot');
    if (!slot) return;

    if (currentUser) {
        const initials = currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'VIP';
        slot.innerHTML = `
            <div class="user-logged-badge">
                <div class="user-avatar">${initials}</div>
                <div class="user-meta-text">
                    <span class="user-name">${escapeHTML(currentUser.name)}</span>
                    <span class="user-status">${escapeHTML(currentUser.status)}</span>
                </div>
                <button type="button" class="btn-logout-small" onclick="logoutUser()" title="Sign out">Log Out</button>
            </div>
        `;
    } else {
        slot.innerHTML = `
            <button type="button" class="btn btn-outline" id="login-open-btn" onclick="openAuthModal()">
                <svg class="icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>Member Sign In</span>
            </button>
        `;
    }
}

// =============================================================================
// Formal Reservation Type Selector
// =============================================================================
function initReservationTypeSelector() {
    const typeCards = document.querySelectorAll('.res-type-card');
    typeCards.forEach(card => {
        card.addEventListener('click', () => {
            typeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const radio = card.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
        });
    });
}

// =============================================================================
// Formal Reservation Form & Submission Logic
// =============================================================================
function loadReservations() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
        return stored ? JSON.parse(stored) : DEFAULT_RESERVATIONS;
    } catch (e) {
        return DEFAULT_RESERVATIONS;
    }
}

function saveReservations() {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
    renderReservations();
}

function initReservationForm() {
    const form = document.getElementById('formal-reservation-form');
    if (!form) return;

    // Filter pills in the Current Reservations Section
    const pills = document.querySelectorAll('.type-pills .pill-btn');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.getAttribute('data-filter');
            renderReservations();
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Extract selected reservation type
        const selectedRadio = form.querySelector('input[name="reservationType"]:checked');
        const reservationType = selectedRadio ? selectedRadio.value : 'Formal Dining Table';

        const newBooking = {
            id: 'HE-' + Math.floor(1000 + Math.random() * 9000),
            type: reservationType,
            title: form.elements['title'].value,
            name: form.elements['name'].value.trim(),
            phone: form.elements['phone'].value.trim(),
            email: form.elements['email'].value.trim(),
            guests: form.elements['guests'].value,
            date: form.elements['date'].value,
            time: form.elements['time'].value,
            seating: form.elements['seating'].value,
            occasion: form.elements['occasion'].value,
            dietary: form.elements['dietary'].value,
            requests: form.elements['requests'].value.trim() || 'No special requests submitted.',
            status: 'Confirmed',
            createdAt: new Date().toISOString()
        };

        // Prepend to reservations list
        reservations.unshift(newBooking);
        saveReservations();

        // Show confirmation modal
        openSuccessModal(newBooking);

        // Reset form
        form.reset();
        initDateInput();
        initReservationTypeSelector();

        // Retain logged-in credentials if applicable
        if (currentUser) {
            const nameField = document.getElementById('res-name');
            const emailField = document.getElementById('res-email');
            if (nameField) nameField.value = currentUser.name;
            if (emailField) emailField.value = currentUser.email;
        }

        showToast(`Formal reservation confirmed! Ref: ${newBooking.id}`, 'toast-success');
    });
}

// =============================================================================
// Current Reservations Rendering & Management
// =============================================================================
function renderReservations() {
    const container = document.getElementById('reservations-container');
    const badge = document.getElementById('booking-badge');
    const countAllSpan = document.getElementById('count-all');

    if (badge) badge.textContent = reservations.length;
    if (countAllSpan) countAllSpan.textContent = reservations.length;

    if (!container) return;

    // Filter list
    const filtered = currentFilter === 'all'
        ? reservations
        : reservations.filter(res => res.type.toLowerCase().includes(currentFilter.toLowerCase()));

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-bookings-box">
                <div class="empty-icon">🍽️</div>
                <h4>No Active Bookings in this Category</h4>
                <p>You have no current reservations filed under "${escapeHTML(currentFilter)}".</p>
                <a href="#reserve" class="btn btn-secondary btn-sm">Book a Formal Table Now</a>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(res => `
        <article class="booking-card" id="card-${res.id}">
            <div class="booking-card-ribbon"></div>
            
            <div class="booking-header">
                <div class="booking-ref">
                    <span class="ref-label">Reference ID</span>
                    <span class="ref-code">${escapeHTML(res.id)}</span>
                </div>
                <span class="booking-status status-confirmed">
                    <span class="status-dot">●</span> ${escapeHTML(res.status)}
                </span>
            </div>

            <div class="booking-type-badge">${escapeHTML(res.type)}</div>

            <h4 class="booking-guest-title">${escapeHTML(res.title || '')} ${escapeHTML(res.name)}</h4>

            <div class="booking-details-list">
                <div class="detail-item">
                    <strong>Date</strong>
                    <span>📅 ${formatReadableDate(res.date)}</span>
                </div>
                <div class="detail-item">
                    <strong>Service Slot</strong>
                    <span>⏰ ${escapeHTML(res.time)}</span>
                </div>
                <div class="detail-item">
                    <strong>Party Size</strong>
                    <span>👥 ${escapeHTML(res.guests)}</span>
                </div>
                <div class="detail-item">
                    <strong>Atmosphere</strong>
                    <span>🛋️ ${escapeHTML(res.seating)}</span>
                </div>
            </div>

            <div class="booking-notes">
                <strong>Notes / Occasion:</strong> ${escapeHTML(res.occasion)} • ${escapeHTML(res.dietary)}<br>
                ${escapeHTML(res.requests)}
            </div>

            <div class="booking-actions">
                <button type="button" class="btn-card-cancel" onclick="cancelReservation('${res.id}')">Cancel Booking</button>
                <button type="button" class="btn-card-view" onclick="viewReservationDetails('${res.id}')">View Formal Pass</button>
            </div>
        </article>
    `).join('');
}

function cancelReservation(id) {
    const item = reservations.find(r => r.id === id);
    if (!item) return;

    const confirmed = confirm(`Are you sure you wish to cancel reservation ${id} for ${item.name}?`);
    if (confirmed) {
        reservations = reservations.filter(r => r.id !== id);
        saveReservations();
        showToast(`Reservation ${id} has been cancelled.`, 'toast');
    }
}

function viewReservationDetails(id) {
    const item = reservations.find(r => r.id === id);
    if (!item) return;
    openSuccessModal(item);
}

// =============================================================================
// Confirmation Modal
// =============================================================================
function openSuccessModal(booking) {
    const modal = document.getElementById('booking-success-modal');
    const detailsContainer = document.getElementById('confirmation-details');
    const heading = document.getElementById('confirm-guest-heading');

    if (heading) {
        heading.textContent = `Reservation Confirmed for ${booking.title || ''} ${booking.name}`;
    }

    if (detailsContainer) {
        detailsContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ebdcd0; padding-bottom: 0.6rem; margin-bottom: 0.8rem;">
                <div>
                    <span style="font-size: 0.75rem; text-transform: uppercase; color: #6e6057;">Reference Code</span><br>
                    <strong style="font-size: 1.25rem; color: #b84a1d; font-family: monospace;">${escapeHTML(booking.id)}</strong>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 0.75rem; text-transform: uppercase; color: #6e6057;">Status</span><br>
                    <span style="color: #2b8a3e; font-weight: 700;">● Confirmed & Table Held</span>
                </div>
            </div>

            <p><strong>Reservation Type:</strong> ${escapeHTML(booking.type)}</p>
            <p><strong>Date & Time:</strong> ${formatReadableDate(booking.date)} at ${escapeHTML(booking.time)}</p>
            <p><strong>Party Size:</strong> ${escapeHTML(booking.guests)} (${escapeHTML(booking.seating)})</p>
            <p><strong>Occasion & Dietary:</strong> ${escapeHTML(booking.occasion)} | ${escapeHTML(booking.dietary)}</p>
            <p><strong>Contact On File:</strong> ${escapeHTML(booking.phone)} | ${escapeHTML(booking.email)}</p>
            <div style="margin-top: 0.8rem; padding: 0.6rem; background: #fff; border-radius: 6px; border: 1px solid #ebdcd0; font-size: 0.82rem; color: #6e6057;">
                <strong>Special Requests:</strong> ${escapeHTML(booking.requests)}
            </div>
        `;
    }

    if (modal) {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
    }
}

function closeSuccessModal() {
    const modal = document.getElementById('booking-success-modal');
    if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }
}

function viewMyReservations() {
    closeSuccessModal();
    const section = document.getElementById('current-reservations');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// =============================================================================
// Menu Category Filter
// =============================================================================
function initMenuFilter() {
    const tabs = document.querySelectorAll('.menu-tab-btn');
    const cards = document.querySelectorAll('#menu-grid .card');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const category = tab.getAttribute('data-category');

            cards.forEach(card => {
                if (category === 'all') {
                    card.style.display = 'flex';
                } else {
                    const cardCategories = card.getAttribute('data-category') || '';
                    if (cardCategories.includes(category)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
}

// Pre-select a dish into the reservation requests form
function handleReservePreselect(dishName) {
    const textarea = document.getElementById('res-requests');
    const formSection = document.getElementById('reserve');

    if (textarea) {
        const existing = textarea.value.trim();
        const note = `Pre-ordered dish for table: ${dishName}.`;
        if (!existing.includes(dishName)) {
            textarea.value = existing ? `${existing}\n${note}` : note;
        }
    }

    if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });
    }

    showToast(`Added ${dishName} to your table reservation requests!`, 'toast-gold');
}

// Newsletter placeholder handler
function handleNewsletter(btn) {
    const input = btn.previousElementSibling;
    if (input && input.value.trim()) {
        showToast('Thank you for subscribing to Habesha Dining Society!', 'toast-success');
        input.value = '';
    } else {
        showToast('Please enter a valid email address.', 'toast');
    }
}

// =============================================================================
// Toast System
// =============================================================================
function showToast(message, typeClass = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${typeClass}`;
    toast.innerHTML = `
        <span>${escapeHTML(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastSlideIn 0.3s ease reverse forwards';
        setTimeout(() => toast.remove(), 320);
    }, 3800);
}

// =============================================================================
// Utility Functions
// =============================================================================
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatReadableDate(dateString) {
    if (!dateString) return '';
    try {
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}


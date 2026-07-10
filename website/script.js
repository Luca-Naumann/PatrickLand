// Mobile Menu Toggle
const mobileBtn = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    const icon = mobileBtn.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// Smooth Scrolling for all links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        if (this.getAttribute('href') !== '#') {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Back to top button (optional but nice)
function createBackToTop() {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    btn.className = 'fixed bottom-8 right-8 bg-green-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-2xl opacity-0 transition-all hover:bg-green-600 z-50';
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btn.classList.remove('opacity-0');
        } else {
            btn.classList.add('opacity-0');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
createBackToTop();
// Modal Functions
function closeModal() {
    document.getElementById('ticket-modal').classList.add('hidden');
}

function openTicketModal() {
    document.getElementById('ticket-modal').classList.remove('hidden');
}

// Eventbrite Widget
var exampleCallback = function() {
    console.log('Order complete!');
};

window.EBWidgets.createWidget({
    widgetType: 'checkout',
    eventId: '1992098976665',
    modal: true,
    modalTriggerElementId: 'eventbrite-widget-modal-trigger-1992098976665',
    onOrderComplete: exampleCallback
});

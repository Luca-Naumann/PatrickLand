// ============================================
// MOBILE MENU MANAGEMENT
// ============================================
function initMobileMenu() {
    const menu = document.getElementById("mobile-menu");
    const openButton = document.getElementById("mobile-menu-button");
    const closeButton = document.getElementById("mobile-close-button");

    if (!menu || !openButton || !closeButton) {
        console.warn("Mobile menu elements not found");
        return;
    }

    const closeMenu = () => {
        menu.classList.remove("active");
        document.body.style.overflow = "";
    };

    openButton.addEventListener("click", () => {
        menu.classList.add("active");
        document.body.style.overflow = "hidden";
    });

    closeButton.addEventListener("click", closeMenu);

    // Close menu when clicking links
    document.querySelectorAll(".mobile-nav-links a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    // Close menu on Escape key
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });
}

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
function initNavbarScroll() {
    const nav = document.getElementById("navbar");
    if (!nav) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 80) {
            nav.classList.add("scrolled");
        } else {
            nav.classList.remove("scrolled");
        }
    });
}

// ============================================
// SMOOTH SCROLLING
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// ============================================
// BACK TO TOP BUTTON
// ============================================
function createBackToTop() {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    btn.className = 'fixed bottom-8 right-8 bg-green-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-2xl opacity-0 transition-all hover:bg-green-600 z-50';
    btn.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        btn.classList.toggle('opacity-0', window.scrollY <= 500);
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================
// MODAL FUNCTIONS (Matched to your HTML names)
// ============================================
function closeModal() {
    const modal = document.getElementById('ticket-modal');
    if (modal) modal.classList.add('hidden');
}

function openTicketModal() {
    const modal = document.getElementById('ticket-modal');
    if (modal) modal.classList.remove('hidden');
}

// ============================================
// EVENTBRITE WIDGET (SAFE INITIALIZATION)
// ============================================
function initEventbriteWidget() {
    if (typeof window.EBWidgets === 'undefined') {
        console.warn("Eventbrite widget script not loaded");
        return;
    }

    const exampleCallback = function() {
        console.log('Order complete!');
    };

    window.EBWidgets.createWidget({
        widgetType: 'checkout',
        eventId: '1992098976665',
        modal: true,
        modalTriggerElementId: 'eventbrite-widget-modal-trigger-1992098976665',
        onOrderComplete: exampleCallback
    });
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initNavbarScroll();
    initSmoothScroll();
    createBackToTop();
    initEventbriteWidget();
});

const hero = document.querySelector(".hero-bg");

hero.addEventListener("mousemove",(e)=>{

    const x=(e.clientX/window.innerWidth-.5)*30;

    const y=(e.clientY/window.innerHeight-.5)*30;

    document.querySelectorAll(".cloud").forEach(el=>{

        el.style.transform=
        `translate(${x*.35}px,${y*.35}px)`;

    });

    document.querySelectorAll(".balloon").forEach(el=>{

        el.style.transform=
        `translate(${x*.6}px,${y*.6}px)`;

    });

    const wheel=document.querySelector(".ferris-wheel");

    if(wheel){

        wheel.style.transform=
        `translate(${x*.45}px,${y*.45}px)`;

    }

});

/* =====================================================
   PATRICKLAND REVIEWS CAROUSEL
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const carousel = document.querySelector(".reviews-carousel");
    const cards = document.querySelectorAll(".review-card");

    if (!carousel || cards.length === 0) return;


    let currentIndex = 0;


    function goToReview(index){

        if(index < 0){
            index = cards.length - 1;
        }

        if(index >= cards.length){
            index = 0;
        }


        currentIndex = index;


        carousel.scrollTo({

            left:
            cards[index].offsetLeft -
            carousel.offsetLeft,

            behavior:"smooth"

        });

    }



    /* =====================================
       AUTO SCROLL
    ===================================== */

    let autoPlay = setInterval(()=>{

        goToReview(currentIndex + 1);

    },6000);



    /* Pause when user interacts */

    function pauseAuto(){

        clearInterval(autoPlay);


        autoPlay=setInterval(()=>{

            goToReview(currentIndex + 1);

        },8000);

    }



    carousel.addEventListener(
        "mouseenter",
        pauseAuto
    );


    carousel.addEventListener(
        "touchstart",
        pauseAuto
    );



    /* =====================================
       UPDATE ACTIVE CARD
    ===================================== */


    const observer = new IntersectionObserver(

        entries=>{

            entries.forEach(entry=>{

                if(entry.isIntersecting){

                    currentIndex =
                    [...cards]
                    .indexOf(entry.target);

                }

            });

        },

        {

            root:carousel,

            threshold:.6

        }

    );



    cards.forEach(card=>{

        observer.observe(card);

    });



});

/* =======================================================
   PatrickLand Premium Reviews Carousel v1.0
   PART 1 - INITIALISE
======================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* ======================================
       ELEMENTS
    ====================================== */

    const carousel = document.querySelector(".reviews-carousel");
    const cards = [...document.querySelectorAll(".review-card")];
    const indicatorsContainer = document.querySelector(".review-indicators");

    const previousButton = document.querySelector(".review-prev");
    const nextButton = document.querySelector(".review-next");

    if (!carousel || cards.length === 0) return;

    let currentIndex = 0;

    let autoplayTimer = null;

    let isDragging = false;

    let startX = 0;

    let scrollStart = 0;

    let scrollFinished;

    /* ======================================
       CREATE PREMIUM INDICATORS
    ====================================== */

    cards.forEach((card, index) => {

        const indicator = document.createElement("button");

        indicator.className = "review-indicator";

        indicator.setAttribute(
            "aria-label",
            `Go to review ${index + 1}`
        );

        indicator.addEventListener("click", () => {

            scrollToCard(index);

            restartAutoplay();

        });

        indicatorsContainer.appendChild(indicator);

    });

    const indicators = [
        ...document.querySelectorAll(".review-indicator")
    ];

    /* ======================================
       UPDATE ACTIVE CARD
    ====================================== */

    function updateActiveStates() {

        cards.forEach((card, index) => {

            if (index === currentIndex) {

                card.classList.add("active");

            } else {

                card.classList.remove("active");

            }

        });

        indicators.forEach((indicator, index) => {

            indicator.classList.toggle(
                "active",
                index === currentIndex
            );

        });

    }

    /* ======================================
       SCROLL TO CARD
    ====================================== */

    function scrollToCard(index) {

        if (index < 0) {

            currentIndex = cards.length - 1;

        }

        else if (index >= cards.length) {

            currentIndex = 0;

        }

        else {

            currentIndex = index;

        }

        cards[currentIndex].scrollIntoView({

            behavior: "smooth",

            inline: "center",

            block: "nearest"

        });

        updateActiveStates();

    }

    updateActiveStates();

        /* ======================================
       OBSERVE ACTIVE REVIEW
    ====================================== */

    const observer = new IntersectionObserver(

        (entries) => {

            entries.forEach((entry) => {

                if (!entry.isIntersecting) return;

                const index = cards.indexOf(entry.target);

                if (index !== -1) {

                    currentIndex = index;

                    updateActiveStates();

                }

            });

        },

        {

            root: carousel,

            threshold: 0.65

        }

    );

    cards.forEach((card) => observer.observe(card));


    /* ======================================
       AUTOPLAY
    ====================================== */

    function startAutoplay() {

        clearInterval(autoplayTimer);

        autoplayTimer = setInterval(() => {

            scrollToCard(currentIndex + 1);

        }, 5500);

    }

    function stopAutoplay() {

        clearInterval(autoplayTimer);

    }

    function restartAutoplay() {

        stopAutoplay();

        startAutoplay();

    }

    startAutoplay();


    /* ======================================
       PAUSE WHEN USER INTERACTS
    ====================================== */

    carousel.addEventListener("mouseenter", stopAutoplay);

    carousel.addEventListener("mouseleave", startAutoplay);

    carousel.addEventListener("touchstart", stopAutoplay);

    carousel.addEventListener("touchend", restartAutoplay);


    /* ======================================
       PREVIOUS / NEXT BUTTONS
    ====================================== */

    if (previousButton) {

        previousButton.addEventListener("click", () => {

            scrollToCard(currentIndex - 1);

            restartAutoplay();

        });

    }

    if (nextButton) {

        nextButton.addEventListener("click", () => {

            scrollToCard(currentIndex + 1);

            restartAutoplay();

        });

    }


    /* ======================================
       KEYBOARD SUPPORT
    ====================================== */

    document.addEventListener("keydown", (event) => {

        if (event.key === "ArrowLeft") {

            scrollToCard(currentIndex - 1);

            restartAutoplay();

        }

        if (event.key === "ArrowRight") {

            scrollToCard(currentIndex + 1);

            restartAutoplay();

        }

    });

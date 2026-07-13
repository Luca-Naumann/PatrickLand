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
// HERO SECTION PARALLAX EFFECT
// ============================================
function initHeroParallax() {
    const hero = document.querySelector(".hero-section");

    if (hero) {
        hero.addEventListener("mousemove", (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 30;
            const y = (e.clientY / window.innerHeight - 0.5) * 30;

            // Move clouds
            document.querySelectorAll(".cloud").forEach(el => {
                el.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
            });

            // Move balloons
            document.querySelectorAll(".balloon").forEach(el => {
                el.style.transform = `translate(${x * 0.6}px, ${y * 0.6}px)`;
            });

            // Move ferris wheel
            const wheel = document.querySelector(".ferris-wheel");
            if (wheel) {
                wheel.style.transform = `translate(${x * 0.45}px, ${y * 0.45}px)`;
            }
        });
    }
}

// ============================================
// REVIEWS CAROUSEL INITIALIZATION
// ============================================
function initReviewsCarousel() {
    const carousel = document.querySelector(".reviews-carousel");
    const cards = [...document.querySelectorAll(".review-card")];
    const indicatorsContainer = document.getElementById("reviewIndicators");

    const previousButton = document.querySelector(".review-prev");
    const nextButton = document.querySelector(".review-next");

    if (!carousel || cards.length === 0 || !indicatorsContainer) return;

    let currentIndex = 0;
    let autoplayTimer = null;

    const reviewsSection = document.getElementById("reviews");

    let reviewsVisible = false;

    // Only observe if the reviews section exists
    if (reviewsSection) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                reviewsVisible = entries[0].isIntersecting;

                if (reviewsVisible) {
                    startAutoplay();
                } else {
                    stopAutoplay();
                }
            },
            {
                threshold: 0.35
            }
        );

        sectionObserver.observe(reviewsSection);
    }

    // Ensure the browser doesn't apply scroll anchoring for this area
    try {
        if (reviewsSection) reviewsSection.style.overflowAnchor = 'none';
        carousel.style.overflowAnchor = 'none';
    } catch (e) {
        // ignore if not supported
    }

    // Prevent cards from receiving focus which can cause the browser to scroll them into view
    cards.forEach(card => {
        try { card.tabIndex = -1; } catch (e) {}
    });

    // helper: restore vertical scroll position after actions that may cause focus/anchor jumps
    function restoreVerticalScroll(savedY) {
        // small timeout allows the browser to finish any auto-scrolling, then we restore
        setTimeout(() => {
            // Only restore if the savedY is a finite number
            if (Number.isFinite(savedY)) {
                window.scrollTo(window.scrollX, savedY);
            }
        }, 10);
    }

    // CREATE INDICATORS (clear any existing to avoid duplicates)
    indicatorsContainer.innerHTML = '';
    cards.forEach((card, index) => {
        const indicator = document.createElement("button");
        indicator.type = 'button'; // prevent default submit behavior in forms
        indicator.className = "review-indicator";
        indicator.setAttribute("aria-label", `Go to review ${index + 1}`);
        indicator.addEventListener("click", (e) => {
            if (e && typeof e.preventDefault === 'function') e.preventDefault();

            const savedY = window.scrollY;
            scrollToCard(index);
            restartAutoplay();

            // blur to avoid focus-caused scrolling
            if (e.currentTarget && typeof e.currentTarget.blur === 'function') e.currentTarget.blur();

            restoreVerticalScroll(savedY);
        });
        indicatorsContainer.appendChild(indicator);
    });

    const indicators = [...document.querySelectorAll(".review-indicator")];

    // UPDATE ACTIVE CARD
    function updateActiveStates() {
        cards.forEach((card, index) => {
            if (index === currentIndex) {
                card.classList.add("active");
            } else {
                card.classList.remove("active");
            }
        });

        indicators.forEach((indicator, index) => {
            indicator.classList.toggle("active", index === currentIndex);
        });
    }

    // SCROLL TO CARD
    function scrollToCard(index) {
        if (index < 0) {
            currentIndex = cards.length - 1;
        } else if (index >= cards.length) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }

        // Ensure carousel exists and the current card is defined
        const currentCard = cards[currentIndex];
        if (carousel && currentCard) {
            // Only perform horizontal scrolling on the carousel element (avoid page jump)
            // Use scrollLeft instead of scrollIntoView to prevent the browser from scrolling the page vertically
            try {
                const left = currentCard.offsetLeft - (carousel.offsetWidth - currentCard.offsetWidth) / 2;
                // If carousel is not scrollable horizontally, don't call scrollTo on it
                if (carousel.scrollWidth > carousel.clientWidth) {
                    carousel.scrollTo({ left: left, behavior: "smooth" });
                }
            } catch (err) {
                // Fallback: don't do anything if element scroll fails
                console.warn('carousel scroll failed', err);
            }
        }

        updateActiveStates();
    }

    updateActiveStates();

    // OBSERVE ACTIVE REVIEW
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const index = cards.indexOf(entry.target);
                if (index !== -1) {
                    currentIndex = index;
// ============================================
// PREMIUM REVIEWS CAROUSEL
// TikTok / Instagram style indicators
// ============================================

function initReviewsCarousel(){

    const carousel = document.querySelector(".reviews-carousel");
    const cards = [...document.querySelectorAll(".review-card")];
    const indicatorsContainer = document.getElementById("reviewIndicators");
    const reviewsSection = document.getElementById("reviews");


    if(!carousel || cards.length === 0 || !indicatorsContainer){
        return;
    }


    let currentIndex = 0;
    let autoplayTimer = null;
    let progressTimer = null;

    let reviewsVisible = false;



    /*
    ============================================
    CREATE 5 MOVING INDICATORS
    ============================================
    */

    const indicatorCount = 5;

    indicatorsContainer.innerHTML="";


    for(let i=0;i<indicatorCount;i++){

        const button=document.createElement("button");

        button.className="review-indicator";

        button.type="button";

        button.dataset.position=i;


        button.addEventListener("click",()=>{

            const target =
            getIndicatorTarget(i);

            goToReview(target);

            restartAutoplay();

        });


        indicatorsContainer.appendChild(button);

    }


    const indicators =
    [...document.querySelectorAll(".review-indicator")];




    /*
    ============================================
    INDICATOR WINDOW
    ============================================
    */

    function getIndicatorTarget(position){

        let start =
        currentIndex - 2;


        if(start < 0){
            start = 0;
        }


        let target =
        start + position;


        if(target >= cards.length){

            target =
            cards.length - 1;

        }


        return target;

    }



    function updateIndicators(){

        let start =
        currentIndex - 2;


        if(start < 0){
            start=0;
        }


        if(start + 5 > cards.length){

            start =
            cards.length - 5;

        }


        indicators.forEach((dot,index)=>{


            const reviewIndex =
            start + index;


            dot.classList.toggle(
                "active",
                reviewIndex === currentIndex
            );


            dot.dataset.review =
            reviewIndex;


        });

    }





    /*
    ============================================
    ACTIVE CARD
    ============================================
    */


    function updateCards(){

        cards.forEach((card,index)=>{


            card.classList.toggle(
                "active",
                index===currentIndex
            );


        });


        updateIndicators();

    }





    /*
    ============================================
    MOVE CAROUSEL
    ============================================
    */


    function goToReview(index){


        if(index < 0){

            index =
            cards.length-1;

        }


        if(index >= cards.length){

            index=0;

        }


        currentIndex=index;


        const card =
        cards[currentIndex];


        const position =
        card.offsetLeft -
        (
            carousel.offsetWidth -
            card.offsetWidth
        )/2;



        carousel.scrollTo({

            left:position,

            behavior:"smooth"

        });



        updateCards();


    }





    /*
    ============================================
    AUTOPLAY WITH PROGRESS
    ============================================
    */


    function startAutoplay(){

        if(autoplayTimer || !reviewsVisible){
            return;
        }



        let progress=0;


        autoplayTimer=setInterval(()=>{


            progress+=2;


            const active =
            document.querySelector(
                ".review-indicator.active"
            );


            if(active){

                active.style.setProperty(
                    "--progress",
                    progress+"%"
                );

            }



            if(progress>=100){


                progress=0;


                goToReview(
                    currentIndex+1
                );

            }



        },100);

    }





    function stopAutoplay(){

        clearInterval(autoplayTimer);

        autoplayTimer=null;


        indicators.forEach(dot=>{

            dot.style.removeProperty(
                "--progress"
            );

        });

    }



    function restartAutoplay(){

        stopAutoplay();

        startAutoplay();

    }




    /*
    ============================================
    VISIBILITY OBSERVER
    ============================================
    */


    if(reviewsSection){


        const sectionObserver =
        new IntersectionObserver(
        entries=>{


            reviewsVisible =
            entries[0].isIntersecting;


            if(reviewsVisible){

                startAutoplay();

            }
            else{

                stopAutoplay();

            }


        },
        {
            threshold:.35
        });


        sectionObserver.observe(
            reviewsSection
        );


    }




    /*
    ============================================
    USER CONTROLS
    ============================================
    */


    carousel.addEventListener(
        "mouseenter",
        stopAutoplay
    );


    carousel.addEventListener(
        "mouseleave",
        startAutoplay
    );


    carousel.addEventListener(
        "touchstart",
        stopAutoplay
    );


    carousel.addEventListener(
        "touchend",
        restartAutoplay
    );



    /*
    ============================================
    DETECT MANUAL SCROLL
    ============================================
    */


    const cardObserver =
    new IntersectionObserver(
    entries=>{


        entries.forEach(entry=>{


            if(entry.isIntersecting){


                const index =
                cards.indexOf(
                    entry.target
                );


                if(index!==-1){


                    currentIndex=index;


                    updateCards();


                }

            }


        });


    },
    {

        root:carousel,

        threshold:.65

    });



    cards.forEach(card=>{

        cardObserver.observe(card);

    });



    updateCards();

}
// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initNavbarScroll();
    initSmoothScroll();
    createBackToTop();
    initHeroParallax();
    initReviewsCarousel();
    initEventbriteWidget();
});

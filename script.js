// ============================================
// SHARED HELPERS
// ============================================

// iOS has never implemented any web API for the Taptic Engine —
// navigator.vibrate() simply does not exist in iOS Safari, on
// any iOS version. This is a hard platform limitation, not
// something fixable from JavaScript, so iOS always falls back
// to a visual "press" animation instead of real vibration.
const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                     (navigator.platform === 'MacIntel' && 'ontouchend' in document);

// Plays a short sound effect. Wrapped in try/catch + a caught
// promise because both a missing audio file and a browser
// blocking autoplay-without-a-fresh-gesture throw/reject —
// neither should ever break the interaction it's attached to.
function playSound(src, volume = 0.5) {
    try {
        const audio = new Audio(src);
        audio.volume = volume;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => { /* autoplay blocked or file missing — ignore */ });
        }
    } catch (err) {
        // Ignore — sound is a nice-to-have, never critical
    }
}

// Custom eased scroll, used instead of the browser's built-in
// scrollTo({behavior:'smooth'}) for the reviews carousel. The
// native version's duration/easing isn't controllable and reads
// as fast/snappy; this gives a slower, deliberate, more premium
// glide between cards.
function smoothScrollTo(element, targetLeft, duration = 800) {
    const startLeft = element.scrollLeft;
    const distance = targetLeft - startLeft;
    const startTime = performance.now();

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        element.scrollLeft = startLeft + distance * easeInOutCubic(progress);
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

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

    document
    .querySelectorAll(".mobile-nav-links a, .mobile-ticket-button")
    .forEach(element => {
        element.addEventListener("click", closeMenu);
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
                    smoothScrollTo(carousel, left, 800);
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

    // AUTOPLAY
    function startAutoplay() {
        // don't create multiple intervals
        if (autoplayTimer) return;

        // start only if the reviews section is visible
        if (!reviewsVisible) return;

        autoplayTimer = setInterval(() => {
            // If the section is not visible (user scrolled away), don't advance
            if (!reviewsVisible) return;

            scrollToCard(currentIndex + 1);

            // Light haptic on auto-advance. Note: many browsers will
            // silently ignore this since it's not a direct user
            // gesture — that's an intentional browser security
            // policy (vibrate() is gated behind user activation),
            // not something fixable from this side of the API.
            if (navigator.vibrate && !isIOSDevice) {
                navigator.vibrate(25);
            }

        }, 6500);
    }

    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    function restartAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    startAutoplay();

    // PAUSE WHEN USER INTERACTS
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('touchstart', stopAutoplay);
    carousel.addEventListener('touchend', restartAutoplay);

    // PREVIOUS / NEXT BUTTONS
    if (previousButton) {
        previousButton.addEventListener("click", (e) => {
            if (e && typeof e.preventDefault === 'function') e.preventDefault();
            const savedY = window.scrollY;
            scrollToCard(currentIndex - 1);
            restartAutoplay();
            if (e.currentTarget && typeof e.currentTarget.blur === 'function') e.currentTarget.blur();
            restoreVerticalScroll(savedY);
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", (e) => {
            if (e && typeof e.preventDefault === 'function') e.preventDefault();
            const savedY = window.scrollY;
            scrollToCard(currentIndex + 1);
            restartAutoplay();
            if (e.currentTarget && typeof e.currentTarget.blur === 'function') e.currentTarget.blur();
            restoreVerticalScroll(savedY);
        });
    }

    // KEYBOARD SUPPORT
    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
            const savedY = window.scrollY;
            scrollToCard(currentIndex - 1);
            restartAutoplay();
            restoreVerticalScroll(savedY);
        }
        if (event.key === "ArrowRight") {
            const savedY = window.scrollY;
            scrollToCard(currentIndex + 1);
            restartAutoplay();
            restoreVerticalScroll(savedY);
        }
    });
}

// ============================================

// ABOUT SECTION — scroll reveal + stat counters

// ============================================

function initAboutSection() {

const section = document.getElementById("about");

if (!section) return;


const revealTargets = [...section.querySelectorAll("[data-reveal]")];

if (revealTargets.length) {

const revealObserver = new IntersectionObserver((entries) => {

entries.forEach((entry, i) => {

if (entry.isIntersecting) {

setTimeout(() => entry.target.classList.add("is-visible"), i * 40);

revealObserver.unobserve(entry.target);

}

});

}, { threshold: 0.15 });

revealTargets.forEach((el) => revealObserver.observe(el));

}


const trailStops = [...section.querySelectorAll(".trail-stop")];

if (trailStops.length) {

const stopObserver = new IntersectionObserver((entries) => {

entries.forEach((entry, i) => {

if (entry.isIntersecting) {

setTimeout(() => entry.target.classList.add("is-visible"), i * 120);

stopObserver.unobserve(entry.target);

}

});

}, { threshold: 0.2 });

trailStops.forEach((el) => stopObserver.observe(el));

}


const statNumbers = [...section.querySelectorAll(".stat-num")];

const statsBlock = section.querySelector(".stats");

if (!statNumbers.length || !statsBlock) return;


let animated = false;

function animateStats() {

statNumbers.forEach((el) => {

const target = parseFloat(el.dataset.count || "0");

const suffix = el.dataset.suffix || "";

const duration = 1400;

const start = performance.now();

function tick(now) {

const progress = Math.min((now - start) / duration, 1);

const eased = 1 - Math.pow(1 - progress, 3);

el.textContent = Math.round(target * eased) + suffix;

if (progress < 1) requestAnimationFrame(tick);

else el.textContent = target + suffix;

}

requestAnimationFrame(tick);

});

}


const statsObserver = new IntersectionObserver((entries) => {

entries.forEach((entry) => {

if (entry.isIntersecting && !animated) {

animated = true;

animateStats();

statsObserver.unobserve(entry.target);

}

});

}, { threshold: 0.4 });

statsObserver.observe(statsBlock);

}

// ============================================
// PREMIUM IMAGE VIEWER (LIGHTBOX)
// ============================================
function initImageViewer() {

    const viewer = document.getElementById("image-viewer");
    const image = document.getElementById("viewer-image");
    const caption = document.getElementById("viewer-caption");

    const closeButton = document.getElementById("viewer-close");
    const previousButton = document.getElementById("viewer-prev");
    const nextButton = document.getElementById("viewer-next");

    const galleryImages = [...document.querySelectorAll(".gallery-image")];

    if (
        !viewer ||
        !image ||
        !caption ||
        galleryImages.length === 0
    ) {
        return;
    }

    let currentIndex = 0;

    // ----------------------------
    // OPEN
    // ----------------------------
    function openViewer(index) {

        currentIndex = index;

        image.src = galleryImages[index].src;
        image.alt = galleryImages[index].alt;

        caption.textContent = galleryImages[index].alt;

        viewer.classList.add("active");

        document.body.style.overflow = "hidden";

    }

    // ----------------------------
    // CLOSE
    // ----------------------------
    function closeViewer() {

        viewer.classList.remove("active");

        document.body.style.overflow = "";

    }

    // ----------------------------
    // SHOW IMAGE
    // ----------------------------
    function showImage(index) {

        if (index < 0) {

            currentIndex = galleryImages.length - 1;

        } else if (index >= galleryImages.length) {

            currentIndex = 0;

        } else {

            currentIndex = index;

        }

        image.src = galleryImages[currentIndex].src;
        image.alt = galleryImages[currentIndex].alt;

        caption.textContent = galleryImages[currentIndex].alt;

    }

    // ----------------------------
    // IMAGE CLICK
    // ----------------------------
    galleryImages.forEach((img, index) => {

        img.addEventListener("click", () => {

            openViewer(index);

        });

    });

    // ----------------------------
    // BUTTONS
    // ----------------------------
    closeButton.addEventListener("click", closeViewer);

    previousButton.addEventListener("click", () => {

        showImage(currentIndex - 1);

    });

    nextButton.addEventListener("click", () => {

        showImage(currentIndex + 1);

    });

    // ----------------------------
    // CLICK BACKDROP TO CLOSE
    // ----------------------------
    viewer.addEventListener("click", (event) => {

        if (
            event.target.classList.contains("image-viewer") ||
            event.target.classList.contains("image-viewer-backdrop")
        ) {

            closeViewer();

        }

    });

    // ----------------------------
    // KEYBOARD SUPPORT
    // ----------------------------
    document.addEventListener("keydown", (event) => {

        if (!viewer.classList.contains("active")) return;

        switch (event.key) {

            case "Escape":

                closeViewer();

                break;

            case "ArrowLeft":

                showImage(currentIndex - 1);

                break;

            case "ArrowRight":

                showImage(currentIndex + 1);

                break;

        }

    });

    // ----------------------------
    // SWIPE SUPPORT
    // ----------------------------
    let startX = 0;

    viewer.addEventListener("touchstart", (event) => {

        startX = event.changedTouches[0].screenX;

    });

    viewer.addEventListener("touchend", (event) => {

        const endX = event.changedTouches[0].screenX;

        if (startX - endX > 60) {

            showImage(currentIndex + 1);

        }

        if (endX - startX > 60) {

            showImage(currentIndex - 1);

        }

    });

}

// ============================================
// ATTRACTIONS SECTION — scroll reveal
// ============================================
function initAttractionsSection() {
    const section = document.getElementById("attractions");
    if (!section) return;

    const revealTargets = [...section.querySelectorAll("[data-reveal]")];
    if (!revealTargets.length) return;

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add("is-visible"), i * 60);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealTargets.forEach((el) => revealObserver.observe(el));
}

// ============================================
// GALLERY SECTION — scroll reveal
// ============================================
function initGallerySection() {
    const section = document.getElementById("gallery");
    if (!section) return;

    const revealTargets = [...section.querySelectorAll("[data-reveal]")];
    if (!revealTargets.length) return;

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add("is-visible"), i * 80);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealTargets.forEach((el) => revealObserver.observe(el));
}

// ============================================
// INITIALIZATION
// ============================================
// VISIT SECTION — scroll reveal
// ============================================
function initVisitSection() {
    const section = document.getElementById("visit");
    if (!section) return;

    const revealTargets = [...section.querySelectorAll("[data-reveal]")];
    if (!revealTargets.length) return;

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add("is-visible"), i * 60);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealTargets.forEach((el) => revealObserver.observe(el));
}

// ============================================
// HAPTIC + AUDIO FEEDBACK
// ============================================
// Real device vibration only exists where navigator.vibrate()
// exists — in practice, Android/Chrome and similar. iOS Safari
// has no web API for the Taptic Engine at all, on any version,
// so isIOSDevice always falls through to the visual "press"
// animation instead. That's a genuine platform limitation, not
// a bug — there's no supported way to fix it from JavaScript.

function triggerHaptic(element, pattern) {
    if (navigator.vibrate && !isIOSDevice) {
        if (pattern) {
            navigator.vibrate(pattern);
        } else if (
            element.classList.contains('ticket-button') ||
            element.classList.contains('hero-ticket') ||
            element.classList.contains('mobile-ticket-button')
        ) {
            navigator.vibrate([60, 20, 40]);   // Premium ticket feel
        } else {
            navigator.vibrate(45);             // Standard tap
        }
    }

    // Visual "press" feedback runs on every platform — including
    // iOS, where it's the only feedback available at all.
    element.classList.add('haptic-press');
    setTimeout(() => {
        element.classList.remove('haptic-press');
    }, 220);
}

// Button presses: haptic + sound together
function triggerPressFeedback(element) {
    triggerHaptic(element);
    playSound('audio/button-press.wav', 0.4);
}

function initHapticFeedback() {
    const selectors = [
        'button',
        'a[href^="#"]',
        '.ticket-button',
        '.hero-ticket',
        '.hero-explore',
        '.mobile-ticket-button',
        '.review-prev',
        '.review-next',
        '.review-indicator',
        '.viewer-arrow',
        '.viewer-close',
        '.mobile-toggle'
    ];

    document.querySelectorAll(selectors.join(', ')).forEach(element => {
        if (!element.dataset.hapticAdded) {
            element.addEventListener('click', () => triggerPressFeedback(element));
            element.dataset.hapticAdded = 'true';
        }
    });
}

// ============================================
// REVIEWS CAROUSEL — swipe + arrow-key feedback
// ============================================
// Fires directly off the raw touch gesture and keydown, so
// it's always a genuine, synchronous user-gesture call — no
// delayed or wrapped calls a browser might refuse to honour.
//
// This replaces two previous functions (enhanceReviewsHaptics
// and addReviewsSwipeAndAutoplayHaptics) that both tried to
// wrap window.scrollToCard to detect card changes. That never
// worked: scrollToCard is declared *inside* initReviewsCarousel,
// so it was never actually reachable as window.scrollToCard —
// both wrapping attempts were silently inert. It also meant
// review-prev/next/indicator clicks were double-registered
// (once by initHapticFeedback's selector list, again by the
// old enhanceReviewsHaptics), firing vibration twice per tap.
function initReviewsSwipeFeedback() {
    const carousel = document.querySelector(".reviews-carousel");
    if (!carousel) return;

    let touchStartX = 0;

    const swipeFeedback = () => {
        if (navigator.vibrate && !isIOSDevice) {
            navigator.vibrate([35, 20, 35]);
        }
        playSound('audio/review-swipe.wav', 0.45);
    };

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        if (Math.abs(touchStartX - touchEndX) > 40) {
            swipeFeedback();
        }
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            swipeFeedback();
        }
    });
}

//============================================
//Initialisation
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initNavbarScroll();
    initSmoothScroll();
    createBackToTop();
    initHeroParallax();
    initReviewsCarousel();
    initAboutSection();
    initEventbriteWidget();
    initImageViewer();
    initAttractionsSection();
    initGallerySection();
    initVisitSection();
    initHapticFeedback();
    initReviewsSwipeFeedback();
});

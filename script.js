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

        }, 5500);
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
// CROSS-PLATFORM HAPTICS (Android + iOS)
// ============================================

let hapticCheckbox = null;

// iOS Checkbox Hack
function triggerIOSHaptic() {
    if (!hapticCheckbox) {
        hapticCheckbox = document.getElementById('ios-haptic-trigger');
    }
    if (hapticCheckbox) {
        // Rapid toggle to trigger iOS system haptics
        hapticCheckbox.checked = true;
        setTimeout(() => {
            hapticCheckbox.checked = false;
        }, 10);
    }
}

// Main haptic function
function triggerHaptic(element) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && 'ontouchend' in document);

    // Android: Native Vibration API
    if (navigator.vibrate && !isIOS) {
        if (element.classList.contains('ticket-button') || 
            element.classList.contains('hero-ticket') || 
            element.classList.contains('mobile-ticket-button')) {
            navigator.vibrate([60, 20, 40]);   // Premium ticket feel
        } else {
            navigator.vibrate(45);             // Standard tap
        }
        return;
    }

    // iOS: Checkbox hack + visual feedback
    if (isIOS) {
        triggerIOSHaptic();
    }

    // Visual feedback for all platforms (especially iOS)
    element.classList.add('haptic-press');
    setTimeout(() => {
        element.classList.remove('haptic-press');
    }, 200);
}

// Initialize
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
            element.addEventListener('click', () => triggerHaptic(element));
            element.dataset.hapticAdded = 'true';
        }
    });
}

// ============================================
// PREMIUM REVIEWS SECTION HAPTICS (Add-on)
// ============================================

function enhanceReviewsHaptics() {
    // Carousel navigation buttons
    const prevBtn = document.querySelector('.review-prev');
    const nextBtn = document.querySelector('.review-next');
    const indicators = document.querySelectorAll('.review-indicator');

    const reviewsHaptic = (element, strength = 'medium') => {
        // Use existing triggerHaptic if available, otherwise fallback
        if (typeof triggerHaptic === 'function') {
            triggerHaptic(element, strength === 'medium' ? 'carousel' : 'light');
        } else {
            // Fallback to basic haptic if main system not loaded yet
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            if (navigator.vibrate && !isIOS) {
                navigator.vibrate(strength === 'medium' ? [35, 25, 35] : 30);
            } else if (isIOS) {
                const checkbox = document.getElementById('ios-haptic-trigger');
                if (checkbox) {
                    checkbox.checked = true;
                    setTimeout(() => checkbox.checked = false, 12);
                }
            }
        }
    };

    if (prevBtn) {
        prevBtn.addEventListener('click', () => reviewsHaptic(prevBtn, 'medium'));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => reviewsHaptic(nextBtn, 'medium'));
    }

    indicators.forEach(indicator => {
        indicator.addEventListener('click', () => reviewsHaptic(indicator, 'light'));
    });

    // Optional: Haptic when carousel auto-advances (feels premium)
    const originalScrollToCard = typeof scrollToCard === 'function' ? scrollToCard : null;
    if (originalScrollToCard) {
        window.scrollToCard = function(index) {
            const result = originalScrollToCard.call(this, index);
            
            // Light haptic on auto-advance (only when not from user click)
            const activeIndicator = document.querySelector('.review-indicator.active');
            if (activeIndicator) {
                setTimeout(() => {
                    reviewsHaptic(activeIndicator, 'light');
                }, 50);
            }
            return result;
        };
    }
}

// ============================================
// REVIEWS CAROUSEL SWIPE HAPTICS
// ============================================

function addReviewsSwipeHaptics() {
    const carousel = document.querySelector(".reviews-carousel");
    if (!carousel) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const reviewsHaptic = (strength = 'medium') => {
        if (typeof triggerHaptic === 'function') {
            // Reuse your main haptic function
            const fakeElement = document.createElement('div'); // dummy for trigger
            triggerHaptic(fakeElement, strength === 'medium' ? 'carousel' : 'light');
        } else {
            // Fallback
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            if (navigator.vibrate && !isIOS) {
                navigator.vibrate(strength === 'medium' ? [40, 30, 40] : 35);
            } else if (isIOS) {
                const checkbox = document.getElementById('ios-haptic-trigger');
                if (checkbox) {
                    checkbox.checked = true;
                    setTimeout(() => checkbox.checked = false, 15);
                }
            }
        }
    };

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;

        // Only trigger if actual swipe happened (not just tap)
        if (Math.abs(diff) > 30) {
            reviewsHaptic('medium');   // Nice swipe feedback
        }
    }, { passive: true });
}

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
    enhanceReviewsHaptics();
    addReviewsSwipeHaptics();
});


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
    let isProgrammaticScroll = false;
    let programmaticScrollResetTimer = null;

    // Dynamic paging — how many dots exist depends on how many cards
    // actually fit in view at once, which changes across breakpoints
    // (mobile shows ~1 card, desktop shows ~3). Recomputed on resize.
    let cardsPerView = 1;
    let totalDots = cards.length;
    let indicators = [];
    let activeDotIndex = 0;

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

    // ---------- LAYOUT: how many cards fit per view, right now ----------
    function measureCardsPerView() {
        const first = cards[0];
        if (!first || !carousel.clientWidth) return 1;
        const style = getComputedStyle(carousel);
        const gap = parseFloat(style.columnGap || style.gap || '0') || 0;
        const cardWidth = first.getBoundingClientRect().width;
        if (!cardWidth) return 1;
        const perView = Math.floor((carousel.clientWidth + gap) / (cardWidth + gap));
        return Math.max(1, perView);
    }

    // ---------- PILL: floating active-state indicator ----------
    const pill = document.createElement("div");
    pill.className = "review-pill";
    indicatorsContainer.appendChild(pill);
    let morphTimer = null;

    function rectFor(dotEl) {
        const containerRect = indicatorsContainer.getBoundingClientRect();
        const dotRect = dotEl.getBoundingClientRect();
        return {
            left: dotRect.left - containerRect.left,
            width: dotRect.width
        };
    }

    // Snap instantly to a dot with no animation — used on first paint
    // and after a resize regenerates the dots (so the pill doesn't
    // glide across brand-new, differently-spaced dots).
    function placePillInstantly(dotEl) {
        if (!dotEl) return;
        const r = rectFor(dotEl);
        pill.style.transition = "none";
        pill.style.left = `${r.left}px`;
        pill.style.width = `${r.width}px`;
        // Force layout so the next transition-enabled change animates
        // from this position rather than tweening from the old one.
        void pill.offsetWidth;
    }

    // Two-phase "morph": first stretch into a capsule spanning both
    // the old and new dot positions, then contract down onto the new
    // dot. Gives the pill real elastic travel between stops instead
    // of a flat slide or an instant jump.
    function morphPillTo(dotEl) {
        if (!dotEl) return;
        clearTimeout(morphTimer);

        const from = { left: pill.offsetLeft, width: pill.offsetWidth };
        const to = rectFor(dotEl);

        const spanLeft = Math.min(from.left, to.left);
        const spanWidth = Math.max(from.left + from.width, to.left + to.width) - spanLeft;

        pill.style.transition = "left .22s cubic-bezier(.4,0,.2,1), width .22s cubic-bezier(.4,0,.2,1)";
        pill.style.left = `${spanLeft}px`;
        pill.style.width = `${spanWidth}px`;

        morphTimer = setTimeout(() => {
            pill.style.transition = "left .28s cubic-bezier(.34,1.56,.64,1), width .28s cubic-bezier(.34,1.56,.64,1)";
            pill.style.left = `${to.left}px`;
            pill.style.width = `${to.width}px`;
        }, 220);
    }

    // ---------- INDICATORS: (re)generate dots for the current layout ----------
    function buildIndicators() {
        cardsPerView = measureCardsPerView();
        totalDots = Math.max(1, Math.ceil(cards.length / cardsPerView));

        indicatorsContainer.querySelectorAll(".review-indicator").forEach((el) => el.remove());

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < totalDots; i++) {
            const indicator = document.createElement("button");
            indicator.type = 'button'; // prevent default submit behavior in forms
            indicator.className = "review-indicator";
            indicator.setAttribute("aria-label", `Go to reviews, group ${i + 1} of ${totalDots}`);
            indicator.addEventListener("click", (e) => {
                if (e && typeof e.preventDefault === 'function') e.preventDefault();

                const savedY = window.scrollY;
                scrollToDot(i);
                restartAutoplay();

                // blur to avoid focus-caused scrolling
                if (e.currentTarget && typeof e.currentTarget.blur === 'function') e.currentTarget.blur();

                restoreVerticalScroll(savedY);
            });
            fragment.appendChild(indicator);
        }
        indicatorsContainer.appendChild(fragment);
        indicatorsContainer.appendChild(pill); // keep pill on top, after the dots

        indicators = [...indicatorsContainer.querySelectorAll(".review-indicator")];

        // Re-attach haptic feedback to the freshly created buttons
        // (the global init pass only ran once, at page load).
        if (typeof initHapticFeedback === 'function') initHapticFeedback();

        activeDotIndex = Math.min(activeDotIndex, totalDots - 1);
        indicators.forEach((ind, i) => ind.classList.toggle("active", i === activeDotIndex));
        placePillInstantly(indicators[activeDotIndex]);
    }

    // Jump the carousel to the scroll position that corresponds to a
    // given dot, proportionally across the full scrollable range —
    // this keeps dots meaningful no matter how the cards happen to
    // divide against however many are visible per screen.
    function scrollToDot(dotIndex) {
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        if (maxScroll <= 0) return;
        const fraction = totalDots > 1 ? dotIndex / (totalDots - 1) : 0;
        const targetLeft = fraction * maxScroll;

        isProgrammaticScroll = true;
        clearTimeout(programmaticScrollResetTimer);
        programmaticScrollResetTimer = setTimeout(() => {
            isProgrammaticScroll = false;
        }, 900);
        smoothScrollTo(carousel, targetLeft, 800);

        // Keep currentIndex (card-level) roughly in sync for
        // prev/next/keyboard stepping from this new position.
        currentIndex = Math.round(fraction * (cards.length - 1));
    }

    // Feedback for genuinely user-driven horizontal navigation
    // (swipe, trackpad, mouse-drag on the scrollbar — anything that
    // isn't a click/keypress we already give explicit feedback to).
    function carouselMoveFeedback() {
        if (navigator.vibrate && !isIOSDevice) {
            navigator.vibrate([35, 20, 35]);
        }
        playSound('audio/review-swipe.wav', 0.45);
    }

    // UPDATE ACTIVE CARD (card-level active class, used for styling
    // the currently-centred card — independent from the dots/pill).
    function updateActiveCard() {
        cards.forEach((card, index) => {
            card.classList.toggle("active", index === currentIndex);
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
                    isProgrammaticScroll = true;
                    clearTimeout(programmaticScrollResetTimer);
                    programmaticScrollResetTimer = setTimeout(() => {
                        isProgrammaticScroll = false;
                    }, 900);
                    smoothScrollTo(carousel, left, 800);
                }
            } catch (err) {
                // Fallback: don't do anything if element scroll fails
                console.warn('carousel scroll failed', err);
            }
        }

        updateActiveCard();
    }

    buildIndicators();
    updateActiveCard();

    // ---------- CONTINUOUS SCROLL TRACKING ----------
    // Both the active dot and the nearest-card feedback are driven by
    // raw scroll position on every frame, rather than per-card
    // IntersectionObserver thresholds. The threshold approach broke
    // down once several cards were visible in the viewport at once
    // (desktop): multiple cards could cross the threshold in a single
    // scroll gesture, and only the *last* observer callback to fire
    // won — the actual order isn't scroll-position-ordered, so the
    // active dot could jump around unevenly. Fractional scroll math
    // is monotonic with scroll position, so it can't do that.
    let scrollRAF = null;

    function findNearestCardIndex() {
        const carouselRect = carousel.getBoundingClientRect();
        const carouselCenter = carouselRect.left + carouselRect.width / 2;
        let nearestIndex = currentIndex;
        let nearestDist = Infinity;
        cards.forEach((card, i) => {
            const rect = card.getBoundingClientRect();
            const cardCenter = rect.left + rect.width / 2;
            const dist = Math.abs(cardCenter - carouselCenter);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestIndex = i;
            }
        });
        return nearestIndex;
    }

    function handleScrollTick() {
        scrollRAF = null;

        // Active dot from continuous scroll fraction
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        const fraction = maxScroll > 0 ? Math.max(0, Math.min(1, carousel.scrollLeft / maxScroll)) : 0;
        const nextDot = totalDots > 1 ? Math.round(fraction * (totalDots - 1)) : 0;

        if (nextDot !== activeDotIndex) {
            activeDotIndex = nextDot;
            indicators.forEach((ind, i) => ind.classList.toggle("active", i === activeDotIndex));
            morphPillTo(indicators[activeDotIndex]);
        }

        // Nearest-card tracking, for haptic/sound feedback + keeping
        // currentIndex accurate for prev/next/keyboard stepping.
        const nearest = findNearestCardIndex();
        if (nearest !== currentIndex) {
            currentIndex = nearest;
            updateActiveCard();
            if (!isProgrammaticScroll) {
                carouselMoveFeedback();
            }
        }
    }

    carousel.addEventListener('scroll', () => {
        if (scrollRAF) return;
        scrollRAF = requestAnimationFrame(handleScrollTick);
    }, { passive: true });

    // ---------- RESIZE: cards-per-view (and so dot count) changes across breakpoints ----------
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;
            const fraction = maxScroll > 0 ? carousel.scrollLeft / maxScroll : 0;
            buildIndicators();
            activeDotIndex = totalDots > 1 ? Math.round(fraction * (totalDots - 1)) : 0;
            indicators.forEach((ind, i) => ind.classList.toggle("active", i === activeDotIndex));
            placePillInstantly(indicators[activeDotIndex]);
        }, 150);
    });

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

            // Light haptic + quiet sound on auto-advance. Note: many
            // browsers will silently ignore the vibration since it's
            // not a direct user gesture — that's an intentional
            // browser security policy (vibrate() is gated behind
            // user activation), not something fixable from this side
            // of the API. The sound isn't gated the same way, so it
            // should still play.
            if (navigator.vibrate && !isIOSDevice) {
                navigator.vibrate(25);
            }
            playSound('audio/review-swipe.wav', 0.3);

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
            carouselMoveFeedback();
            restoreVerticalScroll(savedY);
        }
        if (event.key === "ArrowRight") {
            const savedY = window.scrollY;
            scrollToCard(currentIndex + 1);
            restartAutoplay();
            carouselMoveFeedback();
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

            triggerPressFeedback(img);
            openViewer(index);

        });

    });

    // ----------------------------
    // BUTTONS
    // ----------------------------
    // Marked hapticAdded directly so initHapticFeedback's generic
    // 'button' selector (which would otherwise also match these)
    // skips them instead of registering a second click listener.
    closeButton.dataset.hapticAdded = 'true';
    previousButton.dataset.hapticAdded = 'true';
    nextButton.dataset.hapticAdded = 'true';

    closeButton.addEventListener("click", () => {
        triggerPressFeedback(closeButton);
        closeViewer();
    });

    previousButton.addEventListener("click", () => {

        triggerPressFeedback(previousButton);
        showImage(currentIndex - 1);

    });

    nextButton.addEventListener("click", () => {

        triggerPressFeedback(nextButton);
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
        '.mobile-toggle'
    ];

    document.querySelectorAll(selectors.join(', ')).forEach(element => {
        if (!element.dataset.hapticAdded) {
            element.addEventListener('click', () => triggerPressFeedback(element));
            element.dataset.hapticAdded = 'true';
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
});

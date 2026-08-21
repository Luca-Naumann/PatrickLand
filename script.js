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

// ============================================
// AUDIO UNLOCK
// Browsers only allow audio.play() during, or shortly after, a
// real user gesture (click/tap/key press) — a call fired later
// by a setInterval (like carousel autoplay) has no gesture behind
// it and gets silently rejected. Most browsers treat that unlock
// as page-wide and one-time though: play (and instantly stop) one
// real sound on the very first gesture anywhere on the page, and
// every subsequent programmatic play() — including unattended
// autoplay ticks — is allowed for the rest of the session. This
// listens as early and as broadly as possible (capture phase, on
// the very first pointerdown/touchstart/keydown/click anywhere)
// so it fires before the user necessarily reaches any specific
// button — even starting to swipe the carousel itself counts.
(function setupAudioUnlock() {
    let unlocked = false;

    function unlock() {
        if (unlocked) return;
        unlocked = true;
        try {
            const primer = new Audio('audio/review-swipe.wav');
            primer.volume = 0;
            const p = primer.play();
            if (p && typeof p.then === 'function') {
                p.then(() => { primer.pause(); primer.currentTime = 0; }).catch(() => {});
            }
        } catch (err) { /* ignore */ }

        // Vibration is gated per-call in stricter browsers (not a
        // one-time unlock like audio), but priming it here costs
        // nothing and helps in browsers that do treat it as sticky.
        if (navigator.vibrate) {
            try { navigator.vibrate(1); } catch (err) { /* ignore */ }
        }

        document.removeEventListener('pointerdown', unlock, true);
        document.removeEventListener('touchstart', unlock, true);
        document.removeEventListener('keydown', unlock, true);
    }

    document.addEventListener('pointerdown', unlock, true);
    document.addEventListener('touchstart', unlock, true);
    document.addEventListener('keydown', unlock, true);
})();

// Custom eased scroll, used instead of the browser's built-in
// scrollTo({behavior:'smooth'}) for the reviews carousel. The
// native version's duration/easing isn't controllable and reads
// as fast/snappy; this gives a slower, deliberate, more premium
// glide between cards — quick to get moving, then a long,
// luxurious settle into place rather than a symmetric ease.
function smoothScrollTo(element, targetLeft, duration = 1200) {
    const startLeft = element.scrollLeft;
    const distance = targetLeft - startLeft;
    const startTime = performance.now();

    function easeOutQuint(t) {
        return 1 - Math.pow(1 - t, 5);
    }

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        element.scrollLeft = startLeft + distance * easeOutQuint(progress);
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
    const realCards = [...document.querySelectorAll(".review-card")];
    const indicatorsContainer = document.getElementById("reviewIndicators");

    const previousButton = document.querySelector(".review-prev");
    const nextButton = document.querySelector(".review-next");

    if (!carousel || realCards.length === 0 || !indicatorsContainer) return;

    const realCount = realCards.length;

    // ---------- INFINITE LOOP SETUP ----------
    // Clone the full set once before and once after the real cards, so
    // scrolling past either end lands on a pixel-identical clone
    // rather than a hard stop. Once scrolling has drifted deep enough
    // into a clone block we silently jump the scroll position by
    // exactly one block-width — since every block is an exact visual
    // duplicate of the real one, the jump is imperceptible, and the
    // carousel feels endless in both directions.
    function cloneBlock() {
        const frag = document.createDocumentFragment();
        realCards.forEach((card) => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.dataset.clone = 'true';
            clone.querySelectorAll('a,button,input,textarea,select').forEach((el) => el.setAttribute('tabindex', '-1'));
            frag.appendChild(clone);
        });
        return frag;
    }

    carousel.insertBefore(cloneBlock(), carousel.firstChild);
    carousel.appendChild(cloneBlock());

    // All 3 blocks (before-clones / real / after-clones), real block
    // sits in the middle third at indices [realCount, realCount*2).
    const cards = [...carousel.querySelectorAll(".review-card")];
    const beforeStart = cards[0];
    const realStart = cards[realCount];

    let autoplayTimer = null;
    let isProgrammaticScroll = false;
    let programmaticScrollResetTimer = null;

    // Dynamic paging — how many dots exist depends on how many cards
    // actually fit in view at once, which changes across breakpoints
    // (mobile shows ~1 card, desktop shows ~3). Recomputed on resize.
    let cardsPerView = 1;
    let totalDots = realCount;
    let indicators = [];
    let activeDotIndex = 0;
    let wrapWidth = 0;
    let lastNearestDom = realCount;

    const reviewsSection = document.getElementById("reviews");
    let reviewsVisible = false;

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
            { threshold: 0.35 }
        );
        sectionObserver.observe(reviewsSection);
    }

    // helper: restore vertical scroll position after actions that may cause focus/anchor jumps
    function restoreVerticalScroll(savedY) {
        setTimeout(() => {
            if (Number.isFinite(savedY)) {
                window.scrollTo(window.scrollX, savedY);
            }
        }, 10);
    }

    // ---------- LAYOUT ----------
    function measureCardsPerView() {
        const first = realCards[0];
        if (!first || !carousel.clientWidth) return 1;
        const style = getComputedStyle(carousel);
        const gap = parseFloat(style.columnGap || style.gap || '0') || 0;
        const cardWidth = first.getBoundingClientRect().width;
        if (!cardWidth) return 1;
        const perView = Math.floor((carousel.clientWidth + gap) / (cardWidth + gap));
        return Math.max(1, perView);
    }

    // Distance from the start of the before-clones block to the start
    // of the real block. Scroll-position independent (both edges move
    // together with scrollLeft, so their difference doesn't), and —
    // since the clone block is an exact duplicate — also exactly the
    // width of one full block, i.e. how far to silently jump when
    // wrapping.
    function measureWrapWidth() {
        return realStart.getBoundingClientRect().left - beforeStart.getBoundingClientRect().left;
    }

    // Centre a given card in the viewport. Self-relative (works from
    // whatever the current scrollLeft happens to be), and used for
    // every navigation — initial paint, buttons, keyboard, dots,
    // autoplay — so nothing ever "un-centres" itself between moves.
    function getScrollLeftForCard(cardEl) {
        const carouselRect = carousel.getBoundingClientRect();
        const cardRect = cardEl.getBoundingClientRect();
        const delta = (cardRect.left - carouselRect.left) - (carousel.clientWidth - cardRect.width) / 2;
        return carousel.scrollLeft + delta;
    }

    function findNearestDomIndex() {
        const carouselRect = carousel.getBoundingClientRect();
        const carouselCenter = carouselRect.left + carouselRect.width / 2;
        let nearestIndex = lastNearestDom;
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
        totalDots = Math.max(1, Math.ceil(realCount / cardsPerView));

        indicatorsContainer.querySelectorAll(".review-indicator").forEach((el) => el.remove());

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < totalDots; i++) {
            const indicator = document.createElement("button");
            indicator.type = 'button';
            indicator.className = "review-indicator";
            indicator.setAttribute("aria-label", `Go to reviews, group ${i + 1} of ${totalDots}`);
            indicator.addEventListener("click", (e) => {
                if (e && typeof e.preventDefault === 'function') e.preventDefault();
                const savedY = window.scrollY;
                scrollToDot(i);
                restartAutoplay();
                if (e.currentTarget && typeof e.currentTarget.blur === 'function') e.currentTarget.blur();
                restoreVerticalScroll(savedY);
            });
            fragment.appendChild(indicator);
        }
        indicatorsContainer.appendChild(fragment);
        indicatorsContainer.appendChild(pill);

        indicators = [...indicatorsContainer.querySelectorAll(".review-indicator")];

        if (typeof initHapticFeedback === 'function') initHapticFeedback();

        activeDotIndex = Math.min(activeDotIndex, totalDots - 1);
        indicators.forEach((ind, i) => ind.classList.toggle("active", i === activeDotIndex));
        placePillInstantly(indicators[activeDotIndex]);
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

    function updateActiveCardByDom(domIndex) {
        cards.forEach((card, index) => {
            card.classList.toggle("active", index === domIndex);
        });
    }

    // SCROLL TO CARD — targets any of the 3x cloned DOM cards directly,
    // no clamping/wrapping to the real 0..N-1 range. That's what makes
    // navigation feel endless: stepping past the last real card just
    // continues smoothly into its clone rather than snapping back.
    function scrollToCard(domIndex, instant) {
        const clamped = Math.max(0, Math.min(cards.length - 1, domIndex));
        const targetCard = cards[clamped];
        if (!targetCard) return;

        try {
            const targetLeft = getScrollLeftForCard(targetCard);

            if (instant) {
                carousel.scrollLeft = targetLeft;
            } else if (carousel.scrollWidth > carousel.clientWidth) {
                isProgrammaticScroll = true;
                clearTimeout(programmaticScrollResetTimer);
                programmaticScrollResetTimer = setTimeout(() => {
                    isProgrammaticScroll = false;
                    checkWrapCorrection();
                }, 1300);
                smoothScrollTo(carousel, targetLeft, 1200);
            }
        } catch (err) {
            console.warn('carousel scroll failed', err);
        }

        lastNearestDom = clamped;
        updateActiveCardByDom(clamped);
    }

    // Step by one real card from wherever we currently are (freshly
    // measured each time, never a stored counter that could drift out
    // of sync with the actual scroll position).
    function stepCard(delta) {
        scrollToCard(findNearestDomIndex() + delta);
    }

    // Dot clicks target the start of that dot's page of cards, at
    // whichever of the 3 cloned occurrences is closest to where the
    // carousel currently is — keeps dot navigation short and smooth
    // instead of always jumping back to the canonical middle block.
    function scrollToDot(dotIndex) {
        const targetReal = Math.min(realCount - 1, dotIndex * cardsPerView);
        const nearestDom = findNearestDomIndex();
        const nearestReal = ((nearestDom % realCount) + realCount) % realCount;
        const blockStart = nearestDom - nearestReal;
        scrollToCard(blockStart + targetReal);
    }

    // ---------- WRAP CORRECTION ----------
    // Once scroll has drifted deep enough into a clone block, jump by
    // exactly one block-width to land on the pixel-identical position
    // one block over — invisible, since every block matches. Only
    // ever runs once scrolling has genuinely settled (never mid-drag,
    // mid-momentum, or mid-animation), so it can never fight native
    // snap/momentum physics or an in-flight smoothScrollTo.
    function checkWrapCorrection() {
        if (isProgrammaticScroll || wrapWidth <= 0) return;
        if (carousel.scrollLeft < wrapWidth * 0.5) {
            carousel.scrollLeft += wrapWidth;
        } else if (carousel.scrollLeft > wrapWidth * 2.5) {
            carousel.scrollLeft -= wrapWidth;
        }
    }

    // ---------- MOTION BLUR ----------
    // A touch of directional blur while the carousel is actually
    // moving fast — velocity-driven (not a fixed pulse), so a slow
    // drag stays crisp and a fast flick blurs noticeably, then clears
    // the moment motion stops. Applies equally to manual drag and the
    // programmatic glide (both just move scrollLeft, which is all
    // this reads), so autoplay and button/keyboard transitions get
    // the same cinematic treatment as a swipe.
    let lastBlurScrollLeft = carousel.scrollLeft;
    let lastBlurTime = performance.now();
    let blurClearTimer = null;

    function updateMotionBlur() {
        const now = performance.now();
        const dt = Math.max(1, now - lastBlurTime);
        const dx = Math.abs(carousel.scrollLeft - lastBlurScrollLeft);
        const velocity = dx / dt;
        lastBlurScrollLeft = carousel.scrollLeft;
        lastBlurTime = now;

        const blurAmount = Math.min(6, velocity * 14);
        carousel.style.filter = blurAmount > 0.25 ? `blur(${blurAmount.toFixed(2)}px)` : '';

        clearTimeout(blurClearTimer);
        blurClearTimer = setTimeout(() => {
            carousel.style.filter = '';
        }, 90);
    }

    // ---------- INITIAL LAYOUT ----------
    buildIndicators();
    carousel.scrollLeft = 0;
    wrapWidth = measureWrapWidth();
    carousel.scrollLeft = getScrollLeftForCard(realCards[0]);
    lastNearestDom = realCount;
    updateActiveCardByDom(realCount);

    // ---------- CONTINUOUS SCROLL TRACKING ----------
    // Both the active dot and the nearest-card feedback are driven by
    // raw scroll position on every frame, rather than per-card
    // IntersectionObserver thresholds. The threshold approach broke
    // down once several cards were visible in the viewport at once
    // (desktop): multiple cards could cross the threshold in a single
    // scroll gesture, and only the *last* observer callback to fire
    // won — the actual order isn't scroll-position-ordered, so the
    // active dot could jump around unevenly.
    let scrollRAF = null;
    let settleTimer = null;

    function handleScrollTick() {
        scrollRAF = null;

        updateMotionBlur();

        const nearestDom = findNearestDomIndex();
        if (nearestDom !== lastNearestDom) {
            lastNearestDom = nearestDom;
            updateActiveCardByDom(nearestDom);
            if (!isProgrammaticScroll) {
                carouselMoveFeedback();
            }
        }

        const nearestReal = ((nearestDom % realCount) + realCount) % realCount;
        const nextDot = Math.min(totalDots - 1, Math.floor(nearestReal / cardsPerView));
        if (nextDot !== activeDotIndex) {
            activeDotIndex = nextDot;
            indicators.forEach((ind, i) => ind.classList.toggle("active", i === activeDotIndex));
            morphPillTo(indicators[activeDotIndex]);
        }
    }

    carousel.addEventListener('scroll', () => {
        if (!scrollRAF) scrollRAF = requestAnimationFrame(handleScrollTick);

        clearTimeout(settleTimer);
        settleTimer = setTimeout(checkWrapCorrection, 140);
    }, { passive: true });

    // ---------- RESIZE: cards-per-view (and so dot count + wrap width) changes across breakpoints ----------
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const nearestDom = findNearestDomIndex();
            buildIndicators();
            wrapWidth = measureWrapWidth();
            scrollToCard(nearestDom, true);

            const nearestReal = ((nearestDom % realCount) + realCount) % realCount;
            activeDotIndex = Math.min(totalDots - 1, Math.floor(nearestReal / cardsPerView));
            indicators.forEach((ind, i) => ind.classList.toggle("active", i === activeDotIndex));
            placePillInstantly(indicators[activeDotIndex]);
        }, 150);
    });

    // AUTOPLAY
    function startAutoplay() {
        if (autoplayTimer) return;
        if (!reviewsVisible) return;

        autoplayTimer = setInterval(() => {
            if (!reviewsVisible) return;

            stepCard(1);

            // Light haptic + quiet sound on auto-advance. Vibration on
            // an unattended timer tick (no user gesture behind it) is
            // gated behind user-activation in stricter browsers and
            // may be silently ignored regardless — that's an
            // intentional platform security policy, not something
            // fixable from here. The audio-unlock listener above
            // means the sound itself should still play.
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
            stepCard(-1);
            restartAutoplay();
            if (e.currentTarget && typeof e.currentTarget.blur === 'function') e.currentTarget.blur();
            restoreVerticalScroll(savedY);
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", (e) => {
            if (e && typeof e.preventDefault === 'function') e.preventDefault();
            const savedY = window.scrollY;
            stepCard(1);
            restartAutoplay();
            if (e.currentTarget && typeof e.currentTarget.blur === 'function') e.currentTarget.blur();
            restoreVerticalScroll(savedY);
        });
    }

    // KEYBOARD SUPPORT
    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
            const savedY = window.scrollY;
            stepCard(-1);
            restartAutoplay();
            carouselMoveFeedback();
            restoreVerticalScroll(savedY);
        }
        if (event.key === "ArrowRight") {
            const savedY = window.scrollY;
            stepCard(1);
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

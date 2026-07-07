/**
 * Landing page navigation, scroll spy, and mobile menu.
 */
const LandingNav = (() => {
    'use strict';

    const SECTION_IDS = ['home', 'aboutus', 'our-feature', 'how-it-work', 'start-planing'];
    const ACTIVE_CLASS = 'menu__item--active';
    const SCROLL_BUFFER = 16;
    const ANIMATION_MS = 550;

    function menuItems() {
        return document.querySelectorAll('.menu__item');
    }

    function header() {
        return document.getElementById('site-header');
    }

    function removeActiveClass() {
        document.querySelectorAll(`.${ACTIVE_CLASS}`).forEach((item) => {
            item.classList.remove(ACTIVE_CLASS);
        });
    }

    function setActiveItem(sectionKey) {
        if (!sectionKey) return;
        removeActiveClass();
        document.querySelectorAll(`.menu__item[data-section="${sectionKey}"]`).forEach((item) => {
            item.classList.add(ACTIVE_CLASS);
        });
    }

    function getHeaderHeight() {
        return header()?.offsetHeight || 0;
    }

    function findSection(sectionKey) {
        return document.querySelector(`#${sectionKey}, .${sectionKey}`);
    }

    function animateSection(target) {
        if (!target) return;
        target.classList.remove('section-enter');
        void target.offsetWidth;
        target.classList.add('section-enter');
        window.setTimeout(() => target.classList.remove('section-enter'), ANIMATION_MS);
    }

    function scrollToSection(target) {
        if (!target) return;
        const offset = target.offsetTop - getHeaderHeight() - SCROLL_BUFFER;
        window.scrollTo({ top: offset, behavior: 'smooth' });
        animateSection(target);
    }

    function scrollToSectionByHash(hash) {
        const sectionKey = (hash || '').replace('#', '');
        if (!sectionKey) return;
        const target = findSection(sectionKey);
        if (!target) return;
        setActiveItem(sectionKey);
        scrollToSection(target);
    }

    function handleMenuClick(event) {
        const item = event.currentTarget;
        const sectionKey = item.getAttribute('data-section');
        const target = findSection(sectionKey);
        if (!target) return;

        event.preventDefault();
        setActiveItem(sectionKey);
        scrollToSection(target);
        history.replaceState(null, '', `#${sectionKey}`);
        MobileNav.close();
    }

    function setActiveByScrollPosition() {
        const sections = SECTION_IDS.map(findSection).filter(Boolean);
        if (!sections.length) return;

        const scrollPos = window.scrollY + getHeaderHeight() + 20;
        const pageBottom = Math.ceil(window.innerHeight + window.scrollY);
        const docHeight = Math.ceil(document.documentElement.scrollHeight);
        let currentKey = null;

        if (pageBottom >= docHeight - 2) {
            const last = sections[sections.length - 1];
            currentKey = last.id || last.classList[0] || null;
        } else {
            for (let i = 0; i < sections.length; i++) {
                const sec = sections[i];
                const next = sections[i + 1];
                if (scrollPos >= sec.offsetTop && scrollPos < (next ? next.offsetTop : Infinity)) {
                    currentKey = sec.id || sec.classList[0] || null;
                    break;
                }
            }
        }

        if (currentKey) setActiveItem(currentKey);
    }

    function initIntersectionObserver() {
        const sections = SECTION_IDS.map(findSection).filter(Boolean);
        if (!sections.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const id = entry.target.id || entry.target.classList[0] || '';
                setActiveItem(id);
            });
        }, { rootMargin: '-30% 0px -60% 0px', threshold: [0, 0.15, 0.3, 0.6] });

        sections.forEach((section) => observer.observe(section));
    }

    function initHeaderScroll() {
        const siteHeader = document.getElementById('site-header');
        if (!siteHeader) return;

        const onScroll = () => {
            siteHeader.classList.toggle('is-scrolled', window.scrollY > 12);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    function bindMenuItems() {
        menuItems().forEach((item) => {
            item.addEventListener('click', handleMenuClick);
        });
    }

    function initLandingPage() {
        const onLanding = findSection('home');
        if (!onLanding) {
            removeActiveClass();
            return;
        }

        scrollToSectionByHash(window.location.hash);
        initIntersectionObserver();
        initHeaderScroll();
        window.addEventListener('scroll', setActiveByScrollPosition, { passive: true });
    }

    function init() {
        bindMenuItems();
        window.addEventListener('DOMContentLoaded', initLandingPage);
        window.addEventListener('load', () => {
            requestAnimationFrame(() => scrollToSectionByHash(window.location.hash));
        });
        window.addEventListener('hashchange', () => scrollToSectionByHash(window.location.hash));
    }

    return { init };
})();

const MobileNav = (() => {
    'use strict';

    let isOpen = false;

    function elements() {
        return {
            toggle: document.getElementById('nav-toggle'),
            panel: document.getElementById('nav-mobile-panel'),
            openIcon: document.getElementById('nav-toggle-open'),
            closeIcon: document.getElementById('nav-toggle-close'),
        };
    }

    function setState(open) {
        const { toggle, panel, openIcon, closeIcon } = elements();
        if (!toggle || !panel) return;

        isOpen = open;
        panel.classList.toggle('hidden', !open);
        openIcon?.classList.toggle('hidden', open);
        closeIcon?.classList.toggle('hidden', !open);
        toggle.setAttribute('aria-expanded', String(open));
    }

    function close() {
        setState(false);
    }

    function toggleMenu() {
        setState(!isOpen);
    }

    function init() {
        const { toggle } = elements();
        if (!toggle) return;

        toggle.addEventListener('click', toggleMenu);
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') close();
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) close();
        });
    }

    return { init, close };
})();

document.addEventListener('DOMContentLoaded', () => {
    LandingNav.init();
    MobileNav.init();
});

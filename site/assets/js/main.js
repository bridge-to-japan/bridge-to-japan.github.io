(() => {
  "use strict";

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  let lastFocusedBeforeMenu = null;

  const getFocusable = (container) => Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((item) => !item.hidden && item.offsetParent !== null);

  const closeMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "메뉴 열기");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
    if (lastFocusedBeforeMenu instanceof HTMLElement) lastFocusedBeforeMenu.focus();
  };

  const openMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    lastFocusedBeforeMenu = document.activeElement;
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "메뉴 닫기");
    mobileMenu.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
    getFocusable(mobileMenu)[0]?.focus();
  };

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  mobileMenu?.addEventListener("click", (event) => {
    if (event.target.closest("a[href]")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (!mobileMenu || mobileMenu.getAttribute("aria-hidden") !== "false") return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = getFocusable(mobileMenu);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) closeMenu();
  });

  const customerReviewVideos = Array.from(document.querySelectorAll(".video-review-card video"));
  customerReviewVideos.forEach((video) => {
    video.addEventListener("play", () => {
      customerReviewVideos.forEach((otherVideo) => {
        if (otherVideo !== video && !otherVideo.paused) otherVideo.pause();
      });
    });
  });

  const anchorVeil = document.createElement("div");
  anchorVeil.className = "anchor-transition-veil";
  anchorVeil.setAttribute("aria-hidden", "true");
  document.body.append(anchorVeil);

  let anchorTransitionLocked = false;
  const waitForAnchorTransition = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));
  const waitForAnchorFrame = () => new Promise((resolve) => window.requestAnimationFrame(resolve));

  const updateAnchorHistory = (hash) => {
    const nextUrl = `${window.location.pathname}${window.location.search}${hash}`;
    const method = window.location.hash === hash ? "replaceState" : "pushState";
    window.history[method](window.history.state, "", nextUrl);
  };

  const scrollToAnchor = (target, hash) => {
    updateAnchorHistory(hash);
    target.scrollIntoView({ behavior: "auto", block: "start" });
  };

  const focusAnchorTarget = (target, showFocusRing) => {
    const focusTarget = target.querySelector("h1, h2, h3") || target;
    if (!(focusTarget instanceof HTMLElement)) return;
    const hadTabindex = focusTarget.hasAttribute("tabindex");
    if (!hadTabindex) focusTarget.setAttribute("tabindex", "-1");
    if (!showFocusRing) focusTarget.classList.add("anchor-focus-silent");
    focusTarget.focus({ preventScroll: true });
    focusTarget.addEventListener("blur", () => {
      if (!hadTabindex) focusTarget.removeAttribute("tabindex");
      focusTarget.classList.remove("anchor-focus-silent");
    }, { once: true });
  };

  const revealAnchorTarget = (target) => {
    const arrivalTarget = target.querySelector(":scope > .container") || target;
    arrivalTarget.classList.remove("anchor-arrival");
    window.requestAnimationFrame(() => {
      arrivalTarget.classList.add("anchor-arrival");
      window.setTimeout(() => arrivalTarget.classList.remove("anchor-arrival"), 520);
    });
  };

  const moveToAnchor = async (target, hash, showFocusRing) => {
    if (reducedMotion.matches) {
      scrollToAnchor(target, hash);
      focusAnchorTarget(target, showFocusRing);
      return;
    }

    anchorTransitionLocked = true;
    root.classList.add("is-anchor-transitioning");
    anchorVeil.classList.remove("is-revealing");

    try {
      await waitForAnchorFrame();
      anchorVeil.classList.add("is-covering");
      await waitForAnchorTransition(230);

      scrollToAnchor(target, hash);
      await waitForAnchorFrame();
      await waitForAnchorFrame();
      focusAnchorTarget(target, showFocusRing);
      revealAnchorTarget(target);

      anchorVeil.classList.remove("is-covering");
      anchorVeil.classList.add("is-revealing");
      await waitForAnchorTransition(390);
    } catch {
      scrollToAnchor(target, hash);
      focusAnchorTarget(target, showFocusRing);
    } finally {
      anchorVeil.classList.remove("is-covering", "is-revealing");
      root.classList.remove("is-anchor-transitioning");
      anchorTransitionLocked = false;
    }
  };

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const eventTarget = event.target instanceof Element ? event.target : null;
    const link = eventTarget?.closest('a[href*="#"]');
    if (!link || link.matches(".skip-link, [download], [data-no-anchor-transition]") || (link.target && link.target !== "_self")) return;

    const url = new URL(link.href, window.location.href);
    if (!url.hash || url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.search !== window.location.search) return;

    let targetId;
    try {
      targetId = decodeURIComponent(url.hash.slice(1));
    } catch {
      return;
    }
    const target = document.getElementById(targetId);
    if (!target) return;

    event.preventDefault();
    if (anchorTransitionLocked) return;
    moveToAnchor(target, url.hash, event.detail === 0);
  });

  root.classList.add("motion-ready");
  const revealItems = Array.from(document.querySelectorAll(".reveal"));
  document.querySelectorAll(".reveal-group").forEach((group) => {
    Array.from(group.children).forEach((item, index) => {
      item.style.setProperty("--reveal-index", String(Math.min(index, 5)));
    });
  });

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    }, { rootMargin: "-6% 0px -12%", threshold: 0.06 });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const differenceShowcase = document.querySelector(".difference-showcase");
  const differenceVisual = document.querySelector(".difference-visual");
  const differenceList = document.querySelector(".difference-list");
  const differenceItems = Array.from(document.querySelectorAll("[data-difference-item]"));
  const differenceSlides = Array.from(document.querySelectorAll("[data-difference-slide]"));
  const differenceKicker = document.querySelector("[data-difference-kicker]");
  const differenceTitle = document.querySelector("[data-difference-title]");
  const differenceIndex = document.querySelector("[data-difference-index]");
  const differenceProgress = document.querySelector("[data-difference-progress]");
  let activeDifferenceIndex = -1;
  let differenceCaptionTimer = 0;

  const clampStoryValue = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  const animateDifferenceCaption = () => {
    if (!differenceVisual || reducedMotion.matches) return;
    differenceVisual.classList.remove("is-caption-changing");
    window.requestAnimationFrame(() => {
      differenceVisual.classList.add("is-caption-changing");
      window.clearTimeout(differenceCaptionTimer);
      differenceCaptionTimer = window.setTimeout(() => differenceVisual.classList.remove("is-caption-changing"), 390);
    });
  };

  const activateDifference = (index, options = {}) => {
    const safeIndex = Math.max(0, Math.min(index, differenceItems.length - 1));
    const changed = safeIndex !== activeDifferenceIndex;
    activeDifferenceIndex = safeIndex;
    differenceItems.forEach((item, itemIndex) => item.classList.toggle("is-active", itemIndex === safeIndex));
    differenceSlides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === safeIndex));
    const active = differenceItems[safeIndex];
    const number = String(safeIndex + 1).padStart(2, "0");
    if (differenceKicker) differenceKicker.textContent = `${number} / ${String(differenceItems.length).padStart(2, "0")} · ${active?.dataset.visualLabel || ""}`;
    if (differenceTitle) differenceTitle.textContent = active?.dataset.visualTitle || "";
    if (differenceIndex) differenceIndex.textContent = number;
    if (differenceProgress && !options.keepProgress) differenceProgress.style.width = `${((safeIndex + 1) / differenceItems.length) * 100}%`;
    if (changed) animateDifferenceCaption();
  };

  const clearDifferenceStoryStyles = () => {
    differenceShowcase?.classList.remove("is-scroll-driven");
    differenceItems.forEach((item) => {
      item.style.removeProperty("--item-progress");
      item.style.removeProperty("opacity");
      item.style.removeProperty("transform");
    });
    differenceSlides.forEach((slide) => {
      ["--slide-opacity", "--slide-scale", "--slide-shift", "--slide-inset", "filter", "z-index"].forEach((property) => slide.style.removeProperty(property));
    });
    differenceVisual?.style.removeProperty("--story-accent-x");
  };

  const syncDifferenceStory = () => {
    if (!differenceShowcase || !differenceVisual || !differenceList || !differenceItems.length || !differenceSlides.length) return;
    differenceShowcase.classList.add("is-scroll-driven");
    const viewportAnchor = window.innerHeight * .52;
    const itemRects = differenceItems.map((item) => item.getBoundingClientRect());
    const distances = itemRects.map((rect) => (rect.top + rect.height / 2 - viewportAnchor) / Math.max(window.innerHeight * .7, rect.height));
    const nearestIndex = distances.reduce((nearest, distance, index) => (
      Math.abs(distance) < Math.abs(distances[nearest]) ? index : nearest
    ), 0);
    activateDifference(nearestIndex, { keepProgress: true });

    const firstCenter = itemRects[0].top + itemRects[0].height / 2;
    const lastRect = itemRects[itemRects.length - 1];
    const lastCenter = lastRect.top + lastRect.height / 2;
    const storyProgress = clampStoryValue((viewportAnchor - firstCenter) / Math.max(lastCenter - firstCenter, 1));
    if (differenceProgress) differenceProgress.style.width = `${(storyProgress * 100).toFixed(2)}%`;
    differenceVisual.style.setProperty("--story-accent-x", `${18 + storyProgress * 64}%`);

    differenceItems.forEach((item, index) => {
      const distance = distances[index];
      const away = clampStoryValue(Math.abs(distance));
      const intensity = 1 - away;
      const localProgress = clampStoryValue((viewportAnchor - itemRects[index].top) / Math.max(itemRects[index].height, 1));
      item.style.setProperty("--item-progress", localProgress.toFixed(3));
      item.style.transform = `translate3d(0, ${(clampStoryValue(distance, -1, 1) * 14).toFixed(2)}px, 0)`;

      const slide = differenceSlides[index];
      if (!slide) return;
      const slideOpacity = clampStoryValue(1 - Math.abs(distance) * 1.08);
      slide.style.setProperty("--slide-opacity", slideOpacity.toFixed(3));
      slide.style.setProperty("--slide-scale", (1 + away * .055).toFixed(4));
      slide.style.setProperty("--slide-shift", `${(clampStoryValue(distance, -1, 1) * 24).toFixed(2)}px`);
      slide.style.setProperty("--slide-inset", `${(away * 3.5).toFixed(2)}%`);
      slide.style.filter = `saturate(${(.84 + intensity * .16).toFixed(3)}) brightness(${(.82 + intensity * .18).toFixed(3)})`;
      slide.style.zIndex = String(Math.round(intensity * 10) + 1);
    });
  };

  if (differenceItems.length && differenceSlides.length) {
    activateDifference(0);
    if ("IntersectionObserver" in window) {
      const differenceStates = new Map();
      const differenceObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => differenceStates.set(entry.target, entry));
        if (window.innerWidth >= 1024 && !reducedMotion.matches) return;
        const activeEntry = Array.from(differenceStates.values())
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            const viewportAnchor = window.innerHeight * .5;
            const aCenter = a.boundingClientRect.top + a.boundingClientRect.height / 2;
            const bCenter = b.boundingClientRect.top + b.boundingClientRect.height / 2;
            return Math.abs(aCenter - viewportAnchor) - Math.abs(bCenter - viewportAnchor);
          })[0];
        if (activeEntry) activateDifference(differenceItems.indexOf(activeEntry.target));
      }, { rootMargin: "-18% 0px -38%", threshold: [0, .08, .35] });
      differenceItems.forEach((item) => differenceObserver.observe(item));
    }

    let differenceFrame = 0;
    let differenceStoryNearby = !("IntersectionObserver" in window);
    let differenceStoryMode = null;
    const scheduleDifferenceStory = () => {
      if (!differenceStoryMode || !differenceStoryNearby || differenceFrame) return;
      differenceFrame = window.requestAnimationFrame(() => {
        differenceFrame = 0;
        syncDifferenceStory();
      });
    };

    const updateDifferenceStoryMode = () => {
      const nextMode = window.innerWidth >= 1024 && window.innerHeight >= 621 && !reducedMotion.matches;
      if (nextMode === differenceStoryMode) {
        scheduleDifferenceStory();
        return;
      }
      differenceStoryMode = nextMode;
      if (!differenceStoryMode) {
        if (differenceFrame) window.cancelAnimationFrame(differenceFrame);
        differenceFrame = 0;
        clearDifferenceStoryStyles();
        return;
      }
      scheduleDifferenceStory();
    };

    if (differenceShowcase && "IntersectionObserver" in window) {
      const differenceRangeObserver = new IntersectionObserver(([entry]) => {
        differenceStoryNearby = Boolean(entry?.isIntersecting);
        if (!differenceStoryNearby && differenceFrame) {
          window.cancelAnimationFrame(differenceFrame);
          differenceFrame = 0;
        }
        scheduleDifferenceStory();
      }, { rootMargin: "100% 0px", threshold: 0 });
      differenceRangeObserver.observe(differenceShowcase);
    }

    window.addEventListener("scroll", scheduleDifferenceStory, { passive: true });
    window.addEventListener("resize", updateDifferenceStoryMode);
    reducedMotion.addEventListener?.("change", updateDifferenceStoryMode);
    updateDifferenceStoryMode();
  }

  const anchorStoryMedia = window.matchMedia("(min-width: 1024px) and (min-height: 621px)");
  const anchorStoryStates = Array.from(document.querySelectorAll("[data-anchor-story]")).map((story) => ({
    story,
    steps: Array.from(story.querySelectorAll("[data-anchor-step]")),
    indexNode: story.querySelector("[data-anchor-index]"),
    currentNode: story.querySelector("[data-anchor-current]"),
    nearby: !("IntersectionObserver" in window),
    activeIndex: -1
  })).filter((state) => state.steps.length);
  let anchorStoryFrame = 0;
  let anchorStoryMode = null;

  const clearAnchorStory = (state) => {
    state.story.classList.remove("is-anchor-active", "is-anchor-near");
    ["--anchor-progress", "--anchor-media-scale", "--anchor-media-shift", "--anchor-glow-x"].forEach((property) => {
      state.story.style.removeProperty(property);
    });
    state.steps.forEach((step) => {
      step.classList.remove("is-active", "is-past");
      ["--anchor-focus", "--anchor-scale", "--anchor-shift", "--anchor-step-progress"].forEach((property) => {
        step.style.removeProperty(property);
      });
    });
    state.story.querySelectorAll(".faq-nav a").forEach((link) => {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    });
    state.activeIndex = -1;
  };

  const readAnchorStory = (state) => {
    const viewportAnchor = window.innerHeight * .52;
    const rects = state.steps.map((step) => step.getBoundingClientRect());
    const centers = rects.map((rect) => rect.top + rect.height / 2);
    const activeIndex = centers.reduce((nearest, center, index) => (
      Math.abs(center - viewportAnchor) < Math.abs(centers[nearest] - viewportAnchor) ? index : nearest
    ), 0);
    const firstCenter = centers[0];
    const lastCenter = centers[centers.length - 1];
    const progress = clampStoryValue((viewportAnchor - firstCenter) / Math.max(lastCenter - firstCenter, 1));
    const stepValues = rects.map((rect) => {
      const center = rect.top + rect.height / 2;
      const distance = (center - viewportAnchor) / Math.max(window.innerHeight * .68, rect.height);
      const boundedDistance = Math.max(-1, Math.min(1, distance));
      const focus = 1 - Math.abs(boundedDistance);
      return {
        distance: boundedDistance,
        focus,
        progress: clampStoryValue((viewportAnchor - rect.top) / Math.max(rect.height, 1))
      };
    });
    return { state, activeIndex, progress, stepValues };
  };

  const writeAnchorStory = ({ state, activeIndex, progress, stepValues }) => {
    const total = state.steps.length;
    const activeStep = state.steps[activeIndex];
    state.story.classList.add("is-anchor-active", "is-anchor-near");
    state.story.style.setProperty("--anchor-progress", progress.toFixed(4));
    state.story.style.setProperty("--anchor-media-scale", (1.035 + progress * .045).toFixed(4));
    state.story.style.setProperty("--anchor-media-shift", `${((.5 - progress) * 34).toFixed(2)}px`);
    state.story.style.setProperty("--anchor-glow-x", `${(16 + progress * 68).toFixed(2)}%`);

    state.steps.forEach((step, index) => {
      const values = stepValues[index];
      step.classList.toggle("is-active", index === activeIndex);
      step.classList.toggle("is-past", index < activeIndex);
      step.style.setProperty("--anchor-focus", values.focus.toFixed(3));
      step.style.setProperty("--anchor-scale", (.94 + values.focus * .06).toFixed(4));
      step.style.setProperty("--anchor-shift", `${(values.distance * 18).toFixed(2)}px`);
      step.style.setProperty("--anchor-step-progress", values.progress.toFixed(3));
    });

    if (state.activeIndex !== activeIndex) {
      state.activeIndex = activeIndex;
      const number = String(activeIndex + 1).padStart(2, "0");
      if (state.indexNode) state.indexNode.textContent = `${number} / ${String(total).padStart(2, "0")}`;
      if (state.currentNode) state.currentNode.textContent = activeStep?.dataset.anchorTitle || "";
    }

    const activeId = activeStep?.id;
    state.story.querySelectorAll(".faq-nav a").forEach((link) => {
      const active = Boolean(activeId) && link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  const syncAnchorStories = () => {
    anchorStoryFrame = 0;
    if (!anchorStoryMode) return;
    const reads = anchorStoryStates.filter((state) => state.nearby).map(readAnchorStory);
    reads.forEach(writeAnchorStory);
  };

  const scheduleAnchorStories = () => {
    if (!anchorStoryMode || anchorStoryFrame || !anchorStoryStates.some((state) => state.nearby)) return;
    anchorStoryFrame = window.requestAnimationFrame(syncAnchorStories);
  };

  const updateAnchorStoryMode = () => {
    const nextMode = anchorStoryMedia.matches && !reducedMotion.matches;
    if (nextMode === anchorStoryMode) {
      scheduleAnchorStories();
      return;
    }
    anchorStoryMode = nextMode;
    if (!anchorStoryMode) {
      if (anchorStoryFrame) window.cancelAnimationFrame(anchorStoryFrame);
      anchorStoryFrame = 0;
      anchorStoryStates.forEach(clearAnchorStory);
      return;
    }
    scheduleAnchorStories();
  };

  if (anchorStoryStates.length) {
    if ("IntersectionObserver" in window) {
      const anchorRangeObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const state = anchorStoryStates.find((candidate) => candidate.story === entry.target);
          if (!state) return;
          state.nearby = entry.isIntersecting;
          state.story.classList.toggle("is-anchor-near", entry.isIntersecting && Boolean(anchorStoryMode));
          if (!entry.isIntersecting) clearAnchorStory(state);
        });
        scheduleAnchorStories();
      }, { rootMargin: "100% 0px", threshold: 0 });
      anchorStoryStates.forEach((state) => anchorRangeObserver.observe(state.story));
    }

    window.addEventListener("scroll", scheduleAnchorStories, { passive: true });
    window.addEventListener("resize", updateAnchorStoryMode);
    window.addEventListener("pageshow", scheduleAnchorStories);
    anchorStoryMedia.addEventListener?.("change", updateAnchorStoryMode);
    reducedMotion.addEventListener?.("change", updateAnchorStoryMode);
    updateAnchorStoryMode();
  }

  const countItems = document.querySelectorAll("[data-count]");
  const showFinalCount = (item) => {
    const value = Number(item.dataset.count || "0");
    item.textContent = `${new Intl.NumberFormat("ko-KR").format(value)}${item.dataset.suffix || ""}`;
  };

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    countItems.forEach(showFinalCount);
  } else {
    const countObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const item = entry.target;
        const target = Number(item.dataset.count || "0");
        const suffix = item.dataset.suffix || "";
        const start = performance.now();
        const duration = 550;
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(target * eased);
          item.textContent = `${new Intl.NumberFormat("ko-KR").format(current)}${suffix}`;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.unobserve(item);
      });
    }, { threshold: 0.45 });
    countItems.forEach((item) => countObserver.observe(item));
  }

  const sectionLinks = Array.from(document.querySelectorAll("[data-section-link]"));
  const sectionTargets = sectionLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (sectionTargets.length && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      sectionLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${visible.target.id}`;
        active ? link.setAttribute("aria-current", "true") : link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-22% 0px -65%", threshold: [0, .1, .4] });
    sectionTargets.forEach((section) => sectionObserver.observe(section));
  }

  const mobileConsult = document.querySelector("[data-mobile-consult]");
  const consultationSection = document.querySelector("#consultation");
  const heroSection = document.querySelector(".hero");
  const inlineConsultCtas = Array.from(document.querySelectorAll('main .button[href$="#consultation"]'));
  const mobileConsultOccluders = Array.from(new Set([
    heroSection,
    consultationSection,
    ...inlineConsultCtas,
    ...customerReviewVideos
  ].filter(Boolean)));
  if (mobileConsult && mobileConsultOccluders.length && "IntersectionObserver" in window) {
    const visibleSections = new Set();
    const updateMobileConsult = () => {
      const hidden = visibleSections.size > 0;
      mobileConsult.classList.toggle("is-hidden", hidden);
      if (hidden) {
        mobileConsult.setAttribute("aria-hidden", "true");
        mobileConsult.setAttribute("tabindex", "-1");
      } else {
        mobileConsult.removeAttribute("aria-hidden");
        mobileConsult.removeAttribute("tabindex");
      }
    };
    const consultObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleSections.add(entry.target);
        else visibleSections.delete(entry.target);
      });
      updateMobileConsult();
    }, { threshold: 0.05 });
    mobileConsultOccluders.forEach((target) => consultObserver.observe(target));
  }

  const faqEntities = Array.from(document.querySelectorAll(".faq-item")).map((item) => ({
    "@type": "Question",
    name: item.querySelector("summary")?.textContent.trim() || "",
    acceptedAnswer: {
      "@type": "Answer",
      text: item.querySelector(".faq-item__answer")?.textContent.trim().replace(/\s+/g, " ") || ""
    }
  })).filter((item) => item.name && item.acceptedAnswer.text);
  if (faqEntities.length) {
    const schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          "@id": "https://bridge-to-japan.github.io/#service",
          name: "Bridge to Japan 일본 진출 상담 연결",
          serviceType: "한국 고객의 일본 진출 초기 상담 및 현지 서비스 연결",
          url: "https://bridge-to-japan.github.io/",
          image: "https://bridge-to-japan.github.io/assets/images/brand/deep-zone-logo.jpg",
          areaServed: "JP",
          brand: {
            "@type": "Brand",
            name: "Bridge to Japan",
            description: "한국 고객을 위한 비법인 마케팅·상담 연결 브랜드"
          }
        },
        {
          "@type": "FAQPage",
          "@id": "https://bridge-to-japan.github.io/#faq",
          mainEntity: faqEntities
        }
      ]
    });
    document.head.append(schema);
  }

  const form = document.querySelector("#consultation-form");
  if (!form) return;

  const steps = Array.from(form.querySelectorAll("[data-form-step]"));
  const progressIndicator = form.querySelector("[data-form-progress]");
  const progressBar = form.querySelector("[data-progress-bar]");
  const progressText = form.querySelector("[data-progress-text]");
  const progressLabel = form.querySelector("[data-progress-label]");
  const successPanel = form.querySelector("[data-form-success]");
  const previewBanner = form.querySelector("[data-preview-banner]");
  const liveRegion = form.querySelector("[data-form-live]");
  const resetButton = form.querySelector("[data-form-reset]");
  const configuredMode = form.dataset.mode || "auto";
  const endpoint = form.dataset.endpoint || "";
  const recaptchaSitekey = form.dataset.recaptchaSitekey || "";
  const liveHosts = (form.dataset.liveHosts || "bridge-to-japan.github.io")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
  const endpointReady = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint);
  const recaptchaReady = Boolean(recaptchaSitekey && !recaptchaSitekey.includes("YOUR_"));
  const hostReady = configuredMode === "live" || liveHosts.includes(window.location.hostname.toLowerCase());
  const isPreview = configuredMode === "preview" || !endpointReady || !recaptchaReady || (configuredMode === "auto" && !hostReady);
  let currentStep = 0;
  let activeRequestId = null;
  let recaptchaWidgetId = null;
  let recaptchaToken = "";
  let isSubmitting = false;

  if (!isPreview && previewBanner) previewBanner.hidden = true;

  const labels = {
    services: {
      incorporation_or_branch: "일본 법인 설립 / 지점 등록",
      business_manager_visa: "경영·관리 비자",
      tax_and_accounting: "세무·회계",
      corporate_bank_account: "법인 은행 계좌",
      business_licenses: "사업 라이선스",
      office_and_real_estate: "사무실·부동산",
      subsidies_and_loans: "보조금·대출",
      other_japan_entry_support: "기타 일본 진출 상담"
    },
    referrals: {
      facebook: "Facebook",
      google_search: "Google 검색",
      linkedin: "LinkedIn",
      others: "기타",
      friend_referral: "지인 추천",
      other_websites: "다른 웹사이트",
      youtube: "YouTube",
      ai_search_or_gpt: "AI 검색 / GPT"
    }
  };

  const announce = (message) => {
    if (liveRegion) liveRegion.textContent = message;
  };

  const setStepError = (step, message = "") => {
    const node = step.querySelector("[data-step-error]");
    if (node) node.textContent = message;
    if (node?.id) {
      step.querySelectorAll(`[aria-describedby~="${node.id}"]`).forEach((target) => {
        if (message) target.setAttribute("aria-invalid", "true");
        else target.removeAttribute("aria-invalid");
      });
    }
    if (message) announce(message);
  };

  const firstInteractive = (step) => step.querySelector(
    'input:not([type="hidden"]):not(.hp-field input), textarea, button:not([data-back])'
  );

  const updateProgress = () => {
    const total = steps.length;
    const display = Math.min(currentStep + 1, total);
    const percent = Math.round((display / total) * 100);
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${display} / ${total}`;
    if (progressLabel) progressLabel.textContent = `${percent}% 완료`;
    if (progressIndicator) {
      progressIndicator.setAttribute("aria-valuenow", String(percent));
      progressIndicator.setAttribute("aria-valuetext", `${display} / ${total} · ${percent}% 완료`);
    }
  };

  const goToStep = (index, options = {}) => {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, stepIndex) => {
      const active = stepIndex === currentStep;
      step.hidden = !active;
      step.setAttribute("aria-hidden", String(!active));
      if (active && options.clearError !== false) setStepError(step);
    });
    if (successPanel) successPanel.hidden = true;
    updateProgress();
    if (currentStep === steps.length - 1) {
      buildReview();
      if (!isPreview) ensureRecaptcha();
    }
    updateNextButtonState();
    if (options.focus !== false) {
      window.setTimeout(() => {
        const heading = steps[currentStep].querySelector("h3");
        const target = firstInteractive(steps[currentStep]) || heading;
        target?.focus({ preventScroll: true });
      }, 40);
    }
    announce(`${currentStep + 1}번째 질문입니다.`);
  };

  const value = (name) => form.elements[name]?.value?.trim() || "";
  const checkedValues = (name) => Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((input) => input.value);
  const validEmail = (email) => email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isStepComplete = (index) => {
    if (index === 0) return Boolean(value("firstName") && value("lastName")) && value("firstName").length <= 80 && value("lastName").length <= 80;
    if (index === 1) return value("company").length <= 120;
    if (index === 2) return validEmail(value("email"));
    if (index === 3) return checkedValues("services").length > 0;
    if (index === 4) return checkedValues("referralSources").length > 0;
    if (index === 5) return value("message").length <= 2000;
    if (index === 6) return Boolean(form.elements.privacyConsent.checked);
    return true;
  };

  const updateNextButtonState = () => {
    const step = steps[currentStep];
    const next = step?.querySelector("[data-next]");
    if (!next) return;

    if (next.matches("[data-requires-valid]")) {
      next.setAttribute("aria-disabled", String(!isStepComplete(currentStep)));
    }

    if (next.matches("[data-optional-next]")) {
      const hasValue = currentStep === 1 ? Boolean(value("company")) : Boolean(value("message"));
      next.textContent = hasValue ? next.dataset.labelFilled : next.dataset.labelEmpty;
    }
  };

  const validateStep = (index) => {
    const step = steps[index];
    let message = "";
    let target = null;

    if (index === 0) {
      const firstName = value("firstName");
      const lastName = value("lastName");
      if (!firstName || !lastName) {
        message = "성과 이름을 모두 입력해 주세요.";
        target = !firstName ? form.elements.firstName : form.elements.lastName;
      } else if (firstName.length > 80 || lastName.length > 80) {
        message = "이름은 각 80자 이내로 입력해 주세요.";
      }
    } else if (index === 1) {
      if (value("company").length > 120) message = "회사명은 120자 이내로 입력해 주세요.";
    } else if (index === 2) {
      const email = value("email");
      if (!email) {
        message = "답변을 받을 이메일을 입력해 주세요.";
        target = form.elements.email;
      } else if (!validEmail(email)) {
        message = "올바른 이메일 주소를 입력해 주세요.";
        target = form.elements.email;
      }
    } else if (index === 3 && checkedValues("services").length === 0) {
      message = "관심 있는 서비스를 하나 이상 선택해 주세요.";
      target = form.querySelector('input[name="services"]');
    } else if (index === 4 && checkedValues("referralSources").length === 0) {
      message = "Bridge to Japan을 알게 된 경로를 하나 이상 선택해 주세요.";
      target = form.querySelector('input[name="referralSources"]');
    } else if (index === 5 && value("message").length > 2000) {
      message = "상담 메시지는 2,000자 이내로 입력해 주세요.";
      target = form.elements.message;
    } else if (index === 6 && !form.elements.privacyConsent.checked) {
      message = "상담 요청을 위해 개인정보 수집·이용에 동의해 주세요.";
      target = form.elements.privacyConsent;
    }

    setStepError(step, message);
    if (message) target?.focus();
    return !message;
  };

  const reviewValue = (key, fallback = "입력하지 않음") => {
    const node = form.querySelector(`[data-review="${key}"]`);
    if (!node) return;
    let text = fallback;
    if (key === "name") text = `${value("lastName")} ${value("firstName")}`.trim();
    if (key === "company") text = value("company") || fallback;
    if (key === "email") text = value("email");
    if (key === "services") text = checkedValues("services").map((code) => labels.services[code] || code).join(", ");
    if (key === "referral") {
      const codes = checkedValues("referralSources");
      text = codes.length ? codes.map((code) => labels.referrals[code] || code).join(", ") : fallback;
    }
    if (key === "message") text = value("message") || fallback;
    if (key === "privacy") text = form.elements.privacyConsent.checked ? "동의함" : "동의하지 않음";
    node.textContent = text;
  };

  const buildReview = () => {
    ["name", "company", "email", "services", "referral", "message", "privacy"].forEach((key) => reviewValue(key));
  };

  const generateRequestId = () => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  };

  const ensureRecaptcha = () => {
    const target = form.querySelector("[data-recaptcha]");
    const sitekey = form.dataset.recaptchaSitekey || "";
    if (!target || !sitekey || sitekey.includes("YOUR_")) {
      setStepError(steps[currentStep], "운영용 보안 확인 키가 설정되지 않았습니다.");
      return;
    }
    if (!window.grecaptcha) {
      if (!document.querySelector('script[data-recaptcha-script]')) {
        const script = document.createElement("script");
        script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.dataset.recaptchaScript = "true";
        script.addEventListener("load", ensureRecaptcha, { once: true });
        script.addEventListener("error", () => {
          setStepError(steps[currentStep], "보안 확인을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
        }, { once: true });
        document.head.append(script);
      }
      return;
    }
    if (recaptchaWidgetId !== null) return;
    recaptchaWidgetId = window.grecaptcha.render(target, {
      sitekey,
      theme: "dark",
      callback: (token) => {
        recaptchaToken = token;
        setStepError(steps[currentStep]);
      },
      "expired-callback": () => {
        recaptchaToken = "";
        announce("보안 확인 시간이 만료되었습니다. 다시 확인해 주세요.");
      },
      "error-callback": () => {
        recaptchaToken = "";
        setStepError(steps[currentStep], "보안 확인을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    });
  };

  const resetRecaptcha = () => {
    recaptchaToken = "";
    if (window.grecaptcha && recaptchaWidgetId !== null) window.grecaptcha.reset(recaptchaWidgetId);
  };

  const buildPayload = () => ({
    requestId: activeRequestId || (activeRequestId = generateRequestId()),
    firstName: value("firstName"),
    lastName: value("lastName"),
    company: value("company"),
    email: value("email"),
    services: checkedValues("services"),
    referralSources: checkedValues("referralSources"),
    message: value("message"),
    privacyConsent: Boolean(form.elements.privacyConsent.checked),
    privacyPolicyVersion: form.dataset.privacyPolicyVersion || "",
    recaptchaToken,
    website: value("website")
  });

  const safeErrorMessage = (code) => {
    const messages = {
      VALIDATION_ERROR: "입력 내용을 다시 확인해 주세요.",
      BOT_REJECTED: "보안 확인이 만료되었거나 실패했습니다. 다시 확인해 주세요.",
      PAGE_NOT_ALLOWED: "허용되지 않은 페이지에서 요청되었습니다.",
      RATE_LIMITED: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
      VERIFICATION_UNAVAILABLE: "보안 확인 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해 주세요.",
      DUPLICATE_CONFLICT: "전송 정보가 변경되었습니다. 내용을 다시 확인한 뒤 보내 주세요.",
      CONFIGURATION_ERROR: "상담 접수 설정을 확인하고 있습니다. 잠시 후 다시 시도해 주세요.",
      SERVICE_UNAVAILABLE: "상담 서비스가 아직 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.",
      REQUEST_TIMEOUT: "응답이 지연되고 있습니다. 입력 내용은 그대로 유지되니 다시 시도해 주세요."
    };
    return messages[code] || "상담 메시지를 보내지 못했습니다. 잠시 후 다시 시도해 주세요.";
  };

  const isTrustedAppsScriptMessageOrigin = (origin) => {
    try {
      const url = new URL(origin);
      const hostname = url.hostname.toLowerCase();
      return url.protocol === "https:"
        && !url.port
        && (
          hostname === "script.google.com"
          || hostname === "script.googleusercontent.com"
          || /^[a-z0-9-]+-script\.googleusercontent\.com$/.test(hostname)
        );
    } catch (error) {
      return false;
    }
  };

  const showSuccess = (preview) => {
    steps.forEach((step) => {
      step.hidden = true;
      step.setAttribute("aria-hidden", "true");
    });
    form.querySelector("[data-form-progress]")?.setAttribute("hidden", "");
    if (previewBanner) previewBanner.hidden = true;
    if (successPanel) {
      successPanel.hidden = false;
      const title = successPanel.querySelector("[data-success-title]");
      const message = successPanel.querySelector("[data-success-message]");
      if (preview) {
        if (title) title.textContent = "미리보기 확인이 끝났어요";
        if (message) message.textContent = "실제 전송 없이 상담 화면의 전체 흐름을 확인했어요.";
      } else {
        if (title) title.textContent = "상담 요청을 보냈어요";
        if (message) message.textContent = "담당자가 내용을 확인한 뒤 입력한 이메일로 연락드릴게요.";
      }
      successPanel.querySelector("h3")?.focus();
    }
    announce(preview ? "미리보기 확인이 끝났습니다." : "상담 요청이 전송되었습니다.");
  };

  const submitToAppsScript = (payload) => new Promise((resolve, reject) => {
    const responseNonce = generateRequestId();
    const frameName = `bridge-to-japan-contact-${responseNonce.replace(/[^a-z0-9]/gi, "")}`;
    const frame = document.createElement("iframe");
    const transportForm = document.createElement("form");
    let settled = false;
    const timeout = window.setTimeout(() => finish(null, { code: "REQUEST_TIMEOUT" }), 15_000);

    frame.name = frameName;
    frame.title = "상담 요청 처리 결과";
    frame.hidden = true;
    frame.setAttribute("aria-hidden", "true");
    transportForm.method = "POST";
    transportForm.action = endpoint;
    transportForm.target = frameName;
    transportForm.hidden = true;

    const addField = (name, fieldValue) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = fieldValue;
      transportForm.append(input);
    };

    addField("payload", JSON.stringify(payload));
    addField("requestId", payload.requestId);
    addField("responseNonce", responseNonce);
    addField("pageOrigin", window.location.origin);

    function cleanup() {
      window.clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      transportForm.remove();
      frame.remove();
    }

    function finish(result, error) {
      if (settled) return;
      settled = true;
      cleanup();
      if (error) reject(Object.assign(new Error("Submission failed"), error));
      else resolve(result);
    }

    function onMessage(event) {
      // HtmlService runs the response inside Google's nested IFRAME sandbox,
      // so its Window is not the form target's direct contentWindow.
      if (!isTrustedAppsScriptMessageOrigin(event.origin)) return;
      const result = event.data;
      if (!result || result.channel !== "bridge-to-japan-contact-v1") return;
      if (result.requestId !== payload.requestId || result.responseNonce !== responseNonce) return;
      if (!result.ok) {
        finish(null, { code: result.code || "SERVICE_UNAVAILABLE" });
        return;
      }
      finish(result);
    }

    window.addEventListener("message", onMessage);
    try {
      document.body.append(frame, transportForm);
      transportForm.submit();
    } catch (error) {
      finish(null, { code: "SERVICE_UNAVAILABLE" });
    }
  });

  form.addEventListener("click", (event) => {
    const next = event.target.closest("[data-next]");
    const back = event.target.closest("[data-back]");
    const edit = event.target.closest("[data-edit-step]");
    if (isSubmitting && (next || back || edit)) {
      event.preventDefault();
      return;
    }
    if (next) {
      event.preventDefault();
      if (validateStep(currentStep)) goToStep(currentStep + 1);
    }
    if (back) {
      event.preventDefault();
      goToStep(currentStep - 1);
    }
    if (edit) {
      event.preventDefault();
      goToStep(Number(edit.dataset.editStep));
    }
  });

  form.addEventListener("input", () => {
    activeRequestId = null;
    setStepError(steps[currentStep]);
    updateNextButtonState();
  });

  form.addEventListener("change", () => {
    activeRequestId = null;
    setStepError(steps[currentStep]);
    updateNextButtonState();
  });

  form.addEventListener("keydown", (event) => {
    if (isSubmitting) return;
    if (event.key !== "Enter" || event.isComposing) return;
    const target = event.target;
    if (target.matches("textarea")) {
      if (event.shiftKey) return;
      event.preventDefault();
      if (validateStep(currentStep)) goToStep(currentStep + 1);
      return;
    }
    if (target.matches('input[type="text"], input[type="email"]')) {
      event.preventDefault();
      if (currentStep === 0 && target === form.elements.firstName && !value("lastName")) {
        form.elements.lastName.focus();
        return;
      }
      if (validateStep(currentStep)) goToStep(currentStep + 1);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    const reviewStep = steps.length - 1;
    let invalidIndex = null;
    for (let index = 0; index < reviewStep; index += 1) {
      if (!validateStep(index)) {
        invalidIndex = index;
        break;
      }
    }
    if (invalidIndex !== null) {
      goToStep(invalidIndex, { clearError: false });
      return;
    }
    if (isPreview) {
      showSuccess(true);
      return;
    }
    if (!recaptchaToken) {
      setStepError(steps[reviewStep], "보안 확인을 완료해 주세요.");
      return;
    }

    const submitButton = form.querySelector('[type="submit"]');
    const originalLabel = submitButton?.textContent;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "전송 중…";
    }
    setStepError(steps[reviewStep]);
    form.setAttribute("aria-busy", "true");
    isSubmitting = true;

    try {
      await submitToAppsScript(buildPayload());
      showSuccess(false);
    } catch (error) {
      setStepError(steps[reviewStep], safeErrorMessage(error?.code));
      resetRecaptcha();
    } finally {
      isSubmitting = false;
      form.removeAttribute("aria-busy");
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
      }
    }
  });

  resetButton?.addEventListener("click", () => {
    form.reset();
    activeRequestId = null;
    resetRecaptcha();
    form.querySelector("[data-form-progress]")?.removeAttribute("hidden");
    if (previewBanner && isPreview) previewBanner.hidden = false;
    goToStep(0);
  });

  goToStep(0, { focus: false });
  root.classList.add("form-ready");
})();

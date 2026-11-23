document.addEventListener("DOMContentLoaded", () => {
    const play = document.querySelector(".video-play");
    if (play) {
        play.addEventListener("click", () => {
            const frame = document.createElement("iframe");
            frame.src = `https://www.youtube-nocookie.com/embed/${play.dataset.youtube}?autoplay=1`;
            frame.title = "RoboBench introduction video";
            frame.allow = "autoplay; encrypted-media; picture-in-picture";
            frame.allowFullscreen = true;
            play.replaceWith(frame);
            frame.focus();
        });
    }

    // In-page figure viewer: show the cached preview at once, swap in the full-size original when it arrives.
    const figureLinks = [...document.querySelectorAll("a.overview-image")];
    if (figureLinks.length && window.HTMLDialogElement) {
        const viewer = document.createElement("dialog");
        viewer.className = "figure-viewer";
        viewer.setAttribute("aria-label", "Expanded figure");
        viewer.innerHTML = `
            <div class="figure-viewer-bar">
                <button class="figure-viewer-btn" type="button" data-close aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
            </div>
            <div class="figure-viewer-stage"><img alt=""><span class="figure-viewer-spinner" aria-hidden="true"></span></div>`;
        document.body.append(viewer);
        const stage = viewer.querySelector(".figure-viewer-stage");
        const image = viewer.querySelector("img");
        let token = 0;
        const close = () => {
            viewer.classList.add("closing");
            setTimeout(() => { viewer.classList.remove("closing"); viewer.close(); }, 160);
        };
        for (const link of figureLinks) {
            link.addEventListener("click", event => {
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                const preview = link.querySelector("img");
                const full = link.href;
                const current = ++token;
                image.src = preview.currentSrc || preview.src;
                image.alt = preview.alt;
                stage.classList.remove("zoomed");
                viewer.classList.add("loading");
                viewer.showModal();
                const loader = new Image();
                loader.onload = () => { if (current === token) { image.src = full; viewer.classList.remove("loading"); } };
                loader.onerror = () => { if (current === token) viewer.classList.remove("loading"); };
                loader.src = full;
            });
        }
        viewer.querySelector("[data-close]").addEventListener("click", close);
        viewer.addEventListener("cancel", event => { event.preventDefault(); close(); });
        viewer.addEventListener("click", event => { if (event.target === viewer || event.target === stage) close(); });
        image.addEventListener("click", () => stage.classList.toggle("zoomed"));
    }

    const copy = document.getElementById("copy-bibtex");
    if (copy) {
        const code = document.getElementById("bibtex-code");
        const status = document.getElementById("copy-status");
        copy.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(code.textContent);
                copy.textContent = "Copied";
                status.textContent = "BibTeX copied to clipboard.";
                setTimeout(() => { copy.textContent = "Copy BibTeX"; }, 2500);
            } catch {
                const range = document.createRange();
                range.selectNodeContents(code);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
                status.textContent = "Citation selected. Press Control+C or Command+C to copy.";
            }
        });
    }

    const panels = [...document.querySelectorAll(".tab-content")];
    const updateScrollCue = panel => {
        panel.classList.toggle("can-scroll-right", panel.scrollLeft + panel.clientWidth < panel.scrollWidth - 2);
    };
    for (const panel of panels) {
        panel.addEventListener("scroll", () => updateScrollCue(panel), { passive: true });
    }
    const updateAllCues = () => panels.forEach(updateScrollCue);
    for (const tab of document.querySelectorAll(".tab-btn")) {
        tab.addEventListener("click", () => requestAnimationFrame(updateAllCues));
    }
    window.addEventListener("resize", updateAllCues);
    updateAllCues();

    const links = [...document.querySelectorAll(".project-nav-links a[href^='#']")];
    const targets = links.map(link => document.querySelector(link.getAttribute("href")));
    const header = document.querySelector(".project-header");
    let frame = 0;
    const updateNav = () => {
        frame = 0;
        const offset = header.offsetHeight + 40;
        let current = -1;
        let nearest = -Infinity;
        targets.forEach((target, index) => {
            const top = target ? target.getBoundingClientRect().top : Infinity;
            if (top <= offset && top > nearest) {
                nearest = top;
                current = index;
            }
        });
        links.forEach((link, index) => {
            const active = index === current;
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
        });
    };
    window.addEventListener("scroll", () => { if (!frame) frame = requestAnimationFrame(updateNav); }, { passive: true });
    updateNav();
});

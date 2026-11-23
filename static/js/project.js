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

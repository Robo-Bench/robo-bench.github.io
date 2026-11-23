document.addEventListener("DOMContentLoaded", () => {
    const board = document.querySelector(".leaderboard-section");
    const tabs = [...board.querySelectorAll(".tab-btn")];
    const panels = [...board.querySelectorAll(".tab-content")];

    for (const tab of tabs) {
        tab.addEventListener("click", () => {
            for (const button of tabs) {
                const selected = button === tab;
                button.classList.toggle("active", selected);
                button.setAttribute("aria-pressed", String(selected));
            }
            for (const panel of panels) {
                panel.classList.toggle("active", panel.id === tab.dataset.tab);
            }
        });
    }

    for (const button of board.querySelectorAll(".score-sort")) {
        button.addEventListener("click", () => {
            const table = button.closest("table");
            const header = button.closest("th");
            const ascending = header.getAttribute("aria-sort") === "descending";
            for (const sortedHeader of table.querySelectorAll("[aria-sort]")) {
                sortedHeader.removeAttribute("aria-sort");
            }
            header.setAttribute("aria-sort", ascending ? "ascending" : "descending");
            sortModelGroups(table.tBodies[0], Number(button.dataset.col) + 1, ascending);
        });
    }
});

function sortModelGroups(body, column, ascending) {
    const rows = [...body.rows];
    let group = [];

    function appendGroup() {
        group.sort((left, right) => {
            const a = Number.parseFloat(left.cells[column]?.textContent);
            const b = Number.parseFloat(right.cells[column]?.textContent);
            if (!Number.isFinite(a)) return Number.isFinite(b) ? 1 : 0;
            if (!Number.isFinite(b)) return -1;
            return ascending ? a - b : b - a;
        });
        body.append(...group);
        group = [];
    }

    for (const row of rows) {
        if (row.cells[0].tagName === "TH") {
            appendGroup();
            body.append(row);
        } else {
            group.push(row);
        }
    }
    appendGroup();
}

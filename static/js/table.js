document.addEventListener('DOMContentLoaded', function() {
    // 标签页切换功能
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');

            // 移除所有按钮和内容的active类
            tabBtns.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // 添加active类到当前按钮和内容
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // 表格排序功能
    const sortBtns = document.querySelectorAll('.sort-btn');

    // 存储每列的当前排序状态
    const sortStates = Array.from({
        length: 14
    }, () => null); // 14列

    sortBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const col = parseInt(this.getAttribute('data-col'));
            const currentSort = sortStates[col];
            const activeTab = document.querySelector('.tab-content.active');
            const table = activeTab.querySelector('table');

            // 确定新的排序方向
            let isAsc;
            if (currentSort === null || currentSort === 'desc') {
                isAsc = true;
                sortStates[col] = 'asc';
            } else {
                isAsc = false;
                sortStates[col] = 'desc';
            }

            // 更新所有排序按钮的显示
            updateSortIcons(col, isAsc);

            // 排序表格
            sortTable(table, col, isAsc);
        });
    });

    function updateSortIcons(activeCol, isAsc) {
        sortBtns.forEach(btn => {
            const col = parseInt(btn.getAttribute('data-col'));
            if (col === activeCol) {
                btn.textContent = isAsc ? '▲' : '▼';
            } else {
                btn.textContent = '▼';
                sortStates[col] = null;
            }
        });
    }

    function sortTable(table, col, isAsc) {
        const tbody = table.querySelector('tbody');
        const allRows = Array.from(tbody.querySelectorAll('tr'));

        // 将表格分成标题行和数据行
        const sectionRow = allRows.find(row =>
            row.classList.contains('text-only') ||
            row.classList.contains('closed-source') ||
            row.classList.contains('open-source') ||
            row.classList.contains('video-mlm')
        );

        const dataRows = allRows.filter(row =>
            !row.classList.contains('text-only') &&
            !row.classList.contains('closed-source') &&
            !row.classList.contains('open-source') &&
            !row.classList.contains('video-mlm')
        );

        // 对数据行进行排序
        dataRows.sort((a, b) => {
            const aVal = parseFloat(a.cells[col].textContent) || 0;
            const bVal = parseFloat(b.cells[col].textContent) || 0;
            return isAsc ? aVal - bVal : bVal - aVal;
        });

        // 重新构建表格
        tbody.innerHTML = '';

        // 添加标题行
        if (sectionRow) {
            tbody.appendChild(sectionRow);
        }

        // 添加排序后的数据行
        dataRows.forEach(row => {
            tbody.appendChild(row);
        });
    }
});
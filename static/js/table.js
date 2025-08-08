document.addEventListener('DOMContentLoaded', function() {
    // 初始化进度条
    function initProgressBars() {
        document.querySelectorAll('.tab-content.active table td:not(:first-child)').forEach((td, index) => {
            const value = parseFloat(td.textContent) || 0;
            const percent = Math.min(100, Math.max(0, value));

            // 正确计算列索引：需要考虑表格结构，获取单元格在行中的实际位置
            const row = td.parentElement;
            let colIndex = 0;

            // 计算当前单元格在行中的实际列索引
            for (let i = 0; i < row.cells.length; i++) {
                if (row.cells[i] === td) {
                    colIndex = i;
                    break;
                }
            }

            // 确保列索引在1-20范围内（根据实际最大列数调整）
            const colNum = ((colIndex - 1) % 20) + 1; // 减1是因为第一列是Model名称列

            // 保留原始文本
            const originalText = td.textContent.trim();

            // 清空并添加进度条结构
            td.innerHTML = `
                <div class="progress-bar-container">
                    <div class="progress-bar col-${colNum}" style="width: ${percent}%"></div>
                </div>
                <span class="progress-text">${originalText}</span>
            `;
        });
    }

    // 标签页切换功能
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');

            tabBtns.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');

            // 初始化新标签页的进度条
            initProgressBars();
        });
    });

    // 表格排序功能
    const sortBtns = document.querySelectorAll('.sort-btn');
    // 根据实际需要的列数调整数组长度
    const sortStates = Array.from({ length: 20 }, () => null);

    sortBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const col = parseInt(this.getAttribute('data-col'));
            const currentSort = sortStates[col];
            const activeTab = document.querySelector('.tab-content.active');
            const table = activeTab.querySelector('table');

            const isAsc = currentSort !== 'asc';
            sortStates[col] = isAsc ? 'asc' : 'desc';

            updateSortIcons(col, isAsc);
            sortTable(table, col, isAsc);
            initProgressBars(); // 排序后重新初始化进度条
        });
    });

    function updateSortIcons(activeCol, isAsc) {
        sortBtns.forEach(btn => {
            const col = parseInt(btn.getAttribute('data-col'));
            if (col === activeCol) {
                btn.textContent = isAsc ? '▲' : '▼';
            } else {
                btn.textContent = '▼';
            }
        });
    }

    function sortTable(table, col, isAsc) {
        const tbody = table.querySelector('tbody');
        const allRows = Array.from(tbody.querySelectorAll('tr'));

        // 1. 识别并保留所有非数据行（表头、分类标题、固定行等）
        const nonDataRows = allRows.filter(row => {
            const firstCell = row.cells[0];

            // 分类标题行（有th元素或特定类名）
            if (row.querySelector('th') ||
                row.classList.contains('text-only') ||
                row.classList.contains('closed-source') ||
                row.classList.contains('open-source')) {
                return true;
            }

            // 固定行（如"Human"、"最终数量"等）
            if (firstCell && (
                    firstCell.textContent.trim() === '最终数量' ||
                    firstCell.textContent.trim() === 'Human')) {
                return true;
            }

            return false;
        });

        // 2. 识别所有数据行（非上述行）
        const dataRows = allRows.filter(row => !nonDataRows.includes(row));

        // 3. 对数据行进行排序
        dataRows.sort((a, b) => {
            // 确保列存在
            if (col >= a.cells.length || col >= b.cells.length) return 0;

            const aVal = parseFloat(a.cells[col].textContent) || 0;
            const bVal = parseFloat(b.cells[col].textContent) || 0;
            return isAsc ? aVal - bVal : bVal - aVal;
        });

        // 4. 重新构建表格
        tbody.innerHTML = '';

        // 先添加所有非数据行（保持原顺序）
        nonDataRows.forEach(row => tbody.appendChild(row));

        // 然后添加排序后的数据行
        dataRows.forEach(row => tbody.appendChild(row));
    }

    // 初始加载时初始化进度条
    initProgressBars();
});
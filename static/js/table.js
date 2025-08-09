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

    // static/js/table.js

    function sortTable(table, colIndex, ascending) {
        const tbody = table.querySelector('tbody');
        // 获取所有行
        const allRows = Array.from(tbody.querySelectorAll('tr'));

        // 分离普通数据行和分类标题行
        const dataRows = allRows.filter(row => !row.querySelector('th'));
        const categoryHeaders = allRows.filter(row => row.querySelector('th'));

        // 对普通数据行进行排序
        const sortedRows = dataRows.sort((a, b) => {
            const aText = (a.cells[colIndex] && a.cells[colIndex].textContent.trim()) || '';
            const bText = (b.cells[colIndex] && b.cells[colIndex].textContent.trim()) || '';

            // 处理数值类型排序
            const aNum = parseFloat(aText);
            const bNum = parseFloat(bText);
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return ascending ? aNum - bNum : bNum - aNum;
            }

            // 处理文本类型排序
            return ascending ? aText.localeCompare(bText) : bText.localeCompare(aText);
        });

        // 重新组装表格内容
        tbody.innerHTML = ''; // 清空表格内容

        // 按原始顺序重新插入分类标题和对应的数据行
        let currentCategory = null;
        let proprietaryRows = [];
        let openSourceRows = [];

        // 分离不同类别的数据行
        sortedRows.forEach(row => {
            const modelText = row.cells[0].textContent.trim();
            if (modelText === 'Human' || modelText.includes('最终数量')) {
                // 这些行应该在Proprietary MLLMs之前
                tbody.appendChild(row);
            } else if (modelText.includes('Proprietary') ||
                (row.querySelector('td') && row.querySelector('td').colSpan &&
                    row.querySelector('td').colSpan > 10)) {
                // 这是分类标题行，已经在categoryHeaders中处理
            } else if (modelText.includes('GPT') || modelText.includes('Claude') ||
                modelText.includes('Gemini') || modelText.includes('Qwen-VL')) {
                proprietaryRows.push(row);
            } else {
                openSourceRows.push(row);
            }
        });

        // 插入Proprietary MLLMs标题和数据
        const proprietaryHeader = categoryHeaders.find(header =>
            header.classList.contains('text-only') ||
            header.classList.contains('closed-source') ||
            (header.querySelector('th') &&
                header.querySelector('th').textContent.includes('Proprietary')));

        if (proprietaryHeader) {
            tbody.appendChild(proprietaryHeader);
        }

        proprietaryRows.forEach(row => tbody.appendChild(row));

        // 插入Open-Source Multi-Image MLLMs标题和数据
        const openSourceHeader = categoryHeaders.find(header =>
            header.classList.contains('open-source') ||
            (header.querySelector('th') &&
                header.querySelector('th').textContent.includes('Open-Source')));

        if (openSourceHeader) {
            tbody.appendChild(openSourceHeader);
        }

        openSourceRows.forEach(row => tbody.appendChild(row));
    }

    // 初始加载时初始化进度条
    initProgressBars();
});
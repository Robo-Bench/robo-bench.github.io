        document.addEventListener('DOMContentLoaded', function() {
            const table = document.querySelector('table');
            const sortBtns = document.querySelectorAll('.sort-btn');

            // 存储每列的当前排序状态
            const sortStates = Array.from({
                length: 14
            }, () => null); // 14列

            sortBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const col = parseInt(this.getAttribute('data-col'));
                    const currentSort = sortStates[col];

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

                // 将表格分成四个部分
                const sections = {
                    'text-only': {
                        start: -1,
                        end: -1,
                        rows: []
                    },
                    'closed-source': {
                        start: -1,
                        end: -1,
                        rows: []
                    },
                    'open-source': {
                        start: -1,
                        end: -1,
                        rows: []
                    },
                    'video-mlm': {
                        start: -1,
                        end: -1,
                        rows: []
                    }
                };

                // 识别每个部分的开始和结束位置
                let currentSection = null;
                allRows.forEach((row, index) => {
                    if (row.classList.contains('text-only')) {
                        currentSection = 'text-only';
                        sections[currentSection].start = index;
                    } else if (row.classList.contains('closed-source')) {
                        currentSection = 'closed-source';
                        sections[currentSection].start = index;
                    } else if (row.classList.contains('open-source')) {
                        currentSection = 'open-source';
                        sections[currentSection].start = index;
                    } else if (row.classList.contains('video-mlm')) {
                        currentSection = 'video-mlm';
                        sections[currentSection].start = index;
                    } else if (currentSection) {
                        sections[currentSection].rows.push(row);
                    }
                });

                // 设置每个部分的结束位置
                const sectionKeys = Object.keys(sections);
                for (let i = 0; i < sectionKeys.length - 1; i++) {
                    const currentKey = sectionKeys[i];
                    const nextKey = sectionKeys[i + 1];
                    sections[currentKey].end = sections[nextKey].start - 1;
                }
                sections[sectionKeys[sectionKeys.length - 1]].end = allRows.length - 1;

                // 对每个部分的数据行进行排序
                for (const sectionKey in sections) {
                    const section = sections[sectionKey];
                    if (section.rows.length > 0) {
                        section.rows.sort((a, b) => {
                            const aVal = parseFloat(a.cells[col].textContent) || 0;
                            const bVal = parseFloat(b.cells[col].textContent) || 0;
                            return isAsc ? aVal - bVal : bVal - aVal;
                        });
                    }
                }

                // 重新构建表格
                tbody.innerHTML = '';

                // 保持标题行的相对顺序，但将排序后的数据行插入到相应部分
                let currentSectionKey = null;
                let sectionRowIndex = 0;

                allRows.forEach(row => {
                    if (row.classList.contains('text-only') ||
                        row.classList.contains('closed-source') ||
                        row.classList.contains('open-source') ||
                        row.classList.contains('video-mlm')) {
                        // 这是标题行，找到对应的section
                        currentSectionKey = Array.from(row.classList).find(cls =>
                            cls === 'text-only' ||
                            cls === 'closed-source' ||
                            cls === 'open-source' ||
                            cls === 'video-mlm');
                        sectionRowIndex = 0;
                        tbody.appendChild(row);
                    } else if (currentSectionKey && sections[currentSectionKey]) {
                        // 这是数据行，插入排序后的数据
                        const section = sections[currentSectionKey];
                        if (sectionRowIndex < section.rows.length) {
                            tbody.appendChild(section.rows[sectionRowIndex]);
                            sectionRowIndex++;
                        }
                    } else {
                        // 其他行（不应该有）
                        tbody.appendChild(row);
                    }
                });
            }
        });
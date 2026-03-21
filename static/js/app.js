// ========== STATE & CONSTANTS ==========
let currentStructure = null;
let operations = [];
let currentTreeData = null;
let isLoading = false;

const API_BASE = '/api';

const DS_NAMES = {
    threaded: 'Threaded Binary Tree',
    avl: 'AVL Tree',
    rbtree: 'Red-Black Tree',
    heap: 'Heap Tree',
    btree: 'B-Tree',
    bplus: 'B+ Tree'
};

const COMPLEXITY_DATA = {
    threaded: {
        insert: 'O(log n)', delete: 'O(log n)', search: 'O(log n)',
        space: 'O(n)', description: 'BST with threads for inorder predecessor/successor; no stack for traversal'
    },
    avl: {
        insert: 'O(log n)', delete: 'O(log n)', search: 'O(log n)',
        space: 'O(n)', description: 'Self-balancing BST; heights of left and right subtrees differ by at most 1'
    },
    rbtree: {
        insert: 'O(log n)', delete: 'O(log n)', search: 'O(log n)',
        space: 'O(n)', description: 'Self-balancing BST with red/black nodes; guarantees O(log n) height'
    },
    heap: {
        insert: 'O(log n)', 'extract-min': 'O(log n)', search: 'O(n)',
        space: 'O(n)', description: 'Binary min-heap: parent always smaller than children; array representation'
    },
    btree: {
        insert: 'O(log n)', delete: 'O(log n)', search: 'O(log n)',
        space: 'O(n)', description: 'Multi-way search tree; all keys in internal nodes and leaves; good for disks'
    },
    bplus: {
        insert: 'O(log n)', delete: 'O(log n)', search: 'O(log n)',
        space: 'O(n)', description: 'B+ tree: keys only in leaves; leaves linked for range scans'
    }
};

// ========== UTILITY ==========
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
}

function showLoading(show) {
    isLoading = show;
    document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
}

function validateInput(value) {
    if (!value || value.trim() === '') {
        showToast('Please enter a value', 'warning');
        return false;
    }
    if (currentStructure === 'heap' || currentStructure === 'threaded' || currentStructure === 'avl' || currentStructure === 'rbtree' || currentStructure === 'btree' || currentStructure === 'bplus') {
        if (isNaN(parseInt(value))) {
            showToast('Please enter a valid number', 'warning');
            return false;
        }
    }
    return true;
}

function getTreeEndpoint() {
    return currentStructure || 'avl';
}

// ========== COMPLEXITY PANEL ==========
function updateComplexityPanel(structure) {
    const grid = document.getElementById('complexityGrid');
    const data = COMPLEXITY_DATA[structure];
    if (!data) {
        grid.innerHTML = '<p class="placeholder-text">Select a data structure</p>';
        return;
    }
    let html = '';
    for (const [key, value] of Object.entries(data)) {
        if (key === 'description') continue;
        html += `<div class="complexity-card">
            <div class="label">${key.replace('-', ' ')}</div>
            <div class="value">${value}</div>
        </div>`;
    }
    html += `<div class="complexity-card full">
        <div class="label">About</div>
        <div class="value">${data.description}</div>
    </div>`;
    grid.innerHTML = html;
}

// ========== HISTORY ==========
function addOperation(type, value) {
    operations.push({ type, value, timestamp: Date.now() });
    updateHistory();
}

function updateHistory() {
    const historyDiv = document.getElementById('historyList');
    if (operations.length === 0) {
        historyDiv.innerHTML = '<p class="placeholder-text">No operations yet</p>';
        return;
    }
    historyDiv.innerHTML = operations.slice().reverse().map((op) => {
        const time = new Date(op.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return `<div class="history-item op-${op.type}">
            <span class="op-badge">${op.type}</span>
            <span>${op.value}</span>
            <span class="timestamp">${time}</span>
        </div>`;
    }).join('');
}

// ========== STRUCTURE SELECTION ==========
async function selectStructure(structure) {
    currentStructure = structure;
    operations = [];
    updateHistory();

    document.querySelectorAll('.ds-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.structure === structure) btn.classList.add('active');
    });

    document.getElementById('currentDsBadge').textContent = DS_NAMES[structure] || 'Select a structure';

    const isHeap = structure === 'heap';

    document.getElementById('btnInsert').style.display = 'inline-block';
    document.getElementById('btnDelete').style.display = isHeap ? 'none' : 'inline-block';
    document.getElementById('btnSearch').style.display = isHeap ? 'none' : 'inline-block';
    document.getElementById('btnExtract').style.display = isHeap ? 'inline-block' : 'none';

    document.getElementById('inputValue').placeholder = isHeap ? 'Enter a number to insert' : 'Enter a number';

    document.getElementById('inputValue').value = '';
    updateComplexityPanel(structure);
    await loadTree();
}

// ========== API ==========
async function loadTree() {
    if (!currentStructure) return;
    showLoading(true);
    try {
        const endpoint = getTreeEndpoint();
        const response = await fetch(`${API_BASE}/${endpoint}/tree`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        currentTreeData = data.tree || null;
        renderVisualization(currentTreeData);
    } catch (error) {
        console.error('Error loading tree:', error);
        renderVisualization(null);
    } finally {
        showLoading(false);
    }
}

async function insert() {
    if (!currentStructure) { showToast('Select a data structure first', 'warning'); return; }
    const value = document.getElementById('inputValue').value.trim();
    if (!validateInput(value)) return;

    showLoading(true);
    try {
        const body = { value: parseInt(value) };
        const response = await fetch(`${API_BASE}/${getTreeEndpoint()}/insert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        currentTreeData = data.tree;
        addOperation('insert', value);
        renderVisualization(currentTreeData);
        document.getElementById('inputValue').value = '';
        showToast(`Inserted ${value}`, 'success');
    } catch (error) {
        console.error('Insert error:', error);
        showToast(`Insert failed: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteValue() {
    if (!currentStructure) { showToast('Select a data structure first', 'warning'); return; }
    const value = document.getElementById('inputValue').value.trim();
    if (!validateInput(value)) return;

    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/${getTreeEndpoint()}/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: parseInt(value) })
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        currentTreeData = data.tree;
        addOperation('delete', value);
        renderVisualization(currentTreeData);
        document.getElementById('inputValue').value = '';
        showToast(`Deleted ${value}`, 'success');
    } catch (error) {
        console.error('Delete error:', error);
        showToast(`Delete failed: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

async function search() {
    if (!currentStructure) { showToast('Select a data structure first', 'warning'); return; }
    const value = document.getElementById('inputValue').value.trim();
    if (!validateInput(value)) return;

    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/${getTreeEndpoint()}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: parseInt(value) })
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        addOperation('search', value);
        if (data.found) {
            showToast(`${value} found!`, 'success');
            highlightNode(value);
        } else {
            showToast(`${value} not found`, 'warning');
        }
    } catch (error) {
        console.error('Search error:', error);
        showToast(`Search failed: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

async function extractMin() {
    if (currentStructure !== 'heap') return;
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/heap/extract`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        currentTreeData = data.tree;
        addOperation('extract', data.min !== undefined ? data.min : '(empty)');
        renderVisualization(currentTreeData);
        showToast(`Extracted min: ${data.min !== undefined ? data.min : 'heap empty'}`, 'info');
    } catch (error) {
        console.error('Extract error:', error);
        showToast(`Extract failed: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

async function clear() {
    if (!currentStructure) return;
    showLoading(true);
    try {
        await fetch(`${API_BASE}/${getTreeEndpoint()}/clear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        operations = [];
        updateHistory();
        currentTreeData = null;
        renderVisualization(null);
        showToast('Cleared', 'info');
    } catch (error) {
        console.error('Clear error:', error);
        showToast(`Clear failed: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// ========== SEARCH HIGHLIGHT ==========
function highlightNode(value) {
    const numVal = parseInt(value);
    d3.selectAll('.node').each(function (d) {
        if (!d || !d.data) return;
        const nd = d.data.data || d.data;
        const nv = nd.value !== undefined ? nd.value : nd.key;
        if (nv === numVal) {
            const node = d3.select(this);
            node.classed('highlighted', true);
            const shape = node.select('circle').empty() ? node.select('rect') : node.select('circle');
            if (!shape.empty()) {
                const origR = shape.attr('r');
                if (origR) {
                    shape.transition().duration(300).attr('r', +origR + 6)
                        .transition().duration(300).attr('r', origR);
                }
            }
            setTimeout(() => node.classed('highlighted', false), 3000);
        }
    });
}

// ========== NODE COMMENTS ==========
function getCommentForNode(structure, nd, pd, heapNodes) {
    switch (structure) {
        case 'avl': {
            if (!pd) return 'Root \u2014 first node inserted';
            const side = pd.left && pd.left.value === nd.value ? 'L' : 'R';
            const lh = nd.left ? nd.left.height : 0;
            const rh = nd.right ? nd.right.height : 0;
            const bf = lh - rh;
            return `${side}-child of ${pd.value} | BF=${bf}${bf === 0 ? ' (balanced)' : bf === 1 || bf === -1 ? ' (ok)' : ' (rotated)'}`;
        }
        case 'rbtree': {
            if (!pd) return 'Root \u2014 colored BLACK by rule';
            const side = pd.left && pd.left.value === nd.value ? 'L' : 'R';
            return `${nd.color || 'RED'} node | ${side}-child of ${pd.value} (${pd.color || 'BLACK'})`;
        }
        case 'heap': {
            if (nd.index === 0) return heapNodes && heapNodes.length === 1 ? 'Root \u2014 first element' : 'Root (minimum element)';
            const pi = Math.floor((nd.index - 1) / 2);
            const pv = heapNodes && heapNodes[pi] ? heapNodes[pi].value : '?';
            return `idx=${nd.index} | parent: ${pv} | min-heap satisfied`;
        }
        case 'threaded': {
            if (!pd) return 'Root \u2014 threaded BST';
            const side = pd.left && pd.left.value === nd.value ? 'L' : 'R';
            const parts = [];
            if (nd.leftThread) parts.push('L\u2192inorder pred');
            if (nd.rightThread) parts.push('R\u2192inorder succ');
            return `${side}-child of ${pd.value}${parts.length ? ' | ' + parts.join(', ') : ''}`;
        }
        case 'btree': {
            const isLeaf = !nd.children || nd.children.length === 0;
            const kn = (nd.keys || []).length;
            if (!pd) return `Root | ${kn} key${kn !== 1 ? 's' : ''} | ${isLeaf ? 'leaf' : 'internal'}`;
            return `${isLeaf ? 'Leaf' : 'Internal'} node | ${kn} key${kn !== 1 ? 's' : ''}`;
        }
        case 'bplus': {
            const isLeaf = nd.isLeaf || !nd.children || nd.children.length === 0;
            const kn = (nd.keys || []).length;
            if (!pd) return `Root | ${kn} key${kn !== 1 ? 's' : ''}`;
            return isLeaf ? `Leaf | ${kn} key${kn !== 1 ? 's' : ''} | linked for range scan` : `Internal | ${kn} key${kn !== 1 ? 's' : ''}`;
        }
        default: return '';
    }
}

function addCommentIcon(nodeGroup, comment, iconX, iconY) {
    if (!comment) return;
    if (iconX === undefined) iconX = 30;
    if (iconY === undefined) iconY = -28;

    // Split at ' | ' into two lines so nothing is truncated
    const segments = comment.split(' | ');
    const lines = segments.length >= 2
        ? [segments[0], segments.slice(1).join(' | ')]
        : [comment];

    const charW = 6.2;
    const padX = 10;
    const lineH = 15;
    const boxW = Math.max(...lines.map(l => l.length * charW)) + padX * 2;
    const boxH = lines.length === 1 ? 22 : 22 + (lines.length - 1) * lineH;
    const bx = iconX + 10;
    const by = iconY - boxH / 2;

    const wrap = nodeGroup.append('g').attr('class', 'comment-trigger');

    // Bubble (hidden by default)
    const bubble = wrap.append('g').attr('class', 'comment-bubble').attr('opacity', 0).attr('pointer-events', 'none');
    bubble.append('rect')
        .attr('x', bx).attr('y', by).attr('width', boxW).attr('height', boxH).attr('rx', 4)
        .attr('fill', 'rgba(10,10,30,0.92)')
        .attr('stroke', 'rgba(140,140,255,0.4)').attr('stroke-width', 1);
    lines.forEach((line, i) => {
        bubble.append('text')
            .attr('x', bx + padX).attr('y', by + 14 + i * lineH)
            .attr('fill', i === 0 ? '#e2e8f0' : '#a5b4fc')
            .attr('font-size', '9.5px').attr('font-family', 'Inter, sans-serif')
            .text(line);
    });

    // Arrow icon
    const icon = wrap.append('g').style('cursor', 'pointer');
    icon.append('circle')
        .attr('cx', iconX).attr('cy', iconY).attr('r', 7)
        .attr('fill', '#6366f1').attr('stroke', 'white').attr('stroke-width', 1.5);
    icon.append('path')
        .attr('d', `M ${iconX - 2},${iconY - 3} L ${iconX + 3},${iconY} L ${iconX - 2},${iconY + 3} Z`)
        .attr('fill', 'white').attr('pointer-events', 'none');

    let open = false;
    icon.on('click', function(event) {
        event.stopPropagation();
        open = !open;
        bubble.transition().duration(150).attr('opacity', open ? 1 : 0);
        bubble.attr('pointer-events', open ? 'all' : 'none');
        icon.select('circle').transition().duration(150).attr('fill', open ? '#818cf8' : '#6366f1');
    });
}

// ========== VISUALIZATION ==========
function isEmptyData(data) {
    if (!data) return true;
    if (data.type === 'heap' && (!data.nodes || data.nodes.length === 0)) return true;
    if (data.keys && data.keys.length === 0 && data.children && data.children.length === 0) return true;
    return false;
}

function binaryTreeToHierarchy(node) {
    if (!node) return null;
    const d = { data: node, children: [] };
    if (node.left) d.children.push(binaryTreeToHierarchy(node.left));
    if (node.right) d.children.push(binaryTreeToHierarchy(node.right));
    if (node.left === null && node.right !== null) d.children.unshift({ data: { _placeholder: true }, _isPlaceholder: true });
    else if (node.right === null && node.left !== null) d.children.push({ data: { _placeholder: true }, _isPlaceholder: true });
    if (d.children.length === 0) delete d.children;
    return d;
}

function renderVisualization(treeData) {
    currentTreeData = treeData;
    const canvas = document.getElementById('canvas');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    d3.select('#canvas').selectAll('svg').remove();

    if (!treeData || isEmptyData(treeData)) {
        const svg = d3.select('#canvas').append('svg').attr('width', width).attr('height', height);
        svg.append('text')
            .attr('x', width / 2).attr('y', height / 2)
            .attr('text-anchor', 'middle').attr('font-size', '15px').attr('font-family', 'Inter, sans-serif')
            .attr('fill', '#999')
            .text(currentStructure ? 'Empty \u2014 perform an operation to begin' : 'Select a data structure from the sidebar');
        return;
    }

    const svg = d3.select('#canvas').append('svg').attr('width', width).attr('height', height);
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    switch (currentStructure) {
        case 'threaded': renderThreadedTree(g, treeData, innerWidth, innerHeight); break;
        case 'avl': renderAVLTree(g, treeData, innerWidth, innerHeight); break;
        case 'rbtree': renderRBTree(g, treeData, innerWidth, innerHeight); break;
        case 'heap': renderHeapTree(g, treeData, innerWidth, innerHeight); break;
        case 'btree': renderBTree(g, treeData, innerWidth, innerHeight); break;
        case 'bplus': renderBPlusTree(g, treeData, innerWidth, innerHeight); break;
    }

    const zoom = d3.zoom().scaleExtent([0.2, 4]).on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity.translate(margin.left, margin.top));
}

function renderThreadedTree(g, treeData, width, height) {
    const root = binaryTreeToHierarchy(treeData);
    if (!root) return;
    const hierarchy = d3.hierarchy(root, d => d.children);
    const treeLayout = d3.tree().size([width, Math.max(height - 40, 100)]).separation((a, b) => a.parent === b.parent ? 1.2 : 1.8);
    treeLayout(hierarchy);

    g.selectAll('.link').data(hierarchy.links().filter(d => !d.target.data._isPlaceholder))
        .enter().append('path').attr('class', 'link')
        .attr('d', d3.linkVertical().x(d => d.x).y(d => d.y)).attr('stroke', '#adb5bd').attr('stroke-width', 2);

    const nodes = g.selectAll('.node').data(hierarchy.descendants().filter(d => !d.data._isPlaceholder))
        .enter().append('g').attr('class', 'node').attr('transform', d => `translate(${d.x},${d.y})`);

    nodes.append('circle').attr('r', 24)
        .attr('fill', '#9b59b6').attr('stroke', '#fff').attr('stroke-width', 2.5);
    nodes.append('text').attr('dy', '5').attr('text-anchor', 'middle').attr('fill', 'white')
        .attr('font-size', '14px').attr('font-weight', '700').attr('font-family', 'Inter, sans-serif')
        .text(d => d.data.data.value);
    nodes.append('text').attr('dy', '14').attr('text-anchor', 'middle').attr('fill', 'rgba(255,255,255,0.8)')
        .attr('font-size', '8px').attr('font-family', 'Inter, sans-serif')
        .text(d => (d.data.data.leftThread ? 'L' : '') + (d.data.data.rightThread ? 'R' : ''));
    nodes.attr('opacity', 0).transition().duration(400).delay((d, i) => i * 40).attr('opacity', 1);
    nodes.each(function(d) {
        const nd = d.data.data, pd = d.parent ? d.parent.data.data : null;
        addCommentIcon(d3.select(this), getCommentForNode('threaded', nd, pd, null));
    });
}

function renderAVLTree(g, treeData, width, height) {
    const root = binaryTreeToHierarchy(treeData);
    if (!root) return;
    const hierarchy = d3.hierarchy(root, d => d.children);
    const treeLayout = d3.tree().size([width, Math.max(height - 40, 100)]).separation((a, b) => a.parent === b.parent ? 1.2 : 1.8);
    treeLayout(hierarchy);

    g.selectAll('.link').data(hierarchy.links().filter(d => !d.target.data._isPlaceholder))
        .enter().append('path').attr('class', 'link')
        .attr('d', d3.linkVertical().x(d => d.x).y(d => d.y)).attr('stroke', '#adb5bd').attr('stroke-width', 2);

    const nodes = g.selectAll('.node').data(hierarchy.descendants().filter(d => !d.data._isPlaceholder))
        .enter().append('g').attr('class', 'node').attr('transform', d => `translate(${d.x},${d.y})`);

    nodes.append('circle').attr('r', 24).attr('fill', d => {
        const nd = d.data.data;
        const lh = nd.left ? nd.left.height : 0;
        const rh = nd.right ? nd.right.height : 0;
        const bf = Math.abs(lh - rh);
        if (bf === 0) return '#2ecc71';
        if (bf === 1) return '#f1c40f';
        return '#e74c3c';
    }).attr('stroke', '#fff').attr('stroke-width', 2.5);
    nodes.append('text').attr('dy', '-1').attr('text-anchor', 'middle').attr('fill', 'white')
        .attr('font-size', '14px').attr('font-weight', '700').attr('font-family', 'Inter, sans-serif')
        .text(d => d.data.data.value);
    nodes.append('text').attr('dy', '12').attr('text-anchor', 'middle').attr('fill', 'rgba(255,255,255,0.75)')
        .attr('font-size', '9px').attr('font-family', 'Inter, sans-serif').text(d => `h:${d.data.data.height}`);
    nodes.attr('opacity', 0).transition().duration(400).delay((d, i) => i * 40).attr('opacity', 1);
    nodes.each(function(d) {
        const nd = d.data.data, pd = d.parent ? d.parent.data.data : null;
        addCommentIcon(d3.select(this), getCommentForNode('avl', nd, pd, null));
    });
}

function renderRBTree(g, treeData, width, height) {
    const root = binaryTreeToHierarchy(treeData);
    if (!root) return;
    const hierarchy = d3.hierarchy(root, d => d.children);
    const treeLayout = d3.tree().size([width, Math.max(height - 40, 100)]).separation((a, b) => a.parent === b.parent ? 1.2 : 1.8);
    treeLayout(hierarchy);

    g.selectAll('.link').data(hierarchy.links().filter(d => !d.target.data._isPlaceholder))
        .enter().append('path').attr('class', 'link')
        .attr('d', d3.linkVertical().x(d => d.x).y(d => d.y)).attr('stroke', '#adb5bd').attr('stroke-width', 2);

    const nodes = g.selectAll('.node').data(hierarchy.descendants().filter(d => !d.data._isPlaceholder))
        .enter().append('g').attr('class', 'node').attr('transform', d => `translate(${d.x},${d.y})`);

    nodes.append('circle').attr('r', 24)
        .attr('fill', d => d.data.data.color === 'RED' ? '#e74c3c' : '#2c3e50')
        .attr('stroke', d => d.data.data.color === 'RED' ? '#c0392b' : '#1a252f').attr('stroke-width', 3);
    nodes.append('text').attr('dy', '-3').attr('text-anchor', 'middle').attr('fill', 'white')
        .attr('font-size', '14px').attr('font-weight', '700').attr('font-family', 'Inter, sans-serif')
        .text(d => d.data.data.value);
    nodes.append('text').attr('dy', '11').attr('text-anchor', 'middle').attr('fill', 'rgba(255,255,255,0.7)')
        .attr('font-size', '8px').attr('font-weight', '600').attr('font-family', 'Inter, sans-serif')
        .text(d => d.data.data.color);
    nodes.attr('opacity', 0).transition().duration(400).delay((d, i) => i * 40).attr('opacity', 1);
    nodes.each(function(d) {
        const nd = d.data.data, pd = d.parent ? d.parent.data.data : null;
        addCommentIcon(d3.select(this), getCommentForNode('rbtree', nd, pd, null));
    });
}

function renderHeapTree(g, heapData, width, height) {
    if (!heapData || !heapData.nodes || heapData.nodes.length === 0) {
        g.append('text').attr('x', width / 2).attr('y', height / 2).attr('text-anchor', 'middle').attr('fill', '#999')
            .attr('font-size', '15px').attr('font-family', 'Inter, sans-serif').text('Empty heap');
        return;
    }
    const nodes = heapData.nodes;
    function buildHierarchy(i) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        const d = { data: nodes[i], children: [] };
        if (left < nodes.length) d.children.push(buildHierarchy(left));
        if (right < nodes.length) d.children.push(buildHierarchy(right));
        if (d.children.length === 0) delete d.children;
        return d;
    }
    const root = buildHierarchy(0);
    const hierarchy = d3.hierarchy(root, d => d.children);
    const treeLayout = d3.tree().size([width, Math.max(height - 40, 100)]).separation((a, b) => 1.2);
    treeLayout(hierarchy);

    g.selectAll('.link').data(hierarchy.links()).enter().append('path').attr('class', 'link')
        .attr('d', d3.linkVertical().x(d => d.x).y(d => d.y)).attr('stroke', '#adb5bd').attr('stroke-width', 2);
    const nodeGs = g.selectAll('.node').data(hierarchy.descendants()).enter().append('g')
        .attr('class', 'node').attr('transform', d => `translate(${d.x},${d.y})`);
    nodeGs.append('circle').attr('r', 24).attr('fill', d => d.data.data.index === 0 ? '#e74c3c' : '#3498db')
        .attr('stroke', '#fff').attr('stroke-width', 2);
    nodeGs.append('text').attr('dy', '5').attr('text-anchor', 'middle').attr('fill', 'white')
        .attr('font-size', '14px').attr('font-weight', '700').attr('font-family', 'Inter, sans-serif')
        .text(d => d.data.data.value);
    nodeGs.attr('opacity', 0).transition().duration(400).delay((d, i) => i * 40).attr('opacity', 1);
    nodeGs.each(function(d) {
        addCommentIcon(d3.select(this), getCommentForNode('heap', d.data.data, null, nodes));
    });
}

function renderBTree(g, treeData, width, height) {
    function btreeToHierarchy(node) {
        if (!node) return null;
        const d = { data: node, children: [] };
        if (node.children && node.children.length > 0) {
            d.children = node.children.filter(c => c).map(btreeToHierarchy).filter(c => c);
        }
        if (d.children.length === 0) delete d.children;
        return d;
    }
    const root = btreeToHierarchy(treeData);
    if (!root) return;
    const hierarchy = d3.hierarchy(root, d => d.children);
    const treeLayout = d3.tree().size([width, Math.max(height - 60, 80)])
        .separation((a, b) => Math.max((a.data.data.keys || []).length + (b.data.data.keys || []).length, 2) / 2 + 0.5);
    treeLayout(hierarchy);

    g.selectAll('.link').data(hierarchy.links()).enter().append('line').attr('class', 'link')
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y + 16)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y - 16)
        .attr('stroke', '#adb5bd').attr('stroke-width', 1.5);

    const keyW = 36;
    const nodes = g.selectAll('.node').data(hierarchy.descendants()).enter().append('g')
        .attr('class', 'node btree-node').attr('transform', d => `translate(${d.x},${d.y})`);
    nodes.each(function (d) {
        const nodeG = d3.select(this);
        const keys = d.data.data.keys || [];
        const totalW = Math.max(keys.length * keyW, keyW);
        nodeG.append('rect').attr('x', -totalW / 2).attr('y', -16).attr('width', totalW).attr('height', 32)
            .attr('rx', 5).attr('fill', d.data.data.isLeaf ? '#3498db' : '#8e44ad')
            .attr('stroke', d.data.data.isLeaf ? '#2980b9' : '#7d3c98').attr('stroke-width', 2);
        keys.forEach((key, i) => {
            if (i > 0) {
                nodeG.append('line').attr('x1', -totalW / 2 + i * keyW).attr('y1', -16)
                    .attr('x2', -totalW / 2 + i * keyW).attr('y2', 16)
                    .attr('stroke', 'rgba(255,255,255,0.3)').attr('stroke-width', 1);
            }
            nodeG.append('text').attr('x', -totalW / 2 + i * keyW + keyW / 2).attr('y', 5)
                .attr('text-anchor', 'middle').attr('fill', 'white').attr('font-size', '12px')
                .attr('font-weight', '700').attr('font-family', 'Inter, sans-serif').text(key);
        });
        const nd = d.data.data, pd = d.parent ? d.parent.data.data : null;
        addCommentIcon(nodeG, getCommentForNode('btree', nd, pd, null), totalW / 2 + 12, 0);
    });
    nodes.attr('opacity', 0).transition().duration(400).delay((d, i) => i * 50).attr('opacity', 1);
}

function renderBPlusTree(g, treeData, width, height) {
    function bplusToHierarchy(node) {
        if (!node) return null;
        const d = { data: node, children: [] };
        if (node.children && node.children.length > 0) {
            d.children = node.children.filter(c => c).map(bplusToHierarchy).filter(c => c);
        }
        if (d.children.length === 0) delete d.children;
        return d;
    }
    const root = bplusToHierarchy(treeData);
    if (!root) return;
    const hierarchy = d3.hierarchy(root, d => d.children);
    const treeLayout = d3.tree().size([width, Math.max(height - 60, 80)])
        .separation((a, b) => (a.data.data.keys ? a.data.data.keys.length : 1) + (b.data.data.keys ? b.data.data.keys.length : 1) / 3 + 0.8);
    treeLayout(hierarchy);

    const defs = g.append('defs');
    defs.append('marker').attr('id', 'bplus-arrow').attr('viewBox', '0 0 10 10').attr('refX', 9).attr('refY', 5)
        .attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto').append('path')
        .attr('d', 'M 0 0 L 10 5 L 0 10 Z').attr('fill', '#e67e22');

    g.selectAll('.link').data(hierarchy.links()).enter().append('line').attr('class', 'link')
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y + 16)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y - 16)
        .attr('stroke', '#adb5bd').attr('stroke-width', 1.5);

    const keyW = 38;
    const nodes = g.selectAll('.node').data(hierarchy.descendants()).enter().append('g')
        .attr('class', 'node bplus-node').attr('transform', d => `translate(${d.x},${d.y})`);
    nodes.each(function (d) {
        const nodeG = d3.select(this);
        const keys = d.data.data.keys || [];
        const totalW = Math.max(keys.length * keyW, keyW);
        nodeG.append('rect').attr('x', -totalW / 2).attr('y', -16).attr('width', totalW).attr('height', 32)
            .attr('rx', 5).attr('fill', d.data.data.isLeaf ? '#3498db' : '#8e44ad')
            .attr('stroke', d.data.data.isLeaf ? '#2980b9' : '#7d3c98').attr('stroke-width', 2);
        keys.forEach((key, i) => {
            if (i > 0) {
                nodeG.append('line').attr('x1', -totalW / 2 + i * keyW).attr('y1', -16)
                    .attr('x2', -totalW / 2 + i * keyW).attr('y2', 16)
                    .attr('stroke', 'rgba(255,255,255,0.3)').attr('stroke-width', 1);
            }
            nodeG.append('text').attr('x', -totalW / 2 + i * keyW + keyW / 2).attr('y', 5)
                .attr('text-anchor', 'middle').attr('fill', 'white').attr('font-size', '13px')
                .attr('font-weight', '700').attr('font-family', 'Inter, sans-serif').text(key);
        });
        const nd = d.data.data, pd = d.parent ? d.parent.data.data : null;
        addCommentIcon(nodeG, getCommentForNode('bplus', nd, pd, null), totalW / 2 + 12, 0);
    });
    const leaves = hierarchy.leaves();
    for (let i = 0; i < leaves.length - 1; i++) {
        const cur = leaves[i];
        const nxt = leaves[i + 1];
        const curHW = ((cur.data.data.keys || []).length * keyW) / 2 || keyW / 2;
        const nxtHW = ((nxt.data.data.keys || []).length * keyW) / 2 || keyW / 2;
        g.append('line').attr('x1', cur.x + curHW + 4).attr('y1', cur.y).attr('x2', nxt.x - nxtHW - 4).attr('y2', nxt.y)
            .attr('stroke', '#e67e22').attr('stroke-width', 1.5).attr('stroke-dasharray', '5,3')
            .attr('marker-end', 'url(#bplus-arrow)');
    }
    nodes.attr('opacity', 0).transition().duration(400).delay((d, i) => i * 60).attr('opacity', 1);
}

// ========== SNAPSHOT ==========
function takeSnapshot() {
    const canvasEl = document.getElementById('canvas');
    const svg = canvasEl.querySelector('svg');

    if (!svg) {
        showToast('Nothing to snapshot — build a tree first', 'warning');
        return;
    }

    const svgWidth = canvasEl.clientWidth || 800;
    const svgHeight = canvasEl.clientHeight || 600;

    // Clone SVG and fix dimensions
    const svgClone = svg.cloneNode(true);
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('width', svgWidth);
    svgClone.setAttribute('height', svgHeight);

    // Inline computed styles so CSS classes & CSS variables resolve in the export.
    // Without this, paths default to black fill — causing the thick-band artifact.
    const svgProps = [
        'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-dashoffset',
        'stroke-linecap', 'stroke-linejoin', 'opacity', 'font-size', 'font-weight',
        'font-family', 'text-anchor', 'dominant-baseline', 'marker-end'
    ];
    const origEls = Array.from(svg.querySelectorAll('*'));
    const cloneEls = Array.from(svgClone.querySelectorAll('*'));
    origEls.forEach((el, i) => {
        const computed = window.getComputedStyle(el);
        svgProps.forEach(prop => {
            const val = computed.getPropertyValue(prop);
            if (val) cloneEls[i].setAttribute(prop, val);
        });
    });

    // Inject background rect (theme-aware)
    const isDark = document.body.classList.contains('dark');
    const bgColor = isDark ? '#1a1b2e' : '#f8f9fa';
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('width', svgWidth);
    bgRect.setAttribute('height', svgHeight);
    bgRect.setAttribute('fill', bgColor);
    svgClone.insertBefore(bgRect, svgClone.firstChild);

    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = function () {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = svgWidth;
        offCanvas.height = svgHeight;
        const ctx = offCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        const name = currentStructure || 'tree';
        const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
        const link = document.createElement('a');
        link.download = `${name}_${ts}.png`;
        link.href = offCanvas.toDataURL('image/png');
        link.click();
        showToast('Snapshot saved!', 'success');
    };
    img.onerror = function () {
        URL.revokeObjectURL(url);
        showToast('Snapshot failed', 'error');
    };
    img.src = url;
}

// ========== TREE DETAILS ==========
const TREE_DETAILS = {
    threaded: {
        title: 'Threaded Binary Tree',
        algorithm: [
            'Start at the root. If value is smaller, move left; if larger, move right.',
            'Keep moving until you hit an empty spot (a null pointer).',
            'Create a new node and place it at that empty spot.',
            'If the left pointer was null → set a left thread pointing to the inorder predecessor.',
            'If the right pointer was null → set a right thread pointing to the inorder successor.',
            'Update the old thread that used to point here so it now points to the new node.'
        ],
        rules: [
            'Smaller values always go left, larger values always go right (same as normal BST).',
            'Null left/right pointers are replaced with "threads" — shortcuts to neighbors.',
            'A left thread points to the inorder predecessor (the node visited just before this one).',
            'A right thread points to the inorder successor (the node visited just after this one).',
            '"L" shown inside a node means its left pointer is a thread, not a real child.',
            '"R" shown inside a node means its right pointer is a thread, not a real child.',
            'Threads allow full tree traversal without needing any extra memory (no recursion stack).'
        ]
    },
    avl: {
        title: 'AVL Tree',
        algorithm: [
            'Insert the value like a normal BST — go left if smaller, right if larger.',
            'After inserting, go back up to the root and check each node\'s balance.',
            'Balance Factor (BF) = Height of left subtree − Height of right subtree.',
            'If every node has BF = −1, 0, or +1 → tree is already balanced. Done!',
            'If any node has BF = +2 or −2 → perform a rotation to fix the imbalance.',
            'LL case (inserted in left-left direction) → single right rotation.',
            'RR case → single left rotation. LR case → left rotate then right rotate. RL → right then left.',
            'After the rotation the tree is balanced again. Height stays O(log n).'
        ],
        rules: [
            'Every single node must have a Balance Factor of −1, 0, or +1. No exceptions.',
            'Balance Factor = Left subtree height − Right subtree height.',
            'The number shown inside each node (h:X) is its current height from the bottom.',
            'Darkest node (BF = 0) → perfectly balanced on both sides.',
            'Medium grey node (|BF| = 1) → slightly off balance but still valid.',
            'If BF reaches ±2 a rotation fires automatically — you never see an unbalanced AVL tree.',
            'Because it stays balanced, search, insert, and delete are always O(log n).'
        ]
    },
    rbtree: {
        title: 'Red-Black Tree',
        algorithm: [
            'Insert the new node like a normal BST. Color it RED.',
            'If its parent is BLACK → no violation. Done!',
            'If its parent is also RED → violation! Look at the parent\'s sibling (the uncle node).',
            'Case 1 — Uncle is RED: Recolor parent and uncle to BLACK, grandparent to RED. Move up.',
            'Case 2 — Uncle is BLACK, node is an inner child: Rotate to make it an outer child (go to Case 3).',
            'Case 3 — Uncle is BLACK, node is an outer child: Rotate the grandparent and swap colors.',
            'After all fixes, force the root to BLACK. Repeat checking upward if needed.'
        ],
        rules: [
            'Each node is either RED (shown as lighter grey) or BLACK (shown as near-black).',
            'The root is ALWAYS BLACK — no exceptions.',
            'A RED node can never have a RED parent (no two REDs in a row on any path).',
            'Every path from root down to any null must pass through the same number of BLACK nodes.',
            'New nodes are always inserted as RED first, then fixes are applied if needed.',
            'Rotations and recoloring fix violations automatically — the tree self-corrects.',
            'This guarantees the tree height stays within 2× log n, so all ops are O(log n).'
        ]
    },
    heap: {
        title: 'Min-Heap Tree',
        algorithm: [
            'Add the new value at the very end (next available slot in the array).',
            'Compare it with its parent. If the new value is smaller than the parent → swap.',
            'Keep comparing and swapping upward. This is called "heapify up" or "bubble up".',
            'Stop when the parent is smaller than the new value, or you reach the root.',
            'For Extract Min: remove the root, move the last element to the root position.',
            'Then "heapify down": swap the root with its smallest child until the heap rule holds again.'
        ],
        rules: [
            'The parent node is ALWAYS smaller than or equal to both of its children. Always.',
            'The darkest node at the top = the root = the minimum (smallest) element in the heap.',
            'The tree is always a Complete Binary Tree — filled level by level, left to right.',
            'Array index formula: left child = 2i+1, right child = 2i+2, parent = (i−1)/2.',
            'Inserting adds to the end and bubbles up — structure stays complete.',
            'Extract Min gives the smallest element in O(log n) time.',
            'Heap is used in priority queues, scheduling systems, and heap sort.'
        ]
    },
    btree: {
        title: 'B-Tree',
        algorithm: [
            'Use the keys in each node as guides — go to the child pointer between the two nearest keys.',
            'Keep traversing down until you reach a leaf node.',
            'Insert the new key into that leaf node in sorted order.',
            'If the leaf now has too many keys (overflow) → split it into two nodes.',
            'The middle key from the split moves UP to the parent node.',
            'If the parent also overflows after receiving the key → split the parent too.',
            'If even the root splits, a brand new root is created and the tree grows one level taller.'
        ],
        rules: [
            'Each node can hold multiple keys, all stored in sorted (ascending) order.',
            'Darker node = internal node (acts as a guide only). Lighter = leaf node (stores data).',
            'All leaf nodes are always at the exact same level — B-Trees are perfectly balanced.',
            'A node with n keys has exactly n+1 child pointers.',
            'No data is duplicated — each key appears in exactly one place.',
            'Splitting keeps the tree balanced without any rotations.',
            'B-Trees are used in databases and file systems because they minimize disk reads.'
        ]
    },
    bplus: {
        title: 'B+ Tree',
        algorithm: [
            'Always insert into a leaf node. Use internal nodes only as guides to find the right leaf.',
            'Insert the key into the leaf in sorted order.',
            'If the leaf is full (overflow) → split it: left half stays, right half goes to a new node.',
            'Copy the first key of the right half UP to the parent (the key stays in the leaf too!).',
            'If an internal node overflows → split it and push the middle key up (it is removed from below).',
            'All leaf nodes always stay linked together left to right for fast range queries.'
        ],
        rules: [
            'ALL actual data is stored only in leaf nodes — internal nodes are just guides.',
            'Internal nodes hold separator keys that tell you which direction to go.',
            'All leaf nodes are linked in order (shown by the dashed arrows →).',
            'This makes range queries very fast: find the start leaf, then just follow the links.',
            'When a leaf splits, the first key of the right half is COPIED up (stays in leaf).',
            'When an internal node splits, the middle key is PUSHED up (removed from that level).',
            'B+ Trees power almost every modern database engine (MySQL, PostgreSQL, SQLite, etc.).'
        ]
    }
};

function showTreeDetails(structure) {
    const d = TREE_DETAILS[structure];
    if (!d) return;
    document.getElementById('dsModalTitle').textContent = d.title;
    document.getElementById('dsModalBody').innerHTML = `
        <div class="detail-section">
            <div class="detail-section-title">How Insertion Works</div>
            <ol class="detail-steps">
                ${d.algorithm.map((s, i) => `<li><span class="step-num">${i + 1}</span><span>${s}</span></li>`).join('')}
            </ol>
        </div>
        <div class="detail-section">
            <div class="detail-section-title">Rules to Remember</div>
            <ul class="detail-rules">
                ${d.rules.map(r => `<li>${r}</li>`).join('')}
            </ul>
        </div>`;
    document.getElementById('dsModal').classList.add('open');
}

// ========== EVENT LISTENERS ==========
document.querySelectorAll('.ds-button').forEach(btn => {
    btn.addEventListener('click', () => selectStructure(btn.dataset.structure));
});
document.getElementById('btnInsert').addEventListener('click', insert);
document.getElementById('btnDelete').addEventListener('click', deleteValue);
document.getElementById('btnSearch').addEventListener('click', search);
document.getElementById('btnExtract').addEventListener('click', extractMin);
document.getElementById('btnClear').addEventListener('click', clear);
document.getElementById('snapshotBtn').addEventListener('click', takeSnapshot);

document.getElementById('inputValue').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') insert();
});

document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    document.getElementById('themeToggle').innerHTML = isDark ? '&#9788;' : '&#9789;';
    localStorage.setItem('ads-theme', isDark ? 'dark' : 'light');
    if (currentTreeData) renderVisualization(currentTreeData);
});
if (localStorage.getItem('ads-theme') === 'dark') {
    document.body.classList.add('dark');
    document.getElementById('themeToggle').innerHTML = '&#9788;';
}

document.querySelectorAll('.ds-detail-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); showTreeDetails(btn.dataset.structure); });
});
document.getElementById('dsModalClose').addEventListener('click', () => {
    document.getElementById('dsModal').classList.remove('open');
});
document.getElementById('dsModal').addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('open');
});

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (currentTreeData) renderVisualization(currentTreeData); }, 250);
});

renderVisualization(null);

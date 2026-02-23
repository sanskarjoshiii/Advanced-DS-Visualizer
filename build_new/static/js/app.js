// ========== STATE & CONSTANTS ==========
let currentStructure = null;
let operations = [];
let currentTreeData = null;
let isLoading = false;

const API_BASE = 'http://localhost:18080/api';

const DS_NAMES = {
    threaded: 'Threaded Binary Tree',
    avl: 'AVL Tree',
    rbtree: 'Red-Black Tree',
    heap: 'Heap Tree',
    huffman: 'Huffman Tree',
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
    huffman: {
        build: 'O(n log n)', space: 'O(k)',
        description: 'Optimal prefix code from character frequencies; built from text string'
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
    if (currentStructure === 'huffman') return true;
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
    const isHuffman = structure === 'huffman';

    document.getElementById('btnInsert').style.display = isHuffman ? 'none' : 'inline-block';
    document.getElementById('btnDelete').style.display = (isHeap || isHuffman) ? 'none' : 'inline-block';
    document.getElementById('btnSearch').style.display = (isHeap || isHuffman) ? 'none' : 'inline-block';
    document.getElementById('btnExtract').style.display = isHeap ? 'inline-block' : 'none';
    document.getElementById('btnBuild').style.display = isHuffman ? 'inline-block' : 'none';

    if (isHuffman) {
        document.getElementById('inputValue').placeholder = 'Enter text to build Huffman tree (e.g. hello world)';
    } else if (isHeap) {
        document.getElementById('inputValue').placeholder = 'Enter a number to insert';
    } else {
        document.getElementById('inputValue').placeholder = 'Enter a number';
    }

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
    if (currentStructure === 'huffman') return;
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

async function buildHuffman() {
    if (currentStructure !== 'huffman') return;
    const text = document.getElementById('inputValue').value.trim();
    if (!text) {
        showToast('Enter text to build Huffman tree', 'warning');
        return;
    }
    showLoading(true);
    try {
        const response = await fetch(`${API_BASE}/huffman/build`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        currentTreeData = data.tree;
        addOperation('build', `"${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`);
        renderVisualization(currentTreeData);
        document.getElementById('inputValue').value = '';
        showToast('Huffman tree built', 'success');
    } catch (error) {
        console.error('Build error:', error);
        showToast(`Build failed: ${error.message}`, 'error');
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
        case 'huffman': renderHuffmanTree(g, treeData, innerWidth, innerHeight); break;
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
}

function renderHuffmanTree(g, treeData, width, height) {
    if (!treeData || (!treeData.left && !treeData.right)) {
        g.append('text').attr('x', width / 2).attr('y', height / 2).attr('text-anchor', 'middle').attr('fill', '#999')
            .attr('font-size', '15px').attr('font-family', 'Inter, sans-serif')
            .text('Enter text and click Build to create Huffman tree');
        return;
    }
    function huffToHierarchy(node) {
        if (!node) return null;
        const d = { data: { char: node.char || '', freq: node.freq }, children: [] };
        if (node.left) d.children.push(huffToHierarchy(node.left));
        if (node.right) d.children.push(huffToHierarchy(node.right));
        if (d.children.length === 0) delete d.children;
        return d;
    }
    const root = huffToHierarchy(treeData);
    if (!root) return;
    const hierarchy = d3.hierarchy(root, d => d.children);
    const treeLayout = d3.tree().size([width, Math.max(height - 40, 100)]).separation((a, b) => 1.5);
    treeLayout(hierarchy);

    g.selectAll('.link').data(hierarchy.links()).enter().append('path').attr('class', 'link')
        .attr('d', d3.linkVertical().x(d => d.x).y(d => d.y)).attr('stroke', '#adb5bd').attr('stroke-width', 2);
    const nodes = g.selectAll('.node').data(hierarchy.descendants()).enter().append('g')
        .attr('class', 'node').attr('transform', d => `translate(${d.x},${d.y})`);
    nodes.append('circle').attr('r', 22)
        .attr('fill', d => d.data.data.char ? '#2ecc71' : '#8e44ad').attr('stroke', '#fff').attr('stroke-width', 2);
    nodes.append('text').attr('dy', '4').attr('text-anchor', 'middle').attr('fill', 'white')
        .attr('font-size', '12px').attr('font-weight', '700').attr('font-family', 'Inter, sans-serif')
        .text(d => d.data.data.char || d.data.data.freq);
    nodes.append('text').attr('dy', '14').attr('text-anchor', 'middle').attr('fill', 'rgba(255,255,255,0.8)')
        .attr('font-size', '9px').attr('font-family', 'Inter, sans-serif')
        .text(d => d.data.data.char ? '' : 'freq:' + d.data.data.freq);
    nodes.attr('opacity', 0).transition().duration(400).delay((d, i) => i * 40).attr('opacity', 1);
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

// ========== EVENT LISTENERS ==========
document.querySelectorAll('.ds-button').forEach(btn => {
    btn.addEventListener('click', () => selectStructure(btn.dataset.structure));
});
document.getElementById('btnInsert').addEventListener('click', insert);
document.getElementById('btnDelete').addEventListener('click', deleteValue);
document.getElementById('btnSearch').addEventListener('click', search);
document.getElementById('btnExtract').addEventListener('click', extractMin);
document.getElementById('btnBuild').addEventListener('click', buildHuffman);
document.getElementById('btnClear').addEventListener('click', clear);

document.getElementById('inputValue').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (currentStructure === 'huffman') buildHuffman();
        else insert();
    }
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

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (currentTreeData) renderVisualization(currentTreeData); }, 250);
});

renderVisualization(null);

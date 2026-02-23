# Advanced Data Structures Visualization - C++ Project

A comprehensive C++ web application using Crow framework for visualizing advanced data structures.

## Features

- 🌳 **AVL Tree** - Self-balancing with rotations (LL, RR, LR, RL)
- 🔴 **Red-Black Tree** - Color-coded nodes with rotations
- 📖 **B+ Tree** - Node splitting and leaf chaining
- 🌀 **Fibonacci Heap** - Lazy merging and consolidation
- 🔤 **Trie** - String prefix matching
- 🗜️ **Compressed Trie** - Space-efficient string storage
- 📏 **Segment Tree** - Range queries and updates

## Requirements

- C++17 or higher compiler (g++, clang++, or MSVC)
- CMake 3.15+ OR Make
- Git (for downloading Crow framework)
- Modern web browser

## Building

### Option 1: Using CMake (Recommended)

```bash
mkdir build
cd build
cmake ..
make
```

### Option 2: Using Makefile

```bash
make
```

The Makefile will automatically download Crow framework to `third_party/crow`.

## Running

After building:

```bash
# If using CMake
./build/ADSVisualization

# If using Makefile
./ads_visualization
```

The server will start on `http://localhost:18080`

Open your browser and navigate to `http://localhost:18080`

## Project Structure

```
.
├── CMakeLists.txt          # CMake build configuration
├── Makefile               # Make build configuration
├── BUILD.md               # Detailed build instructions
├── src/
│   ├── main.cpp           # Crow server and API endpoints
│   └── data-structures/   # Data structure implementations
│       ├── avl_tree.h/cpp
│       ├── red_black_tree.h/cpp
│       ├── b_plus_tree.h/cpp
│       ├── fibonacci_heap.h/cpp
│       ├── trie.h/cpp
│       ├── compressed_trie.h/cpp
│       └── segment_tree.h/cpp
└── static/                # Frontend files
    ├── index.html
    ├── css/style.css
    └── js/app.js
```

## API Endpoints

All endpoints return JSON responses with CORS headers enabled.

### AVL Tree
- `POST /api/avl/insert` - Insert value
- `POST /api/avl/delete` - Delete value
- `POST /api/avl/search` - Search value
- `GET /api/avl/tree` - Get tree structure
- `POST /api/avl/clear` - Clear tree

### Red-Black Tree
- `POST /api/rbtree/insert`
- `POST /api/rbtree/delete`
- `POST /api/rbtree/search`
- `GET /api/rbtree/tree`
- `POST /api/rbtree/clear`

### B+ Tree
- `POST /api/bplus/insert`
- `POST /api/bplus/delete`
- `POST /api/bplus/search`
- `GET /api/bplus/tree`
- `POST /api/bplus/clear`

### Fibonacci Heap
- `POST /api/fibheap/insert`
- `POST /api/fibheap/extract`
- `GET /api/fibheap/tree`
- `POST /api/fibheap/clear`

### Trie
- `POST /api/trie/insert` - Body: `{"word": "example"}`
- `POST /api/trie/delete`
- `POST /api/trie/search`
- `GET /api/trie/tree`
- `POST /api/trie/clear`

### Compressed Trie
- `POST /api/ctrie/insert` - Body: `{"word": "example"}`
- `POST /api/ctrie/delete`
- `POST /api/ctrie/search`
- `GET /api/ctrie/tree`
- `POST /api/ctrie/clear`

### Segment Tree
- `POST /api/segment/build` - Body: `{"array": [1, 2, 3, 4, 5]}`
- `POST /api/segment/query` - Body: `{"left": 0, "right": 2}`
- `GET /api/segment/tree`
- `POST /api/segment/clear`

## Usage

1. Build the project using CMake or Make
2. Run the executable
3. Open `http://localhost:18080` in your browser
4. Select a data structure from the sidebar
5. Perform operations (insert, delete, search, etc.)
6. View the visualization and complexity analysis

## Troubleshooting

- **Crow not found**: The build system will automatically download Crow. Ensure Git is installed.
- **Port already in use**: Change the port in `src/main.cpp` (line with `app.port(18080)`)
- **Compilation errors**: Ensure C++17 support is enabled

## License

Educational use only.

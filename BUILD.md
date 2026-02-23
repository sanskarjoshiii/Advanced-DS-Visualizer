# Building the C++ Project

## Prerequisites

- C++17 compiler (g++ or clang++)
- CMake 3.15+ OR Make
- Git (for downloading Crow)

## Option 1: Using CMake (Recommended)

```bash
# Create build directory
mkdir build
cd build

# Configure and build
cmake ..
make

# Run
./ADSVisualization
```

## Option 2: Using Makefile

```bash
# Build (will automatically download Crow)
make

# Run
./ads_visualization
```

## Option 3: Manual Build

If you have Crow installed manually:

```bash
g++ -std=c++17 -I/path/to/crow/include -Isrc src/main.cpp src/data-structures/*.cpp -o ads_visualization -pthread
```

## Running

After building, run the executable:

```bash
./ads_visualization
# or
./ADSVisualization
```

The server will start on `http://localhost:18080`

Open your browser and navigate to `http://localhost:18080`

## Troubleshooting

### Crow not found
- Make sure Git is installed
- The Makefile will automatically download Crow to `third_party/crow`
- For CMake, it uses FetchContent to download Crow automatically

### Compilation errors
- Ensure you're using C++17 or higher
- Check that all header files are in the correct locations
- Verify Crow framework is properly included

### Port already in use
- Change the port in `src/main.cpp`: `app.port(18080)` to a different port
- Or stop the process using port 18080

@echo off
echo Building ADS Visualization...
g++ -std=c++17 -O2 -Ithird_party/crow/include -Ithird_party/asio/include -Isrc src/main.cpp src/data-structures/avl_tree.cpp src/data-structures/red_black_tree.cpp src/data-structures/b_plus_tree.cpp src/data-structures/threaded_binary_tree.cpp src/data-structures/heap_tree.cpp src/data-structures/b_tree.cpp -o ads_visualization -lpthread -lws2_32 -lmswsock
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)
echo Build successful! Starting server...
echo Open http://localhost:18080 in your browser
ads_visualization.exe
pause

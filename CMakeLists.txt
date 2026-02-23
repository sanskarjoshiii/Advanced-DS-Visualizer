cmake_minimum_required(VERSION 3.15)
project(ADSVisualization)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Dependencies (Crow + standalone Asio)
include(FetchContent)

# Standalone Asio (Crow 1.1+ uses standalone Asio, not Boost.Asio)
FetchContent_Declare(
  asio
  GIT_REPOSITORY https://github.com/chriskohlhoff/asio.git
  GIT_TAG asio-1-30-2
)
FetchContent_GetProperties(asio)
if (NOT asio_POPULATED)
  FetchContent_Populate(asio)
endif()

# Crow's CMake uses find_package(asio) via Findasio.cmake. Provide it.
set(ASIO_INCLUDE_DIR "${asio_SOURCE_DIR}/asio/include" CACHE PATH "Asio include dir" FORCE)

FetchContent_Declare(
  crow
  GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
  # Crow 1.1+ removes Boost dependency
  GIT_TAG v1.1.0
)
FetchContent_MakeAvailable(crow)

# Source files
file(GLOB_RECURSE SOURCES
  "src/*.cpp"
  "src/*.h"
  "src/data-structures/*.cpp"
  "src/data-structures/*.h"
)

# Include directories
include_directories(${CMAKE_SOURCE_DIR}/src)
include_directories(${CMAKE_SOURCE_DIR}/include)

# Executable
add_executable(${PROJECT_NAME} ${SOURCES})

# Asio include + standalone mode
target_include_directories(${PROJECT_NAME} PRIVATE ${asio_SOURCE_DIR}/asio/include)
target_compile_definitions(${PROJECT_NAME} PRIVATE ASIO_STANDALONE)

# Link libraries
target_link_libraries(${PROJECT_NAME} PRIVATE Crow::Crow)

# Copy static files
file(COPY ${CMAKE_SOURCE_DIR}/static DESTINATION ${CMAKE_BINARY_DIR})

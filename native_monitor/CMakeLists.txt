
cmake_minimum_required(VERSION 3.10)

project(NativeHardwareMonitor VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

add_executable(NativeHardwareMonitor main.cpp)

# For std::thread::hardware_concurrency, we might need to link pthreads on some systems
# CMake usually handles this well with CMAKE_THREAD_PREFER_PTHREAD and find_package(Threads)
# For a simple case, it might link automatically. If not, uncomment the following:
# find_package(Threads REQUIRED)
# target_link_libraries(NativeHardwareMonitor PRIVATE Threads::Threads)

# For platform-specific APIs, you would add checks and includes here.
# Example for Windows:
# if(WIN32)
#   target_sources(NativeHardwareMonitor PRIVATE windows_specific.cpp)
#   # Link against necessary Windows libraries e.g. Pdh.lib
#   # target_link_libraries(NativeHardwareMonitor PRIVATE Pdh)
# endif()

# Example for Linux:
# if(UNIX AND NOT APPLE)
#   target_sources(NativeHardwareMonitor PRIVATE linux_specific.cpp)
# endif()

install(TARGETS NativeHardwareMonitor DESTINATION bin)

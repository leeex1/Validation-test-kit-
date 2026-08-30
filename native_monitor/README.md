
# Native Hardware Monitor (Basic Example)

This is a very minimal C++ project using CMake that demonstrates how to get the number of logical CPU cores.
It is **NOT** a full hardware monitoring application like ThrottleStop or Mz RAM Booster.
It serves as a basic structural template for a native application.

## Purpose

To show:
- A `CMakeLists.txt` for building a C++ executable.
- A `main.cpp` that uses `std::thread::hardware_concurrency()` from the C++ standard library.

## Prerequisites

- A C++ compiler (e.g., GCC, Clang, MSVC)
- CMake (version 3.10 or higher)

## How to Build

1.  **Clone/Create the project directory:**
    Make sure you have `CMakeLists.txt` and `main.cpp` in a directory (e.g., `native_monitor`).

2.  **Create a build directory:**
    It's good practice to build out-of-source.
    ```bash
    cd native_monitor
    mkdir build
    cd build
    ```

3.  **Run CMake to configure the project:**
    Replace `"Your Generator"` with your build system (e.g., "Unix Makefiles", "Ninja", "Visual Studio 17 2022").
    If on Linux/macOS with Makefiles:
    ```bash
    cmake ..
    ```
    If on Windows with Visual Studio:
    ```bash
    cmake .. -G "Visual Studio 17 2022" 
    ```
    (Adjust the generator based on your VS version or if you prefer Ninja, etc.)

4.  **Build the project:**
    If using Makefiles or Ninja:
    ```bash
    cmake --build .
    ```
    Or simply `make` (if Makefiles were generated).
    If using Visual Studio, open the generated `.sln` file in the `build` directory and build from there, or use:
    ```bash
    cmake --build . --config Release 
    ```

## How to Run

After a successful build, the executable `NativeHardwareMonitor` (or `NativeHardwareMonitor.exe` on Windows) will be located in the `build` directory (or a subdirectory like `build/Debug` or `build/Release` depending on your generator and configuration).

Navigate to where the executable is and run it from your terminal:
```bash
./NativeHardwareMonitor 
```
Or on Windows:
```bash
.\NativeHardwareMonitor.exe
```

## Output

The program will print the number of logical CPU cores detected on your system.

## Limitations & Next Steps

This example is extremely basic. To create a comprehensive hardware monitoring tool, you would need to:

-   **Implement OS-Specific API Calls:** For detailed CPU load, temperature, clock speeds, GPU information, RAM usage, disk activity, network stats, etc. The commented-out stub functions in `main.cpp` hint at where this would go.
-   **Develop a User Interface:** Either a command-line interface (CLI) that updates periodically or a graphical user interface (GUI) using libraries like Qt, Dear ImGui, wxWidgets, etc.
-   **Error Handling:** Robust error checking for all API calls.
-   **Cross-Platform Compatibility:** Extensive `#ifdef` blocks or abstraction layers to handle different operating systems if you want it to be portable.
-   **Privileges:** Some hardware information or control functions might require administrator/root privileges.

This template provides the first step of setting up the build system for a native C++ application.

# Q&A Manager

Q&A Manager is a Progressive Web Application (PWA) designed to manage Q&A entries for university purposes. Users can add Q&As, create categories for them, and use a backup server written in Rust to ensure data persistence. This application is built with HTML, CSS, and vanilla JavaScript, and utilizes the TinyColor library and Google Fonts icons.

## Features

- Add, edit, and delete Q&A entries.
- Create and manage categories for Q&A entries.
- Backup and restore Q&A data using a Rust server.

## Technologies Used

- HTML/CSS
- JavaScript (Vanilla)
- [TinyColor](https://github.com/bgrins/TinyColor)
- [Google Fonts Icons](https://fonts.google.com/icons)

## Live Demo

A live version of the PWA is available at: [Q&A Manager Live Demo](https://ttkostov.github.io/q-a-manager-app/Q&AManager/pages/index.html)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js and npm (for managing dependencies)
- Rust and Cargo (for the backup server)

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/ttkostov/q-a-manager-app.git
    cd q-a-manager-app
    ```

2. **Install dependencies:**

   No dependencies to install for the PWA itself as it uses vanilla JavaScript and static HTML/CSS. However, make sure you have a local server to serve the PWA (e.g., using `http-server` or any other static server).

   To install `http-server`, you can run:

    ```bash
    npm install -g http-server
    ```
3. **Navigate to the Q&AManager directory:**

    ```bash
    cd Q\&AManager
    ```

4. **Start the local server:**

    ```bash
    http-server
    ```

   The application will be available at `http://localhost:8080` (default port for `http-server`).

5. **Open the application in your browser:**

    ```plaintext
    http://192.168.1.110:8080/pages/index.html
    ```
### Running the Backup Server

1. **Navigate to the backup server directory:**

    ```bash
    cd Server
    ```

2. **Build and run the Rust backup server:**

    ```bash
    cargo build --release
    ./target/release/Server
    ```

   The backup server will be running and ready to handle backup and restore requests.

## Run Backup Server tests

To ensure the backup server is functioning correctly, you can run the tests provided in the `backup-server` directory.

1. **Navigate to the backup server directory:**

    ```bash
    cd Server
    ```

2. **Run the tests:**

    ```bash
    cargo test --bin Server
    ```

   This command will run all the tests and provide output indicating whether the tests passed or failed.

## Contributing

If you have suggestions for improving the app or would like to contribute, please fork the repository and create a pull request with your changes. All contributions are welcome!

## Acknowledgments

This project was developed as part of the portfolio exam for the subject "Programming 3" at the Technical University of Applied Sciences Würzburg-Schweinfurt.
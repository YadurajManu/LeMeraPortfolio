# FolioV2 - Personal Portfolio Website

## Description
This is Yaduraj Singh's personal portfolio website, designed to showcase projects, skills, and experience. The website is built with a strong focus on interactivity and animation to provide an engaging user experience.

## Technology Stack
*   **Vite**: Fast frontend build tool.
*   **SCSS**: CSS preprocessor for advanced styling.
*   **JavaScript (ES6+)**: Core programming language for interactivity.
*   **GSAP (GreenSock Animation Platform)**: For sophisticated animations.
*   **Locomotive Scroll**: For smooth scrolling effects.
*   **Particle Animation**: Custom HTML5 Canvas particle animation.

## Code Structure Overview
The project is organized within the `src` directory, which contains the following main subdirectories:

*   `src/fonts`: Holds custom font files used in the project.
*   `src/index.html`: The main HTML entry point for the application.
*   `src/js`: Contains all JavaScript files, further organized into:
    *   `classes`: Base classes, such as `Component.js`, for creating reusable UI elements.
    *   `components`: Specific UI components like `Time.js` (displays current time), custom cursor logic, etc.
    *   `pages`: Page-specific JavaScript logic. Currently, `Home.js` is minimal as most logic is component-based or in `index.js`.
    *   `utils`: Utility functions used across the project (e.g., DOM manipulation helpers, math functions).
    *   `index.js`: The main JavaScript entry point. It initializes animations, components, and global event listeners.
    *   `particles.js`: Dedicated script for managing the HTML5 Canvas particle animation in the background.
*   `src/public`: Stores static assets that are copied directly to the build output, such as the resume PDF and favicon.
*   `src/scss`: Contains all SCSS stylesheets, structured as follows:
    *   `base`: Global styles, CSS resets, and font face definitions.
    *   `components`: Styles specific to individual UI components (e.g., buttons, cards, custom cursor).
    *   `pages`: Styles specific to particular pages (though most styling is component or section-based).
    *   `sections`: Styles for distinct sections of the website (e.g., hero, about, projects, contact).
    *   `shared`: Shared styling elements like typography, links, and layout utilities.
    *   `utils`: SCSS variables (colors, fonts, breakpoints), mixins, and functions.
    *   `index.scss`: The main SCSS file that imports all other SCSS partials.

## Key Features
*   **Interactive Animations**: Extensive use of GSAP for various text reveal effects, scroll-triggered animations, hover effects, and UI element transitions.
*   **Smooth Scrolling**: Implemented using Locomotive Scroll to provide a fluid and modern scrolling experience.
*   **Custom Cursor**: A dynamic custom mouse cursor that changes based on context, enhancing user interaction.
*   **Particle Background**: An animated particle background created with HTML5 Canvas, adding a subtle visual flair.
*   **Responsive Design**: The website is designed to adapt to different screen sizes using SCSS media queries and JavaScript adjustments for optimal viewing on desktops, tablets, and mobile devices.
*   **Modular Structure**: Both JavaScript (with classes and components) and SCSS (with partials and a BEM-like methodology) are organized modularly for better maintainability and scalability.

## Setup and Development
To set up and run this project locally, follow these steps:

1.  **Install Dependencies**:
    Open your terminal, navigate to the project root directory, and run:
    ```bash
    npm install
    ```
2.  **Run Development Server**:
    To start the Vite development server (usually at `http://localhost:3000`):
    ```bash
    npm run dev
    ```
3.  **Build for Production**:
    To create a production-ready build in the `dist` folder:
    ```bash
    npm run build
    ```
4.  **Preview Production Build**:
    To locally preview the production build:
    ```bash
    npm run preview
    ```

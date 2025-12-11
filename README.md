# Fitness Tracker PWA Template

A personal fitness tracking PWA template built with **React** and **Google Sheets** (via Google Apps Script).

This project is designed for users and developers who want full control over their fitness data without the hassle of maintaining a traditional backend server or paying for subscriptions.

## ✨ Features

*   **📊 Dashboard**: Visualize trends for weight, calories, sleep quality, and mood.
*   **🍎 Nutrition Log**:
    *   Custom Food Database with Emoji support.
    *   Quick-add meals with automatic macro calculation (Protein/Carbs/Fat).
    *   **Combo Meals**: One-tap logging for your frequent meals.
*   **💪 Workout Log**:
    *   Track Strength Training (Sets, Reps, Weight, RPE).
    *   Aerobic session timer and logging.
    *   View history and progress for specific exercises.
*   **⚖️ Body Metrics**: Track weight, body measurements (waist/hip/grip), sleep schedule, and daily mood.
*   **📱 PWA Ready**: Installable on iOS/Android devices with offline UI support.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Vite
*   **Styling**: Tailwind CSS, PostCSS
*   **Icons**: Lucide React
*   **Charts**: Recharts
*   **State Management**: Zustand
*   **Backend**: Google Apps Script (GAS)
*   **Database**: Google Sheets

## 🚀 Quick Start

### 1. Backend Setup (Google Sheets & GAS)

Since this project uses Google Sheets as a database, you need to set up your own sheet and backend script.

1.  **Create a Google Sheet**:
    *   Create a new Google Sheet.
    *   Create the following tabs (Worksheets): `Dashboard`, `NutritionLog`, `WorkoutLog`, `BodyData`, `FoodDatabase`.

2.  **Setup Google Apps Script**:
    *   In your Google Sheet, click `Extensions` > `Apps Script`.
    *   Copy the content from `backend/Code.gs` in this repository into the script editor.
    *   **Important**: The provided `Code.gs` includes the API routing structure. You may need to implement or adjust the data manipulation functions (like `logWorkout`) to match your specific Sheet column layout.

3.  **Deploy as Web App**:
    *   Click `Deploy` > `New deployment`.
    *   **Select type**: `Web app`.
    *   **Description**: `v1`.
    *   **Execute as**: `Me` (your account).
    *   **Who has access**: `Anyone` (Required for the frontend to communicate with the script).
    *   Click `Deploy` and copy the **Web App URL**.

### 2. Frontend Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/fitness-tracker-template.git
    cd fitness-tracker-template
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    *   Create a `.env` file in the root directory (based on `.env.example`).
    *   Add your Web App URL:
    ```properties
    VITE_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
    ```

4.  **Run Locally**:
    ```bash
    npm run dev
    ```

## 📦 Deployment

The project is configured for **GitHub Pages** deployment.

### Automated Deployment (GitHub Actions)
1.  Push your code to GitHub.
2.  Go to `Settings` > `Secrets and variables` > `Actions`.
3.  Add a New Repository Secret named `VITE_API_URL` with your Google Apps Script URL.
4.  The GitHub Action (in `.github/workflows`) will automatically build and deploy your app to the `gh-pages` branch on every push to `main`.

## 🤝 Contributing

Contributions are welcome! If you have improved the GAS backend logic or added new frontend features, feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

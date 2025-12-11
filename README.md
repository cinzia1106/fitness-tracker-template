# Fitness Tracker PWA

A progressive web application for tracking fitness metrics, nutrition, and workout history, powered by React and Google Apps Script.

## Features
- **Nutrition Tracking**: Log daily meals, calculate macros (Protein, Carbs, Fats), and track water intake.
- **Workout Logging**: Record strength training sets, reps, and RPE. Include aerobic sessions.
- **Body Metrics**: Track weight, waist/hip measurements, sleep, and mood.
- **Analytics**: Visualize trends with charts.
- **PWA Support**: Installable on mobile devices.

## Setup & Local Development

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Start-to-Cowork/FitnessTracker.git
    cd FitnessTracker
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory (refer to `.env.example`):
    ```properties
    VITE_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
    ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```

## Deployment to GitHub Pages

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

### Prerequisite: GitHub Secrets
To validly build the application with access to your backend, you must configure the environment variable in GitHub Secrets.

1.  Go to your GitHub repository.
2.  Navigate to **Settings** > **Secrets and variables** > **Actions**.
3.  Click **New repository secret**.
4.  **Name**: `VITE_API_URL`
5.  **Value**: Your Google Apps Script Web App URL (e.g., `https://script.google.com/macros/s/.../exec`).
6.  Click **Add secret**.

### Enable GitHub Actions Deployment
1.  Navigate to **Settings** > **Pages**.
2.  Under **Build and deployment** > **Source**, select **GitHub Actions**.
3.  The workflow defined in `.github/workflows/deploy.yml` will automatically verify your code, build it with the secret, and deploy it to GitHub Pages on every push to the `main` branch.

### Manual Verification
You can check the **Actions** tab in your repository to see the deployment progress and logs.


# TempAlert - Precision Monitoring

Real-time temperature monitoring and alert system built with Next.js, ShadCN UI, and Tailwind CSS.

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:9002](http://localhost:9002) to view the app.

## Deployment to GitHub & Firebase App Hosting

To deploy this app and keep it in sync with GitHub:

1. **Create a GitHub Repository:** Go to [GitHub](https://github.com/new) and create a new repository.
2. **Initialize Git and Push:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <YOUR_GITHUB_REPO_URL>
   git push -u origin main
   ```
3. **Connect to Firebase:**
   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Select your project.
   - Navigate to **App Hosting** in the left sidebar.
   - Click **Get Started** and connect your GitHub account.
   - Select the repository you just created.
   - Follow the setup wizard to deploy your app. Firebase will automatically handle builds and deployments whenever you push to your `main` branch.

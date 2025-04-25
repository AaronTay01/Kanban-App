# Kanban App

A simple Kanban board built with Vue.js, Firebase, and TailwindCSS for managing tasks. The app supports drag-and-drop functionality, user authentication, and task management across different columns.

## Features

- User authentication with Firebase: Users can sign up and log in to manage their tasks.
- Drag-and-drop functionality for task management.
- Responsive design using TailwindCSS: The app is fully responsive and works well on mobile devices.
- Firebase Firestore for real-time data storage and retrieval.
- Real-time updates: Changes made by one user are instantly reflected for all users.

## Tech Stack

- **Frontend**: Vue 3, Vite, TailwindCSS
- **Backend**: Firebase (Authentication, Firestore)
- **Deployment**: Firebase Hosting

## Getting Started

### Prequisites

1. Node.js and npm installed on your machine.
2. Firebase account for authentication and database.

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:

```bash
npm install

```

3. Set up Firebase:

- Create a Firebase project on the Firebase Console.
- Set up Firebase Authentication and Firestore.
- Initialize Firebase in the project by adding your Firebase configuration into the .env file.

4. Run the development server:

```bash
npm run dev
```

## Firebase Configuration

Ensure you have the Firebase configuration set correctly in the settings file. You can find this in the Firebase Console under Project Settings.

# Deployment

1. Initalize Firebase:

```bash
firebase deploy
```

Select **Hosting** and **Firestore** if needed.

2. Build the project:

```bash
npm run build
```

3. Deploy to Firebase:

```bash
firebase deploy
```

# Access

You can access the deployed app at the URL provided by Firebase Hosting.

[Kanban App](https://kanban-dev-01.web.app/)

[Figma Mockup](https://www.figma.com/design/3vctSr5ebyTrIQ7EzL4Kut/Untitled?node-id=0-1&t=7c2PL7NcTf640dxc-1)

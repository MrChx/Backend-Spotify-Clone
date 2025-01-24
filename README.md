# 🎵 Spotify Clone Backend 🎶

![Express.js](https://upload.wikimedia.org/wikipedia/commons/6/64/Expressjs.png)z

A **Spotify Clone** backend built with **Express.js** and **MongoDB**. This project provides APIs for managing users, songs, albums, and messages, and includes authentication using **Clerk**, file storage with **Cloudinary**, and real-time features with **Socket.io**.

---

## 🚀 Features
- **User Authentication**: Secure authentication with Clerk
- **Album & Song Management**: Create, update, delete, and fetch albums and songs
- **Admin Privileges**: Secure routes for admin users
- **Real-time Messaging**: Powered by **Socket.io**
- **File Uploads**: Store album art and songs in **Cloudinary**
- **Statistics & Trends**: Fetch trending and recommended songs

---

## 🛠️ Tech Stack
- **Backend**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: Clerk
- **File Storage**: Cloudinary
- **Real-time Communication**: Socket.io

---

## 🔥 API Endpoints

### **Authentication**
- `POST /callback` → Handles authentication callback
- `GET /check` → Checks if the user is an admin

### **User**
- `GET /getUser` → Get user details (protected)
- `GET /message/:userId` → Get messages for a user (protected)

### **Album**
- `POST /album` → Create a new album (admin only)
- `GET /getAlbum` → Get all albums
- `GET /getAlbum/:albumId` → Get album by ID
- `PATCH /update-album/:albumId` → Update album details (admin only)
- `DELETE /delete-album/:id` → Delete an album (admin only)

### **Songs**
- `POST /song` → Upload a new song (admin only)
- `GET /getSong` → Get all songs (admin only)
- `GET /featured` → Get featured songs
- `GET /made-for-you` → Get personalized song recommendations
- `GET /trending` → Get trending songs
- `PATCH /update-song/:id` → Update song details (admin only)
- `DELETE /delete-song/:id` → Delete a song (admin only)

### **Stats**
- `GET /stats` → Get application statistics (admin only)

---

## 🔑 Environment Variables
Create a `.env` file and add the following:

```
PORT=
MONGODB_URI=
ADMIN_EMAIL=
NODE_ENV=
CLIENT_URL=

CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_CLOUD_NAME=

CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

---

## 🚀 Getting Started

### 1️⃣ Install Dependencies
```sh
npm install
```

### 2️⃣ Start the Server
```sh
npm start
```

### 3️⃣ Run in Development Mode
```sh
npm run dev
```
---
🌍 View Demo

https://spotify-arsika.up.railway.app/

---
## 📜 License
MIT License
---

🎶 **Enjoy building with Express & MongoDB!** 🚀


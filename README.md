# Secure Workflow Builder - Backend

This is the backend API for the Secure Workflow Builder application. It handles user authentication and secure, encrypted storage of workflow data.

## 🚀 Technologies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (Access & Refresh Tokens)
- **Security**: 
    - **AES-256-CBC**: For encrypting workflow nodes and edges before database storage.
    - **Bcrypt**: For secure password hashing.
    - **Helmet & CORS**: For production-grade security headers.

## 📁 Project Structure

```text
backend/
├── src/
│   ├── controllers/   # Business logic / Route handlers
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API route definitions
│   ├── services/      # Data access layer
│   ├── middlewares/   # Auth & error handling
│   ├── utils/         # Encryption & JWT helpers
│   └── errors/        # Custom error classes
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env` file in the root:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Running the server
```bash
# Development mode
npm run dev

# Build for production
npm run build
npm start
```

## 🔒 Security Features
- **Workflow Encryption**: All workflow data (nodes/edges) is encrypted using AES-256-CBC using a key derived from the JWT secret before it ever hits the database.
- **Protected Routes**: All `/api/workflows/*` routes require a valid Bearer token.

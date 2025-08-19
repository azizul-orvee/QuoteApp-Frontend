## Project Overview
A Node.js backend API for a quotes application where authenticated users can create, read, update, delete quotes and react to them with likes/dislikes.

## Core Features
1. **User Authentication & Authorization**
   - User registration and login
   - JWT token-based authentication
   - Password hashing with bcrypt

2. **Quotes Management**
   - Create new quotes (authenticated users only)
   - Read all quotes (public - homepage)
   - Update quotes (owner only)
   - Delete quotes (owner only)
   - Get quotes by user

3. **Reactions System**
   - Like/unlike quotes (authenticated users)
   - Dislike/undislike quotes (authenticated users)
   - Track reaction counts per quote


## API Endpoints Structure

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/profile/:userId` - Get public user profile

### Quotes Routes
- `GET /api/quotes` - Get all quotes (public) with pagination, search, and filtering
- `POST /api/quotes` - Create new quote (authenticated)
- `GET /api/quotes/:id` - Get specific quote
- `PUT /api/quotes/:id` - Update quote (owner only)
- `DELETE /api/quotes/:id` - Delete quote (owner only)
- `GET /api/quotes/user/:userId` - Get quotes by specific user with pagination
- `GET /api/quotes/search` - Search quotes by content or author

### Reactions Routes
- `POST /api/quotes/:id/like` - Like/unlike quote
- `POST /api/quotes/:id/dislike` - Dislike/undislike quote
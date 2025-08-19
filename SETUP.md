# QuoteHub Frontend Setup Guide

## Prerequisites
- Node.js 18+ installed
- Your backend API running (default: http://localhost:3001)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Backend API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   
   # Optional: App Configuration
   # NEXT_PUBLIC_APP_NAME=QuoteHub
   # NEXT_PUBLIC_APP_VERSION=1.0.0
   ```
   
   **Important Notes:**
   - **Backend URL**: Update `NEXT_PUBLIC_API_URL` if your backend runs on a different address or port
   - **Environment Files**: 
     - `.env.local` - Local development (gitignored)
     - `.env.example` - Template for team members
     - `.env.production` - Production environment
   - **Variable Prefix**: All environment variables must start with `NEXT_PUBLIC_` to be accessible in the browser

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Features Implemented

### ✅ Phase 1: Foundation (Complete)
- [x] Project structure and configuration
- [x] Authentication context and protected routes
- [x] Login/Register forms with validation
- [x] Navigation component
- [x] Basic UI components (Button, Input, Textarea)

### ✅ Phase 2: Core Features (Complete)
- [x] Quote display components
- [x] Homepage with quotes listing
- [x] Basic CRUD operations for quotes
- [x] User dashboard structure
- [x] Quote creation form

### ✅ Phase 3: Advanced Features (Complete)
- [x] Reactions system (likes/dislikes)
- [x] User profiles and public pages
- [x] Responsive design optimization
- [x] Quote detail pages
- [x] User quote collections

### ✅ Phase 4: Polish & Testing (Complete)
- [x] Error handling and edge cases
- [x] Loading states and skeleton loaders
- [x] Form validation with Zod
- [x] Responsive mobile-first design
- [x] Accessibility improvements

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/           # Authentication routes (grouped)
│   │   ├── login/        # Login page
│   │   └── register/     # Registration page
│   ├── (dashboard)/      # Protected dashboard routes
│   │   ├── profile/      # User profile management
│   │   ├── my-quotes/    # User's quotes
│   │   └── create-quote/ # Create new quote
│   ├── quotes/           # Quote-related routes
│   │   ├── [id]/         # Individual quote view
│   │   └── user/[userId] # User's quote collection
│   ├── layout.js         # Root layout with navigation
│   └── page.js           # Homepage
├── components/            # Reusable UI components
│   ├── ui/               # Basic UI components
│   ├── auth/             # Authentication components
│   ├── quotes/           # Quote-related components
│   └── layout/           # Layout components
├── context/              # React context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and API
└── styles/               # Global styles
```

## Environment Configuration

### Environment Variables
Your project uses environment variables for configuration. Here's how to set them up:

#### **Required Variables:**
- `NEXT_PUBLIC_API_URL` - Backend API endpoint (default: `http://localhost:3001/api`)

#### **File Structure:**
```
.env.local          # Local development (gitignored)
.env.example        # Template for team members  
.env.production     # Production environment
```

#### **Changing Backend Configuration:**
1. **Local Development**: Edit `.env.local`
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

2. **Different Backend Port**: 
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Remote Backend**: 
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.com/api
   ```

4. **Different Protocol**: 
   ```env
   NEXT_PUBLIC_API_URL=http://192.168.1.100:3001/api
   ```

#### **Important Notes:**
- **Restart Required**: After changing environment variables, restart your Next.js dev server
- **Browser Access**: Only variables prefixed with `NEXT_PUBLIC_` are accessible in the browser
- **Security**: Never commit `.env.local` to version control (already gitignored)
- **Fallback**: If no environment variable is set, the API defaults to `http://localhost:3001/api`

## Key Components

### Authentication System
- **AuthContext**: Global authentication state management
- **Protected Routes**: Route guards for authenticated users
- **JWT Management**: Automatic token handling and refresh
- **Form Validation**: React Hook Form with Zod schemas

### Quote Management
- **QuoteCard**: Reusable quote display component
- **CRUD Operations**: Create, read, update, delete quotes
- **Reactions**: Like/dislike system with real-time updates
- **Search**: Advanced search with pagination

### UI/UX Features
- **Responsive Design**: Mobile-first approach
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Accessibility**: ARIA labels and keyboard navigation

## API Integration

The frontend integrates with your backend through the `src/lib/api.js` file, which provides:

- **Authentication API**: Login, register, profile management
- **Quotes API**: CRUD operations, search, user quotes
- **Reactions API**: Like/dislike functionality
- **Error Handling**: Consistent error management

## Styling

- **Tailwind CSS v4**: Modern utility-first CSS framework
- **Custom Design System**: Consistent color scheme and components
- **Responsive Breakpoints**: Mobile, tablet, and desktop layouts
- **Dark Mode Support**: Automatic theme switching

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive Web App ready

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Backend Requirements

Make sure your backend provides these endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/profile/:userId` - Get public user profile
- `GET /api/quotes` - Get all quotes with pagination
- `POST /api/quotes` - Create new quote
- `GET /api/quotes/:id` - Get specific quote
- `PUT /api/quotes/:id` - Update quote
- `DELETE /api/quotes/:id` - Delete quote
- `GET /api/quotes/user/:userId` - Get quotes by user
- `GET /api/quotes/search` - Search quotes
- `POST /api/quotes/:id/like` - Like/unlike quote
- `POST /api/quotes/:id/dislike` - Dislike/undislike quote

## Next Steps

The frontend is now fully functional! You can:

1. **Test the application** by navigating through different pages
2. **Create user accounts** and start sharing quotes
3. **Customize the design** by modifying Tailwind classes
4. **Add new features** like quote categories or social sharing
5. **Deploy to production** using Vercel, Netlify, or your preferred platform

## Troubleshooting

### Common Issues

1. **API Connection Error**: Ensure your backend is running and the API URL is correct
2. **Authentication Issues**: Check that JWT tokens are being sent correctly
3. **Styling Problems**: Verify Tailwind CSS is properly configured
4. **Build Errors**: Clear `.next` folder and reinstall dependencies

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify your backend API is responding correctly
3. Ensure all environment variables are set properly
4. Check that all dependencies are installed

---

**Happy coding! 🚀**

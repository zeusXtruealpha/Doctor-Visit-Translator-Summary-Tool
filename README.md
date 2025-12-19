# Doctor Visit Translator & Summary Tool

A web-based AI application that helps patients understand medical prescriptions and doctor notes by translating complex medical terminology into simple, patient-friendly language. Designed with elderly users in mind, featuring large text, simple interface, and support for multiple languages.

## 🌟 Features

- **Simple Medical Translation**: Converts complex medical jargon into easy-to-understand language
- **Image Upload Support**: Upload prescription photos and medical documents for instant translation
- **Text Input Mode**: Type or paste medical text directly
- **Multi-Language Support**: Available in English, Tamil, and Hindi
- **Structured Output**: Organizes information into 5 clear sections:
  - Your Condition
  - Your Medicines (with complete dosage and timing information)
  - Daily Routine (with specific times and duration)
  - Do's
  - Don'ts
- **Translation History**: Save and access your past translations
- **Professional UI Design**: Modern, gradient-based interface with intuitive navigation
- **Elderly-Friendly Design**: Large text, high contrast, and simple navigation
- **Dual Input Modes**: Switch seamlessly between text input and image upload
- **Print & Save**: Export translations for offline reference

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key
- Supabase account (for authentication and database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zeusXtruealpha/Doctor-Visit-Translator-Summary-Tool.git
   cd Doctor-Visit-Translator-Summary-Tool
   ```

2. **Set up Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   
   # Edit .env and add your credentials:
   # - GEMINI_API_KEY=your_gemini_api_key
   # - SUPABASE_URL=your_supabase_url
   # - SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Set up Frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Create .env file
   cp .env.example .env
   
   # Edit .env and add your credentials:
   # - VITE_SUPABASE_URL=your_supabase_url
   # - VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Database**
   - Go to your Supabase project
   - Run the SQL script from `database/schema.sql` in the SQL Editor
   - This creates the translations table and sets up Row Level Security

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on http://localhost:5000

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:3000

3. **Open your browser**
   Navigate to http://localhost:3000

## 📁 Project Structure

```
Doctor-Visit-Translator-Summary-Tool/
├── backend/                    # Node.js/Express backend
│   ├── config/                # Configuration files
│   ├── middleware/            # Authentication middleware
│   ├── routes/                # API routes
│   ├── services/              # Business logic (Gemini, Database, Auth)
│   ├── tests/                 # Test files
│   └── server.js              # Main server file
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── auth/         # Login, Register pages
│   │   │   ├── translate/    # Translation interface
│   │   │   ├── history/      # History pages
│   │   │   ├── layout/       # Navigation, Layout
│   │   │   └── common/       # Shared components
│   │   ├── contexts/         # React contexts (Auth)
│   │   ├── config/           # Supabase config
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   └── index.html
└── database/                   # Database schema
    └── schema.sql
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get current user (requires auth)

### Translation
- `POST /api/translate` - Translate medical text (requires auth)
- `POST /api/translate/image` - Translate medical image/prescription (requires auth)
- `POST /api/translate/test` - Test translation without auth

### History
- `GET /api/history` - Get user's translation history (requires auth)
- `GET /api/history/:id` - Get specific translation (requires auth)

### Health Check
- `GET /api/health` - Check API status
- `GET /api/db-test` - Test database connection
- `GET /api/gemini-test` - Test Gemini API connection

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

Tests include:
- Authentication middleware tests
- Authentication route tests
- History route tests
- Property-based tests for Gemini integration

### Test Coverage
- 36+ passing tests
- Unit tests for all major components
- Integration tests for API endpoints

## 🎨 Design Features

### Elderly-Friendly Design
- **Large Text**: 18px base font size for better readability
- **High Contrast**: Clear color differentiation
- **Simple Navigation**: Minimal, intuitive interface
- **Touch-Friendly**: Large buttons and input fields
- **Print Support**: Optimized for printing translations

### Responsive Design
- Mobile-first approach
- Works on phones, tablets, and desktops
- Adaptive layout for different screen sizes

## 🔒 Security Features

- JWT-based authentication via Supabase
- Row Level Security (RLS) in database
- CORS protection
- Rate limiting
- Helmet.js security headers
- Input validation and sanitization

## 🌐 Supported Languages

- **English**: Simple, everyday English
- **Tamil (தமிழ்)**: Native Tamil translations
- **Hindi (हिंदी)**: Native Hindi translations

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 🚀 Deployment

### Backend Deployment
1. Set environment variables on your hosting platform
2. Run `npm install --production`
3. Run `npm start`

### Frontend Deployment
1. Update `VITE_API_URL` to your production backend URL
2. Run `npm run build`
3. Deploy the `dist` folder to your hosting platform

### Recommended Platforms
- **Backend**: Heroku, Railway, Render, or AWS
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Database**: Supabase (already configured)

## 🤝 Contributing

This project was built for a hackathon. Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 👥 Authors

- Your Name - [GitHub Profile](https://github.com/zeusXtruealpha)

## 🙏 Acknowledgments

- Google Gemini API for AI-powered translations
- Supabase for authentication and database
- Tailwind CSS for styling
- React and Vite for frontend framework

## 📞 Support

If you have any questions or issues, please open an issue on GitHub.

---

**Note**: This application is for informational purposes only. Always consult with your doctor if you have questions about your treatment. If you experience any concerning symptoms, seek medical attention immediately.
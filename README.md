# iWARDROBE v3.0 🪞✨

**Smart Mirror Platform** - Your AI-Powered Virtual Wardrobe Assistant

iWARDROBE is an intelligent smart mirror platform that combines computer vision, AI recommendations, and voice interaction to revolutionize your daily outfit selection experience.

## 🌟 Features

### ARIA - AI Voice Assistant
- **Continuous Voice Interaction**: Hands-free control with automatic voice detection
- **Smart Recommendations**: Personalized outfit suggestions based on weather, events, and preferences
- **Natural Conversations**: Powered by advanced AI for natural dialogue

### Virtual Try-On
- **Real-time Pose Detection**: MediaPipe-powered body tracking
- **Gesture Controls**: Intuitive hand gestures to activate and control features
- **AR Clothing Overlay**: See how outfits look on you in real-time

### Smart Widgets
- **Weather Integration**: Real-time weather data with automatic location detection
- **Wardrobe Analytics**: Track your clothing usage and preferences
- **Event Calendar**: Outfit suggestions based on your schedule

### Biometric Analysis
- **Body Measurements**: Automated measurement tracking
- **Fit Recommendations**: Personalized sizing suggestions
- **Progress Tracking**: Monitor changes over time

## 🏗️ Architecture

This is a monorepo project with the following structure:

```
iwardrobe/
├── apps/
│   ├── api/          # FastAPI backend
│   └── web/          # Next.js frontend
└── packages/         # Shared packages
```

### Backend (FastAPI)
- **Authentication**: Secure user authentication with JWT tokens
- **Biometrics API**: Body measurement tracking and analysis
- **Recommendation Engine**: AI-powered outfit suggestions
- **Database**: PostgreSQL with SQLAlchemy ORM

### Frontend (Next.js)
- **React 18+**: Modern React with TypeScript
- **Tailwind CSS**: Utility-first styling
- **MediaPipe**: Real-time pose and hand gesture detection
- **Voice Integration**: Web Speech API for ARIA

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL database

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/jenovoas/iwardrobe.git
cd iwardrobe
```

2. **Setup Backend**
```bash
cd apps/api
pip install -r requirements.txt
# Configure your database connection in .env
python -m uvicorn app.main:app --reload
```

3. **Setup Frontend**
```bash
cd apps/web
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🔧 Configuration

Create a `.env` file in the `apps/api` directory:

```env
DATABASE_URL=postgresql://user:password@localhost/iwardrobe
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 📱 Usage

1. **Login/Register**: Create your account or sign in
2. **Setup Profile**: Add your measurements and preferences
3. **Voice Activation**: Say "Hey ARIA" to activate the voice assistant
4. **Gesture Controls**: Use hand gestures to navigate and try on clothes
5. **Get Recommendations**: Ask ARIA for outfit suggestions

## 🧪 Testing

### Backend Tests
```bash
cd apps/api
pytest test_auth.py
pytest test_biometrics.py
pytest test_recommendation.py
```

### Frontend Tests
```bash
cd apps/web
npm test
```

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15
- TypeScript
- Tailwind CSS
- MediaPipe
- Web Speech API

**Backend:**
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- Python 3.9+

**AI/ML:**
- MediaPipe (Pose & Hand Detection)
- Custom Recommendation Engine
- Voice Recognition

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**jnovoas** - [GitHub](https://github.com/jenovoas)

## 🤝 Contributing

This is a private project. For any questions or suggestions, please contact the author.

---

Made with ❤️ by jenovoas

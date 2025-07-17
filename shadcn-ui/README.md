# Tech Innovation Club - EduLearn Platform

A modern web application for the Tech Innovation Club, built with Next.js, TypeScript, and shadcn/ui components.

## Features

### 🔐 Authentication System
- **User Registration & Login**: Secure authentication with email/password
- **OAuth Integration**: Google and Brightspace OAuth support
- **User Dashboard**: Personalized dashboard for authenticated users
- **Session Management**: Persistent user sessions with localStorage

### 🎓 Homework Help with AI
- **Multi-Model AI Support**: Integration with OpenRouter API
- **Free AI Models**: DeepSeek, Mistral 7B, Gemma 7B, Phi-2
- **Interactive Chat**: Real-time AI assistance for homework
- **Quick Prompts**: Pre-built templates for common homework tasks
- **Conversation History**: Maintains context throughout the session

### 📚 Study Resources
- **Resource Library**: Access to learning materials and study guides
- **Event Management**: View and register for club events
- **Contact Support**: Direct communication with club leaders

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Authentication**: Custom auth context with localStorage
- **AI Integration**: OpenRouter API
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── homework-help/ # AI homework help endpoint
│   ├── auth/              # Authentication pages
│   │   ├── signin/        # Login page
│   │   └── register/      # Registration page
│   ├── dashboard/         # User dashboard
│   ├── homework-help/     # AI homework help page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── Navigation.tsx    # Main navigation
├── context/              # React contexts
│   ├── AuthContext.tsx   # Authentication state
│   └── ...               # Other contexts
└── lib/                  # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shadcn-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```

   Edit `.env.local` and add your configuration:
   ```env
   # Required for AI features
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   
   # App configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Optional: JWT secret for enhanced security
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENROUTER_API_KEY` | API key for OpenRouter AI services | Yes (for homework help) |
| `NEXT_PUBLIC_APP_URL` | Your application URL | Yes |
| `JWT_SECRET` | Secret for JWT tokens | No (optional) |

### Setting Up API Keys

The homework help feature requires an API key to function. You have two options:

#### Option 1: Environment Variables (Recommended for Development)
1. Create a `.env.local` file in the project root
2. Add your OpenRouter API key:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
   ```
3. Restart the development server

#### Option 2: In-App Settings (Recommended for Personal Use)
1. Navigate to the homework help page
2. Click the settings icon in the sidebar
3. Enter your API key in the settings panel
4. The key will be stored locally in your browser

#### Getting an API Key
- Visit [OpenRouter](https://openrouter.ai/keys) to get a free API key
- No credit card required for basic usage
- Free models available for testing

## Usage

### Authentication
1. Navigate to `/auth/register` to create an account
2. Or visit `/auth/signin` to log in
3. After authentication, you'll be redirected to the dashboard

### Homework Help
1. Log in to access the homework help feature
2. Navigate to `/homework-help`
3. Select an AI model from the sidebar
4. Start chatting with the AI for homework assistance
5. Use quick prompts for common homework tasks

### Dashboard
- View your profile and signed-up events
- Access quick actions for different features
- Navigate to resources, events, and contact pages

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Adding New Components

1. **shadcn/ui components**: Use the shadcn CLI
   ```bash
   npx shadcn@latest add [component-name]
   ```

2. **Custom components**: Create in `src/components/`

### Styling

- Use Tailwind CSS classes for styling
- Global styles in `src/app/globals.css`
- Component-specific styles using Tailwind utilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions about the Tech Innovation Club platform, please contact the development team.

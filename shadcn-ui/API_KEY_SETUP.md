# API Key Setup for Homework Help

This guide explains how to set up API keys for the homework help feature.

## Quick Setup

### Option 1: Environment Variables (Recommended)

1. Create a `.env.local` file in the project root:
   ```bash
   touch .env.local
   ```

2. Add your OpenRouter API key:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
   ```

3. Restart the development server:
   ```bash
   npm run dev
   ```

### Option 2: In-App Settings

1. Navigate to `/homework-help`
2. Click the settings icon (⚙️) in the sidebar
3. Enter your API key in the "API Key" field
4. Click "Save Changes"

## Getting an API Key

1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Sign up for a free account
3. Generate a new API key
4. Copy the key (starts with `sk-or-v1-`)

## Verification

- ✅ **Environment Variable**: The app will automatically detect API keys from `.env.local`
- ✅ **In-App Settings**: API keys entered in the settings panel are stored locally
- ✅ **Fallback**: The system checks both sources and uses whichever is available

## Troubleshooting

### No API Key Detected
- Check that your `.env.local` file exists and has the correct variable name
- Ensure the API key starts with `sk-or-v1-`
- Restart the development server after adding environment variables

### API Key Not Working
- Verify the API key is valid at [OpenRouter](https://openrouter.ai/keys)
- Check the browser console for error messages
- Try using a different model (some models may have usage limits)

## Free Models Available

The following models are free to use:
- `meta-llama/llama-3.2-3b-instruct:free`
- `microsoft/phi-2:free`
- `google/gemma-7b-it:free`
- `mistralai/mistral-7b-instruct:free`

## Security Notes

- Never commit API keys to version control
- Use environment variables for production deployments
- API keys stored in the app are only saved locally in your browser 
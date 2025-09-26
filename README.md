# EverVibe VAPI Platform

A Node.js platform for integrating with VAPI AI voice calling services.

## Features

- Express.js server with VAPI integration
- Webhook handling for call events
- Simple scripts to trigger AI calls
- Environment-based configuration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy the environment file and configure your VAPI credentials:
```bash
cp .env.example .env
```

3. Edit `.env` with your actual VAPI credentials and phone number. All scripts and the server load configuration from this file via `dotenv`:
```env
VAPI_API_KEY=your-api-key-here
VAPI_ASSISTANT_ID=your-assistant-id-here
VAPI_PHONE_NUMBER_ID=your-phone-number-id-here
CUSTOMER_NUMBER=+11234567890
# Optional for script calling the local server
BASE_URL=http://localhost:3000
```

## Usage

### Option 1: Direct API Call Script

Run the standalone script that makes a direct call to VAPI:

```bash
npm run trigger-call
# or
node trigger-call.js
```

### Option 2: Via Local Server

1. Start the server:
```bash
npm start
```

2. In another terminal, run the server-based script:
```bash
npm run trigger-call-server
# or
node trigger-call-via-server.js
```

### Option 3: Manual API Call

You can also make a direct POST request to your server:

```bash
curl -X POST http://localhost:3000/call \
  -H "Content-Type: application/json" \
  -d '{
    "customerNumber": "+11234567890",
    "metadata": {
      "reason": "test-call"
    }
  }'
```

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /call` - Trigger a VAPI call
- `POST /vapi/webhook` - Handle VAPI webhook events

## Configuration

The platform uses the following environment variables:

- `VAPI_API_KEY` - Your VAPI API key (required)
- `VAPI_ASSISTANT_ID` - Default assistant ID (optional, can be overridden per call)
- `VAPI_PHONE_NUMBER_ID` - Default phone number ID (optional, can be overridden per call)
- `CUSTOMER_NUMBER` - The E.164 phone number to call (required by scripts)
- `VAPI_WEBHOOK_SECRET` - Webhook signature verification secret (optional)
- `PORT` - Server port (default: 3000)
- `BASE_URL` - Optional base URL for the script that calls your local server (default: http://localhost:3000)

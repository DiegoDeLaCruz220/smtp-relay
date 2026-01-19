# SMTP Relay Service

HTTP-to-SMTP relay for sending emails via MangoMail.

## Deploy to Railway

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect this repository and select the `smtp-relay` folder
4. Add these environment variables:

```
API_KEY=your-secure-random-api-key-here
SMTP_HOST=smtp.mangomail.com
SMTP_PORT=587
SMTP_USER=noreply@adlhomeimprovement.com
SMTP_PASS=@EldestCastle220
FROM_EMAIL=noreply@adlindustries.net
```

5. Deploy!

## Usage

Send a POST request to `https://your-railway-url.railway.app/send`:

```json
{
  "to": "recipient@example.com",
  "subject": "Test Email",
  "html": "<p>Hello World</p>",
  "attachments": [
    {
      "filename": "document.pdf",
      "content": "base64-encoded-content-here"
    }
  ]
}
```

Headers:
```
X-API-Key: your-api-key
Content-Type: application/json
```

## Endpoints

- `GET /health` - Health check
- `POST /send` - Send email

## Local Development

```bash
npm install
npm start
```

Set environment variables in `.env` file.

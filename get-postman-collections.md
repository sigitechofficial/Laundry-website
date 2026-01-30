# Get Postman Collections

This guide helps you fetch all collections from your Postman account.

## Step 1: Get Your Postman API Key

1. Go to [Postman API Keys](https://web.postman.co/settings/me/api-keys)
2. Click "Generate API Key"
3. Copy your API key (keep it secure!)

## Step 2: Run the Script

### Option A: Using Node.js

```bash
# Set your API key as environment variable
export POSTMAN_API_KEY="your-api-key-here"

# Run the script
node get-postman-collections.js
```

### Option B: Using Python

```bash
# Set your API key as environment variable
export POSTMAN_API_KEY="your-api-key-here"

# Run the script
python get-postman-collections.py
```

### Option C: Using curl (Quick Test)

```bash
curl -X GET \
  'https://api.getpostman.com/collections' \
  -H 'X-Api-Key: YOUR_POSTMAN_API_KEY_HERE' \
  -H 'Accept: application/json'
```

## Step 3: View Results

The script will display:

- Collection Name
- Collection ID (UID)
- Last Updated Date

## Alternative: Export from Postman UI

1. Open Postman
2. Click on "Collections" in the sidebar
3. Each collection shows its name
4. Right-click a collection → "View Collection" → Check the URL for the collection ID

## Security Note

⚠️ **Never commit your API key to version control!**

- Use environment variables
- Add `.env` to `.gitignore` if storing keys locally

# How to Fix Firebase Private Key Error

## The Problem

Firebase private key must be formatted as a **single line** with `\n` (backslash-n) representing newlines, wrapped in double quotes.

## ❌ WRONG Format (will cause the error you're seeing)

```bash
# Don't do this - actual newlines:
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASC...
-----END PRIVATE KEY-----"

# Don't do this - missing quotes:
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...

# Don't do this - extra spaces or characters:
FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n...
```

## ✅ CORRECT Format

```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

**Key points:**
1. Wrapped in `"double quotes"`
2. All on **ONE LINE**
3. Use `\n` (backslash followed by n) for newlines
4. No spaces around the `=` sign
5. The `\n` should be literal text, not actual line breaks

## Step-by-Step Fix

### Method 1: Manual Copy from JSON

1. Open your downloaded Firebase service account JSON file:
   ```json
   {
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n"
   }
   ```

2. Copy the **entire value** of `private_key` (including the quotes)

3. In your `.env` file, paste it like this:
   ```bash
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n"
   ```

### Method 2: Use a Script (Recommended)

I'll create a helper script for you...



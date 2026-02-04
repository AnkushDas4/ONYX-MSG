# 🛡️ OnyxMsg Backend (The Blind Router)

This is the serverless backend for **OnyxMsg**. It acts as a secure "Blind Router" gateway between the Client App and Firebase Cloud Messaging (FCM).

**Goal:** Hide the Firebase Service Account keys from the client device while ensuring high-priority delivery of encrypted payloads.

## 🚀 Architecture

1.  **Client (React Native)**: Encrypts the message locally.
2.  **Vercel Function**: Receives the encrypted payload (does NOT decrypt it).
3.  **Firebase (FCM)**: Delivers a `data-only` message to the recipient.
4.  **Recipient**: Wakes up in the background -> Decrypts -> Saves to file system.

---

## 🛠️ API Reference

### POST `/api/send`

Sends an encrypted data payload to a specific device.

**Headers:**
`Content-Type: application/json`

**Body:**
```json
{
  "fcmToken": "DEVICE_FCM_TOKEN",
  "encrypted_content": "ENCRYPTED_STRING_HERE",
  "sender_id": "USER_ID",
  "timestamp": "ISO_TIMESTAMP"
}

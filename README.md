# 💎 OnyxMsg

**Secure, Encrypted, Private.**
This repository hosts both the public **Homepage** and the **Serverless Backend** (Blind Router) for the OnyxMsg application.

---

## 📂 Project Structure

This is a Vercel Monorepo structure:

| Location | Type | Description |
| :--- | :--- | :--- |
| `/index.html` | **Frontend** | The public landing page for OnyxMsg. Serves as the marketing/download site. |
| `/api/send.js` | **Backend** | The secure "Blind Router" API. Handles FCM signal dispatching. |
| `/test.html` | **Utility** | A hidden tool to test the Backend <-> Firebase connection. |

---

## 🛡️ The Backend: "Blind Router"

The API located at `/api/send` acts as a security gateway.
* **Goal:** Hide Firebase Admin keys from the client app.
* **Privacy:** The server **cannot** decrypt messages. It only sees encrypted strings and forwards them.
* **Priority:** Forces "High Priority" delivery to wake up devices (iOS/Android) for background processing.

### API Usage
**POST** `https://onyx-msg.vercel.app/api/send`

**Body:**
```json
{
  "fcmToken": "DEVICE_FCM_TOKEN",
  "encrypted_content": "Aes256_Encrypted_String...",
  "sender_id": "User_XYZ",
  "timestamp": "ISO_Date_String"
}

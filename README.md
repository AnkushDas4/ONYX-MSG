# 💎 ONYX-MSG

> **"The Blind Router" Architecture.**
> A Zero-Knowledge transport layer for secure, encrypted communication.

This repository serves as the **Monorepo** for the OnyxMsg infrastructure. It hosts both the public-facing **Homepage** and the serverless **Backend API**.

---

## 🧠 The Motive: "Blind Routing"

The core philosophy of OnyxMsg is that **the server should know nothing.**

Most messaging apps store your chats in a database. OnyxMsg does not. We utilize a **"Blind Router"** architecture using Vercel Serverless Functions and Firebase Cloud Messaging (FCM).

### The "3-Way" Architecture
1.  **Local (Storage):** Messages are decrypted and stored **only** on the user's device file system (React Native FS).
2.  **Transport (This Repo):** The server acts as a dumb pipe. It receives an encrypted blob and pushes it to the recipient. It **cannot** decrypt the message and **does not** log it.
3.  **Backup (User Owned):** Archives are synced to the user's personal cloud (Google Drive/iCloud), not ours.

---

## 📂 Project Structure

This project is deployed as a single Vercel instance that handles two roles:

| Path | Role | Description |
| :--- | :--- | :--- |
| **`/index.html`** | **Frontend** | The public landing page. Minimalist, static HTML for app download/info. |
| **`/api/send.js`** | **Backend** | The Secure Gateway. Validates tokens and hands off payload to FCM. |
| **`/test.html`** | **Utility** | A hidden tool to verify the Vercel ↔ Firebase connection. |

---

## 📡 The Backend API

**Endpoint:** `POST /api/send`

This function is the bridge between the Sender and the Recipient. It utilizes the Firebase Admin SDK to force a "High Priority" wake-up on the recipient's device.

### Features
* **Data-Only Payloads:** We deliberately avoid the `notification` key. This prevents system tray spam and allows the client app to wake up silently in the background to process/decrypt data.
* **Cross-Platform Wake:** Configured with `priority: 'high'` (Android) and `content-available: 1` (iOS).
* **Security:** Hides the Firebase Service Account keys from the client application.

### Usage Specification

**Request:**
```json
POST /api/send
Content-Type: application/json

{
  "fcmToken": "RECIPIENT_DEVICE_TOKEN",
  "encrypted_content": "U2FsdGVkX1+...",
  "sender_id": "8821-3321",
  "timestamp": "2023-10-27T10:00:00Z"
}

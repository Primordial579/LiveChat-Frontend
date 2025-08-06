# 💬 LiveChat Frontend

This is the **frontend** for the real-time 2-person chat system, built with modern responsive UI and deployed on [Vercel](https://vercel.com). It includes two separate interfaces: one for **Host 1** to initiate the chat and another for **Host 2** to join and respond.

## 🌐 Live

- **Frontend URL**: [https://livechat-orpin.vercel.app](https://livechat-orpin.vercel.app).
- **Backend Github URL**: [https://github.com/Primordial579/LiveChat-Backend.git](https://github.com/Primordial579/LiveChat-Backend.git). 
---

## ✨ Features

- Clean, modern UI with **Tailwind CSS**
- Separate pages for **Host 1** and **Host 2**
- Real-time messaging using **Socket.IO**
- Displays **online/offline** status for Host 2
- Responsive on both mobile and desktop
- Sends email notification to Host 2 when Host 1 initiates a chat
- No file uploads (removed for security)
- Emoji support (optional)

---

## 🚀 How to Deploy

> **Frontend is designed to be deployed via [Vercel](https://vercel.com)**.

### Steps:
1. Clone this repo
2. Push it to GitHub.
3. Connect the GitHub repo to Vercel.
4. Set `index.html` as your landing page.
5. Your frontend will be live instantly with a custom Vercel URL.

---

Requirements:

 - Backend must be hosted (e.g., Render)
 - Frontend must point to the correct backend URL in fetch/socket connections
 - Email SMTP (Gmail with App Password) must be configured on backend

---

🙋‍♂️ Author
Built by Arjav Prabhu






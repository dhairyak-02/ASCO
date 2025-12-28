require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

/* ===== Middleware ===== */
app.use(cors());
app.use(express.json());

/* ===== Health Check ===== */
app.get("/", (req, res) => {
  res.send("ASCO Backend is running");
});

/* ===== Lead API ===== */
app.post("/api/lead", async (req, res) => {
  const { name, email, phone, service, message, source } = req.body;

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        "accept": "application/json"
      },
      body: JSON.stringify({
        sender: {
          email: process.env.FROM_EMAIL,
          name: "ASCO Website"
        },
        to: [
          {
            email: process.env.ADMIN_EMAIL,
            name: "Admin"
          }
        ],
        subject: `New Lead from ${source}`,
        htmlContent: `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Message:</strong><br>${message}</p>
          <p><strong>Source:</strong> ${source}</p>
        `
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Brevo API error:", error);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true });

  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ success: false });
  }
});

/* ===== Start Server ===== */
app.listen(process.env.PORT || 5000, () => {
  console.log("Backend server running");
});

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
          { email: process.env.ADMIN_EMAIL }
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

    const text = await response.text();
    console.log("BREVO STATUS:", response.status);
    console.log("BREVO RESPONSE:", text);

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        brevoStatus: response.status,
        brevoResponse: text
      });
    }

    res.json({ success: true });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ===== Start Server ===== */
app.listen(process.env.PORT || 5000, () => {
  console.log("Backend server running");
});

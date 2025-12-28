require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

/* ===== Middleware ===== */
app.use(cors());
app.use(express.json());

/* ===== Health Check (optional but recommended) ===== */
app.get("/", (req, res) => {
  res.send("ASCO Backend is running");
});

/* ===== Email Configuration ===== */
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});



/* ===== Lead API ===== */
app.post("/api/lead", async (req, res) => {
  const { name, email, phone, service, message, source } = req.body;

  try {
    await transporter.sendMail({
      from: `"Website Lead" <${process.env.FROM_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Lead from ${source}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Message:</strong><br>${message}</p>
        <p><strong>Source:</strong> ${source}</p>
      `
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ success: false });
  }
});

/* ===== Server Start ===== */
app.listen(process.env.PORT || 5000, () => {
  console.log("Backend server running");
});

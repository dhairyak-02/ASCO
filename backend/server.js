require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

/* Email config (Brevo / Gmail / etc.) */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/* Form endpoint */
app.post("/api/lead", async (req, res) => {
  const { name, email, phone, service, message, source } = req.body;

  try {
    await transporter.sendMail({
      from: `"Website Lead" <${process.env.FROM_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Lead from ${source}`,
      html: `
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Service:</b> ${service}</p>
        <p><b>Message:</b><br>${message}</p>
      `
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* Start server */
app.listen(process.env.PORT || 5000, () => {
  console.log("Backend running");
});
app.get("/", (req, res) => {
  res.send("ASCO Backend is running");
});

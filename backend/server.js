app.post("/api/lead", async (req, res) => {
  const { name, email, phone, service, message, source } = req.body;

  try {
    /* ================= ADMIN EMAIL ================= */
    const adminResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
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

    if (!adminResponse.ok) {
      const error = await adminResponse.text();
      console.error("Admin email failed:", error);
      return res.status(500).json({ success: false });
    }

    /* ================= AUTO-REPLY TO USER ================= */
    const userResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        "accept": "application/json"
      },
      body: JSON.stringify({
        sender: {
          email: process.env.FROM_EMAIL,
          name: "Anil Sekhri & Company"
        },
        to: [
          { email: email, name: name }
        ],
        subject: "We have received your enquiry",
        htmlContent: `
          <p>Dear ${name},</p>

          <p>Thank you for contacting <strong>Anil Sekhri & Company</strong>.</p>

          <p>We have received your enquiry and our team will review the details and get back to you shortly.</p>

          <p>If your matter is urgent, please feel free to reply to this email.</p>

          <br>
          <p>Warm regards,<br>
          <strong>Anil Sekhri & Company</strong></p>
        `
      })
    });

    if (!userResponse.ok) {
      const error = await userResponse.text();
      console.error("Auto-reply failed:", error);
      // Note: admin email already sent, so we still return success
    }

    res.json({ success: true });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ success: false });
  }
});

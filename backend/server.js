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
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Service:</b> ${service}</p>
          <p><b>Message:</b><br>${message}</p>
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

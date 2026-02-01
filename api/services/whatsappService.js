const axios = require("axios");

const sendWhatsApp = async (target, message) => {
  try {
    if (!target) {
      console.warn("WA Service: No target number provided.");
      return;
    }

    // Ensure phone number format (Fonnte requires 08... or 62...) If it starts with 08, reasonable.

    if (!process.env.FONNTE_TOKEN) {
      console.warn("WA Service: No FONNTE_TOKEN in .env");
      return;
    }

    const response = await axios.post(
      "https://api.fonnte.com/send",
      {
        target: target,
        message: message,
        countryCode: "62", // Optional, default 62
      },
      {
        headers: {
          Authorization: process.env.FONNTE_TOKEN,
        },
      }
    );

    console.log("WA Sent to", target, ":", response.data);
    return response.data;
  } catch (error) {
    console.error("WA Service Error:", error.response?.data || error.message);
    // Don't throw, just log. Notification failure shouldn't block main flow.
  }
};

module.exports = { sendWhatsApp };

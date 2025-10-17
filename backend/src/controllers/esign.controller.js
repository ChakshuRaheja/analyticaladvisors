const axios = require("axios");
const fs = require("fs");

const DIGIO_API_KEY = process.env.DIGIO_CLIENT_ID;
const DIGIO_API_SECRET = process.env.DIGIO_CLIENT_SECRET;
const DIGIO_API_URL = "https://ext.digio.in:444";
const pdfBuffer = fs.readFileSync("./assets/AA_Terms_and_Conditions_20250924.pdf");
const base64PDF = pdfBuffer.toString("base64");

// Helper: Basic Auth header
const getAuthHeader = () => {
  const token = Buffer.from(`${DIGIO_API_KEY}:${DIGIO_API_SECRET}`).toString("base64");
  return `Basic ${token}`;
};

// ==================== INIT ESIGN ====================
const initEsign = async (req, res) => {
  try {
    const { customer_identifier } = req.body; // Email from frontend / Firebase

    if (!customer_identifier) {
      return res.status(400).json({ success: false, message: "customer_identifier (email) is required" });
    }

    const payload = {
      signers: [
        {
          identifier: customer_identifier,
          reason: "Agreement",
          sign_type: "aadhaar"
        }
      ],
      expire_in_days: 90,
      display_on_page: "all",
      include_authentication_url: true,
      comment: "Read message",
      file_name: "analyticaladvisors_terms_and_conditions.pdf",
      file_data:base64PDF,

      send_sign_link: false,
      notify_signers: false
    };

    const response = await axios.post(
      `${DIGIO_API_URL}/v2/client/document/uploadpdf`,
      payload,
      {
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Digio eSign Init Response:", response.data);

    return res.json({
      success: true,
      message: "eSign request created successfully",
      requestId: response.data?.id || null,
      data: response.data
    });

  } catch (error) {
    console.error("ESIGN INIT ERROR:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message,
      details: error.response?.data || null
    });
  }
};

const verifyEsign = async (req, res) => {
    try {
      const { requestId } = req.query;
      if (!requestId) {
        return res.status(400).json({ success: false, message: "requestId is required" });
      }
  
      const response = await axios.get(`${DIGIO_API_URL}/v2/client/document/${requestId}`, {
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/json"
        }
      });
  
      console.log("Digio eSign Status Response:", response.data);
  
      // Return the complete response from Digio without modifying it
      return res.json({
        success: true,
        ...response.data,  // Spread the entire response data
        // Keep these for backward compatibility
        status: response.data.agreement_status || 'pending',
        data: response.data
      });
  
    } catch (error) {
      console.error("ESIGN VERIFY ERROR:", error.response?.data || error.message);
      return res.status(500).json({
        success: false,
        message: error.response?.data?.message || error.message,
        details: error.response?.data || null
      });
    }
    
  };
  // At the end of esign.controller.js
module.exports = {
    initEsign,
    verifyEsign
  };


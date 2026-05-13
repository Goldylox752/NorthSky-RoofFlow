const service = require("./portal.service");

/* ===============================
   SAFE RESPONSE HELPER
=============================== */
const sendResponse = (res, result) => {
  return res.status(result?.success === false ? 400 : 200).json(result);
};

const handleError = (res, err) => {
  return res.status(500).json({
    success: false,
    error: err?.message || "Internal server error",
  });
};

/* ===============================
   CREATE PORTAL SESSION
=============================== */
exports.createPortalSession = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const result = await service.createPortalSession(email);

    return sendResponse(res, result);
  } catch (err) {
    return handleError(res, err);
  }
};

/* ===============================
   GET CUSTOMER
=============================== */
exports.getCustomer = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const result = await service.getCustomer(email);

    return sendResponse(res, result);
  } catch (err) {
    return handleError(res, err);
  }
};

/* ===============================
   CANCEL SUBSCRIPTION
=============================== */
exports.cancelSubscription = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const result = await service.cancelSubscription(email);

    return sendResponse(res, result);
  } catch (err) {
    return handleError(res, err);
  }
};
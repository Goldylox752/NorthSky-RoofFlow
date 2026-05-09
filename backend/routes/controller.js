const service = require("./portal.service");

/* ===============================
   CREATE PORTAL SESSION
=============================== */
exports.createPortalSession = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await service.createPortalSession(email);

    return res.json(result);

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* ===============================
   GET CUSTOMER
=============================== */
exports.getCustomer = async (req, res) => {
  try {
    const { email } = req.query;

    const result = await service.getCustomer(email);

    return res.json(result);

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* ===============================
   CANCEL SUBSCRIPTION
=============================== */
exports.cancelSubscription = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await service.cancelSubscription(email);

    return res.json(result);

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
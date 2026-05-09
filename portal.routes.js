const router = require("express").Router();
const controller = require("./portal.controller");

router.post("/create", controller.createPortalSession);
router.get("/customer", controller.getCustomer);
router.post("/cancel", controller.cancelSubscription);

module.exports = router;
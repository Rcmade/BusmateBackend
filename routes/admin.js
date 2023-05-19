const express = require("express");

const router = express.Router();
const { isAuth } = require("../middlewares/isAuth");
const Admin = require("../controllers/admin");
const upload = require("../middlewares/storage");
const { backupMiddleware } = require("../middlewares/backupMiddleware");

router.post("/user-varify", isAuth, Admin.authenticateUser);
router.post("/user-not-varify", isAuth, Admin.authenticateNotUser);
router.post("/user-create", isAuth, upload.array("imgs"), Admin.createUser);
router.get("/user-all-user-view", isAuth, Admin.allUserView);
router.get("/user-search", isAuth, Admin.userSearch);
router.get("/user-profile", isAuth, Admin.userProfile);
router.post("/nginx-error", isAuth, Admin.nginxError);
router.get("/remove-realtime-location", isAuth, Admin.removeRealTimeLocation);
router.get("/remove-contributor", isAuth, Admin.removeContributorDb);
router.get("/current-contributors", isAuth, Admin.currentContributor);
router.get("/db-status", isAuth, Admin.databaseStats);

router.get("/get", Admin.realTimeData);

module.exports = router;

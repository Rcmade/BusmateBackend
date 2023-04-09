const express = require("express");

const router = express.Router();
const { isAuth } = require("../middlewares/isAuth");
const Admin = require("../controllers/admin");
const upload = require("../middlewares/storage");

router.post("/user-varify", isAuth, Admin.authenticateUser);
router.post("/user-not-varify", isAuth, Admin.authenticateNotUser);
router.post("/user-create", isAuth, upload.array("imgs"), Admin.createUser);
router.get("/user-all-user-view", isAuth, Admin.allUserView);
router.get("/user-search", isAuth, Admin.userSearch);
router.get("/user-profile", isAuth, Admin.userProfile);
router.post("/nginx-error", isAuth, Admin.nginxError);

module.exports = router;

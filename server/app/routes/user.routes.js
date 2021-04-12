const { authjwt } = require("../middleware");
const controller = require("../controllers/user.controller");
module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get(
        "/api/test/patient",
        [authjwt.verifyToken, authjwt.isPatient],
        controller.patientBoard
    );

    app.get(
        "/api/test/admin",
        [authjwt.verifyToken, authjwt.isAdmin],
        controller.adminBoard
    );

    app.get(
        "/api/test/doctor",
        [authjwt.verifyToken, authjwt.isDoctor],
        controller.doctorBoard
    );

    // app.post(
    //     "/api/test/patientByNric",
    //     // [authjwt.verifyToken],
    //     controller.patientByNric
    // );

    app.post(
        "/api/test/patientByContactNum",
        // [authjwt.verifyToken],
        controller.patientByContactNum
    );

    app.post(
        "/api/test/patientById",
        // [authjwt.verifyToken],
        controller.patientById
    );

    app.post(
        "/api/test/doctorById",
        // [authjwt.verifyToken],
        controller.doctorById
    );
};

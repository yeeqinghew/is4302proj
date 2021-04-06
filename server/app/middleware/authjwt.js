const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    req.userId = decoded.id;
    next();
  });
};

isPatient = (req, res, next) => {
  User.findByPk(req.userId).then((user) => {
    user.getRole().then((role) => {
      if (role.name === "patient") {
        next();
        return;
      }

      res.status(403).send({
        message: "Require Patient Role!",
      });
      return;
    });
  });
};

isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then((user) => {
    user.getRole().then((role) => {
      if (role.name === "admin") {
        next();
        return;
      }

      res.status(403).send({
        message: "Require Admin Role!",
      });
      return;
    });
  });
};

isDoctor = (req, res, next) => {
  User.findByPk(req.userId).then((user) => {
    user.getRole().then((role) => {
      if (role.name === "doctor") {
        next();
        return;
      }

      res.status(403).send({
        message: "Require Doctor Role!",
      });
      return;
    });
  });
};

/*
isModeratorOrAdmin = (req, res, next) => {
    User.findByPk(req.userId).then(user => {
        user.getRole().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "moderator") {
                    next();
                    return;
                }

                if (roles[i].name === "admin") {
                    next();
                    return;
                }
            }

            res.status(403).send({
                message: "Require Moderator or Admin Role!"
            });
        });
    });
};
*/

const authjwt = {
  verifyToken: verifyToken,
  isPatient: isPatient,
  isAdmin: isAdmin,
  isDoctor: isDoctor,
};
module.exports = authjwt;

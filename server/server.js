const express = require("express"); // for building rest apis
const bodyParser = require("body-parser"); // helps to parse the request and create the req.body
const cors = require("cors"); // provides Express middle to enable CORS
const app = express();
const db = require("./app/models");
const Role = db.role;
var corsOptions = {
    origin: "http://localhost:3000"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to IS4302 application." });
});

db.sequelize.sync({ force: true }).then(() => {
    console.log('Drop and Resync Db');
    initial();
});
function initial() {
    Role.create({
        id: 1,
        name: "patient"
    });

    Role.create({
        id: 2,
        name: "admin"
    });

    Role.create({
        id: 3,
        name: "healthcare_provider"
    });

    Role.create({
        id: 4,
        name: "financial_institution"
    });

    Role.create({
        id: 5,
        name: "doctor"
    });

    Role.create({
        id: 6,
        name: "nurse"
    });

    Role.create({
        id: 7,
        name: "healthcare_analyst"
    });
}

// For production: this is to avoid droppping data 
// db.sequelize.sync();

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
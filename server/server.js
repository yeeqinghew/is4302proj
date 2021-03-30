const express = require("express"); // for building rest apis
const bodyParser = require("body-parser"); // helps to parse the request and create the req.body
const cors = require("cors"); // provides Express middle to enable CORS
const app = express();
const db = require("./app/models");
const Role = db.role;
const Users = db.user;
const Admin = db.admin;
const Patient = db.patient;
const Doctor = db.doctor;
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
        name: "admin"
    });

    Role.create({
        id: 2,
        name: "patient"
    });

    Role.create({
        id: 3,
        name: "doctor"
    });

    Admin.create({
        date_joined: new Date(),
        user: {
            username: "admin",
            password: "$2a$08$c83jezBZVCgjEwqpg54dVuPiwxZdGjWgztybLxDh8.sj2PeYSpGnG",
            first_name: "Jeremy",
            last_name: "Tan",
            email: "admin@gmail.com",
            contact_num: "94581236",
            dob: new Date(1990, 11, 12),
            gender: "Male",
            nationality: "Singaporean",
            race: "Chinese",
            roleId: 1
        }
    }, {
        include: [ Admin.user ]
    });

    Patient.create({
        nric: "S6153515B",
        home_address: "12 West Coast Rd Singapore 123456",
        emergency_contact: "98765432",
        user: {
            username: "patient",
            password: "$2a$08$c83jezBZVCgjEwqpg54dVuPiwxZdGjWgztybLxDh8.sj2PeYSpGnG",
            first_name: "Sally",
            last_name: "Lee",
            email: "patient@gmail.com",
            contact_num: "95739285",
            dob: new Date(1961, 05, 18),
            gender: "Female",
            nationality: "Singaporean",
            race: "Malay",
            roleId: 2
        }
    }, {
        include: [ Patient.user ]
    })

    Doctor.create({
        specialty: "Neurology",
        healthcare_institution: "Tan Tock Seng Hospital",
        user: {
            username: "doctor",
            password: "$2a$08$c83jezBZVCgjEwqpg54dVuPiwxZdGjWgztybLxDh8.sj2PeYSpGnG",
            first_name: "Patricia",
            last_name: "Ong",
            email: "doctor@gmail.com",
            contact_num: "94581236",
            dob: new Date(1985, 07, 27),
            gender: "Female",
            nationality: "Singaporean",
            race: "Chinese",
            roleId: 3
        }
    }, {
        include: [ Doctor.user ]
    })

    // Users.create({
    //     userId: 1,
    //     username: "admin",
    //     email: "admin@gmail.com",
    //     password: "$2a$08$c83jezBZVCgjEwqpg54dVuPiwxZdGjWgztybLxDh8.sj2PeYSpGnG",
    //     roleId: 1
    // });
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
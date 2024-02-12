const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const App = express();

App.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Abi#2234',
    database: 'newCast'
});

db.connect((err) => {
    if (err) {
        console.log("DB error:", err.message);
    } else {
        console.log('Database Connected..');
    }
});

App.use(express.json());

// Signup
App.post('/api/signup', (req, res) => {
    const received_data = req.body;
    const { firstName, lastName, username, email, mobileNumber, age, password, confirmPassword } = received_data;
    const sql = "INSERT INTO userData (firstName, lastName, username, email, mobileNumber, age, password, confirmPassword) VALUES (?,?,?,?,?,?,?,?);";
    db.query(sql, [firstName, lastName, username, email, mobileNumber, age, password, confirmPassword], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(400).send("Username is already taken");
            } else {
                console.error("Error inserting data", err.message);
                res.status(500).send('Error inserting data into database..');
            }
        } else {
            console.log("Data inserted successfully:", result);
            res.status(200).send("Data received and inserted successfully");
        }
    });
});

// Login
App.post('/api/login', (req, res) => {
    const received_data = req.body;
    // console.log(received_data)
    const { username, password } = received_data;
    // console.log(username);
    const sql = "SELECT * FROM userData WHERE username=?;";
    db.query(sql, [username], (err, result) => {
        if (err) {
            console.error("Error executing query:", err.message);
            res.status(500).send("Error during login");
            
        } else {
            console.log(result);
            try {
                console.log(result[0].password);
                if (result.length > 0 && result[0].password === password) {
                    res.status(200).send("Login successful");
                } else {
                    res.status(401).send("Invalid username or password");
                }
            } catch (error) {
                console.error("Error during login:", error.message);
                res.status(500).send("Error during login");
            }
        }
    });
});

// Admin
App.post('/api/admin', (req, res) => {
    const received_data = req.body;
    console.log(received_data);
    const { centreName, latitude, totalSeats, address, functionTime, centreArea, longitude, centreHead, contactNumber, password } = received_data;
    const sql = "INSERT INTO centreData (centreName, latitude, totalSeats, address, functionTime, centreArea, longitude, centreHead, contactNumber, availableSlot) VALUES (?,?,?,?,?,?,?,?,?,?);";
    console.log(password);
    // const availableSlot = totalSeats;
    if (password == "Admin@123") {
        db.query(sql, [centreName, latitude, totalSeats, address, functionTime, centreArea, longitude, centreHead, contactNumber, totalSeats], (err, result) => {
            if (err) {
                console.error("Error inserting data", err.message);
                res.status(500).send(err); // Sending the error object instead of separate status and error.
            } else {
                console.log("centre addition Data inserted successfully:", result);
                res.status(200).send("Centre added successfully"); // Sending a success message.
            }
        });
    } else {
        res.status(403).send("Unauthorized access, please enter correct password"); // Sending a forbidden status for incorrect password.
    }
});

// Book slot
App.post('/api/book', (req, res) => {
    // Implement booking functionality
});

// Main
const PORT = 5000;
App.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// Get all latitude and longitude data
App.get('/api/vaccentres', (req, res) => {
    const sql = "SELECT latitude, longitude FROM centreData;";
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error retrieving data", err.message);
            res.status(500).send("Error retrieving data from database");
        } else {
            res.status(200).json(result);
        }
    });
});


// Get all centre data
App.get('/api/centres', (req, res) => {
    const sql = "SELECT * FROM centreData;";
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error retrieving centre data", err.message);
            res.status(500).send("Error retrieving data from database");
        } else {
            res.status(200).json(result);
        }
    });
});

// Get Specific centre data
App.get('/api/specentres/:centreId', (req, res) => {
    const centreId = req.params.centreId;
    const sql = "SELECT * FROM centreData WHERE id = ?";

    db.query(sql, [centreId], (err, result) => {
        if (err) {
            console.error("Error fetching centre data by ID", err.message);
            res.status(500).send("Error retrieving data from database");
        } else {
            if (result.length === 0) {
                res.status(404).send("Centre not found");
            } else {
                res.status(200).json(result[0]); // Assuming only one row will match the centreId
            }
        }
    });
});

//Decrement available slot of specific centre
App.get('/api/decrementSlot/:centreId', (req, res) => {
    const centreId = req.params.centreId;
    const sqlUpdate = "UPDATE centreData SET availableSlot = availableSlot - 1 WHERE id = ? AND availableSlot > 0";

    // Execute the update query to decrement the available slot count
    db.query(sqlUpdate, [centreId], (err, result) => {
        if (err) {
            console.error("Error decrementing available slot count:", err.message);
            res.status(500).send("Error updating data in database");
        } else {
            if (result.affectedRows === 0) {
                res.status(404).send("Centre not found or no available slots left");
            } else {
                res.status(200).send("Available slot decremented successfully");
            }
        }
    });
});




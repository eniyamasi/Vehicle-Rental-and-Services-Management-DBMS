const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const path = require("path");
const session = require("express-session"); // Import express-session
const { v4: uuidv4 } = require("uuid"); // Import UUID

const app = express();

dotenv.config({ path: "./.env" });
console.log("DB_HOST:", process.env.DATABASE_HOST);
console.log("DB_USER:", process.env.DATABASE_ROOT);
console.log("DB_PASS:", process.env.DATABASE_PASSWORD);
console.log("DB_NAME:", process.env.DATABASE);

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_ROOT,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("MySQL connected!");
  }
});

// Initialize session middleware
app.use(
  session({
    secret: "your_secret_key", // Replace with a random secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // For production, use true with HTTPS
  })
);

const publicDir = path.join(__dirname, "./public");
app.use(express.static(publicDir)); // Serving static HTML files

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve index.html with session check for username
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve register.html
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Handle user registration
app.post("/auth/register", async (req, res) => {
  const { User_Name, Email, Pass_word, DOB, Address, Mobile_Number } = req.body;
  const User_ID = uuidv4(); // Generate a unique User_ID

  db.query(
    "SELECT Email FROM User WHERE Email = ?",
    [Email],
    (error, result) => {
      if (error) {
        console.log(error);
        return res.redirect("/register?message=An%20error%20occurred");
      }

      if (result.length > 0) {
        return res.redirect(
          "/register?message=This%20email%20is%20already%20in%20use"
        );
      }

      db.query(
        "INSERT INTO User SET ?",
        { User_ID, User_Name, Email, DOB, Pass_word, Address },
        (err, result) => {
          if (err) {
            console.log(err);
            return res.redirect("/register?message=An%20error%20occurred");
          }

          const mobileNumbers = Array.isArray(Mobile_Number)
            ? Mobile_Number
            : [Mobile_Number];
          mobileNumbers.forEach((number) => {
            if (number) {
              db.query(
                "INSERT INTO User_MobileNumber SET ?",
                { Mobile_Number: number, User_ID },
                (err, result) => {
                  if (err) {
                    console.log(err);
                  }
                }
              );
            }
          });

          // Set session with username after registration
          req.session.username = User_Name;

          // Redirect to the index page
          return res.redirect("/");
        }
      );
    }
  );
});

// Check session status to display username
app.get("/session-status", (req, res) => {
  if (req.session.username) {
    res.json({ loggedIn: true, username: req.session.username });
  } else {
    res.json({ loggedIn: false });
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});

const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const path = require("path");

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

app.set("view engine", "hbs");

const publicDir = path.join(__dirname, "./public");

app.use(express.static(publicDir));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post("/auth/register", async (req, res) => {
  const { User_ID, User_Name, Email, Pass_word, Address } = req.body;
  console.log(User_ID, User_Name, Email, Pass_word, Address);
  console.log(req.body);

  // Check if the email is already in use
  db.query(
    "SELECT Email FROM User WHERE Email = ?",
    [Email],
    (error, result) => {
      if (error) {
        console.log(error);
        return res.render("register", { message: "An error occurred." });
      }

      // Check if the email already exists
      if (result.length > 0) {
        return res.render("register", {
          message: "This email is already in use",
        });
      }

      // Insert the new user without hashing the password
      db.query(
        "INSERT INTO User SET ?",
        {
          User_ID: User_ID,
          User_Name: User_Name,
          Email: Email,
          Pass_word: Pass_word, // Inserting plain text password
          Address: Address,
        },
        (err, result) => {
          if (err) {
            console.log(err);
            return res.render("register", { message: "An error occurred." });
          } else {
            return res.render("register", {
              message: "User registered!",
            });
          }
        }
      );
    }
  );
});

app.listen(5000, () => {
  console.log("server started on port 5000");
});

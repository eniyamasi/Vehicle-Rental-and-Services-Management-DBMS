const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");

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
  const { name, email, password, password_confirm } = req.body;
  console.log(name, email, password, password_confirm);
  console.log(req.body);

  // Check if the email is already in use
  db.query(
    "SELECT email FROM users WHERE email = ?",
    [email],
    async (error, result) => {
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

      // Check if passwords match
      if (password !== password_confirm) {
        return res.render("register", {
          message: "Passwords do not match!",
        });
      }

      // Hash the password and insert the new user
      try {
        let hashedPassword = await bcrypt.hash(password, 8);
        db.query(
          "INSERT INTO users SET ?",
          { name: name, email: email, password: hashedPassword },
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
      } catch (err) {
        console.log(err);
        return res.render("register", {
          message: "An error occurred while hashing the password.",
        });
      }
    }
  );
});

app.listen(5000, () => {
  console.log("server started on port 5000");
});

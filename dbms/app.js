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
  if (req.session.username) {
    res.send(
      `<h1>Hi, ${req.session.username}</h1>
      <a href="/logout">Logout</a>`
    );
  } else {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  }
});

// Serve register.html
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Serve the login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/add-vehicle", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "add-vehicle.html"));
});

// Handle user registration
app.post("/auth/register", async (req, res) => {
  const {
    User_Name,
    Email,
    Pass_word,
    DOB,
    Address,
    Mobile_Number,
    role,
    DriverLicense,
  } = req.body;
  const User_ID = uuidv4(); // Generate a unique User_ID
  const Renter_ID = uuidv4();
  const Owner_ID = uuidv4();

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
          console.log("Role:", role);
          console.log("DriverLicense:", DriverLicense);
          // Check the role of the user
          if (role === "owner") {
            const Owner_ID = uuidv4(); // Generate Owner ID
            db.query(
              "INSERT INTO Owners SET ?",
              { Owner_ID, User_ID },
              (err, result) => {
                if (err) {
                  console.log(err);
                }
              }
            );
          } else if (role === "renter") {
            const Renter_ID = uuidv4(); // Generate Renter ID
            db.query(
              "INSERT INTO Renter SET ?",
              { Renter_ID, User_ID, DriverLicense },
              (err, result) => {
                if (err) {
                  console.log(err);
                }
              }
            );
          }

          // Set session with username after registration
          req.session.username = User_Name;
          req.session.role = role;

          // Redirect to the index page
          return res.redirect("/");
        }
      );
    }
  );
});

app.post("/auth/login", (req, res) => {
  const { Email, Pass_word } = req.body;
  console.log("Login attempt with email:", Email);

  db.query(
    "SELECT * FROM User WHERE Email = ? AND Pass_word = ?",
    [Email, Pass_word],
    (error, result) => {
      if (error) {
        console.log("Error in first query:", error);
        return res.redirect("/login?message=An%20error%20occurred");
      }

      if (result.length > 0) {
        const User_ID = result[0].User_ID;
        const User_Name = result[0].User_Name;
        console.log("User found:", User_Name);

        // Check if user is in Owners table
        db.query(
          "SELECT * FROM Owners WHERE User_ID = ?",
          [User_ID],
          (err, ownerResult) => {
            if (err) {
              console.log("Error in Owners query:", err);
              return res.redirect("/login?message=An%20error%20occurred");
            }

            console.log("Owner query result:", ownerResult); // Debugging line

            if (ownerResult.length > 0) {
              req.session.role = "owner";
              req.session.username = User_Name;
              req.session.ownerId = ownerResult[0].Owner_ID; // Ensure this is set
              console.log("User is an owner, redirecting...");
              return res.redirect("/"); // Redirect after setting the session
            } else {
              // Check if user is in Renter table
              db.query(
                "SELECT * FROM Renter WHERE User_ID = ?",
                [User_ID],
                (err, renterResult) => {
                  if (err) {
                    console.log("Error in Renter query:", err);
                    return res.redirect("/login?message=An%20error%20occurred");
                  }

                  console.log("Renter query result:", renterResult); // Debugging line

                  if (renterResult.length > 0) {
                    req.session.role = "renter";
                    req.session.username = User_Name; // Ensure this is set
                    req.session.renterId = renterResult[0].Renter_ID;
                    console.log("User is a renter, redirecting...");
                    return res.redirect("/"); // Redirect after setting the session
                  } else {
                    req.session.role = "guest"; // Fallback role
                    console.log(
                      "No specific role found for user, redirecting as guest"
                    );
                    req.session.username = User_Name; // Set username
                    return res.redirect("/"); // Redirect for guest
                  }
                }
              );
            }
          }
        );
      } else {
        // If login fails, redirect to login page with an error message
        console.log("Invalid login credentials");
        return res.redirect("/login?message=Invalid%20credentials");
      }
    }
  );
});

app.post("/add-vehicle", (req, res) => {
  const { Seater, AC_Type, Fuel, Fastag, Distance, Yr, Variant, rand } =
    req.body;
  const Vehicle_ID = uuidv4(); // Generate unique vehicle ID
  const Owner_ID = req.session.ownerId; // Get Owner_ID from session

  db.query(
    "INSERT INTO Vehicle SET ?",
    {
      Vehicle_ID,
      Owner_ID, // Use Owner_ID instead of User_ID
      Seater,
      AC_Type,
      Fuel,
      Fastag,
      Distance,
      Yr,
      Variant,
      rand,
    },
    (error, result) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to add vehicle." });
      }
      return res.status(200).json({ message: "Vehicle added successfully." });
    }
  );
});

// Check session status to display username
app.get("/session-status", (req, res) => {
  if (req.session.username) {
    res.json({
      loggedIn: true,
      username: req.session.username,
      role: req.session.role,
    });
  } else {
    res.json({ loggedIn: false });
  }
});

// Handle user logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.redirect("/?message=Logout%20failed");
    }
    res.redirect("/login?message=Logged%20out%20successfully");
  });
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});

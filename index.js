// Import express, env, PostgreSQLe & Body-Parser modules
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

//Setup the environment for our variables.
env.config();

// Creation of an express app and set the port number.
const app = express();
const port = 3000;

//We create the connection to our PostgreSQL database
const db = new pg.Client({
  user:process.env.SESSION_USER ,
  host: process.env.SESSION_HOST ,
  database: process.env.SESSION_DATABASE ,
  password: process.env.SESSION_PASSWORD ,
  port: process.env.SESSION_PORT,
});
db.connect();

//We activate bodyparser to parse data from user's request
app.use(bodyParser.urlencoded({ extended: true }));

// Use the public folder for static files.
app.use(express.static("public"));

//Function to retrieve all the information from the reviews from the database.
async function allreviews() {
  const result = await db.query("SELECT * FROM book_reviews ORDER BY id ASC");
  return result.rows;
};

//Homepage that is feeded with the results from the allreviews() function that is stored in the books variable.
app.get("/", async (req, res) => {
    const books = await allreviews();
    const bookCover = "";
    res.render("index.ejs",{
        books: books,
        cover: bookCover
    })
});

// Route to render new.ejs file in order to create a new book review
app.post("/new", async (req, res) => {
    try {
        res.render("new.ejs");
    } catch (err) {
        console.log(err);
    }
});

// Post Request to add the information of the new review, to our databse.
app.post("/add", async (req, res) => {
    try {
        const newTitle = req.body.newTitle;
        const newReview = req.body.newReview;
        const newOLID = req.body.newOLID;
        const newUser = req.body.newUser;
        await db.query(
            "INSERT INTO book_reviews (bookname, review, olid, username) VALUES($1,$2,$3,$4)",
            [newTitle,newReview,newOLID,newUser]
          );
        res.redirect("/");
    } catch (err) {
        console.log(err);
    }
});

// Route to edit an existing review
app.post("/edit", async (req, res) => {
  const editedCover = req.body.updatedCoverId;
  const editedBook = req.body.updatedBookName;
  const editedBookId = req.body.updatedBookId;
  const editedReview = req.body.updatedBookReview;
  const editedUser = req.body.updatedUserName;
  try {
    await db.query(
      "UPDATE book_reviews SET bookname = ($1), review = ($2), username = ($3), olid = ($4) WHERE id = ($5)",
      [editedBook,editedReview,editedUser,editedCover,editedBookId]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

//Route that deletes an entire review from our database.
app.post("/delete", async (req, res) => {
  const deletedbook = req.body.deleteBookId;
  try {
      await db.query(
          "DELETE FROM book_reviews WHERE id = ($1)",
          [deletedbook]
        );
        res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

// Listen on your predefined port and start the server.
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

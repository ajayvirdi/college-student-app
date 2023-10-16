const express = require('express');
const sqlite3 = require('sqlite3');
const ejs = require('ejs');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

const db = new sqlite3.Database('database.sqlite');

// Create students table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    marks INTEGER,
    class TEXT
  )
`);

// Root route to render the index page
app.get('/', (req, res) => {
  res.render('index');
});

// Route to render the form for adding a new student
app.get('/students/new', (req, res) => {
  res.render('new_student');
});

// Route to handle the form submission and add a new student to the database
app.post('/students/new', (req, res) => {
  const { name, marks, class: studentClass } = req.body;

  // Validate input (you may want to add more validation)
  if (!name || !marks || !studentClass) {
    return res.status(400).send('Invalid input. All fields are required.');
  }

  // Insert the new student into the database
  db.run('INSERT INTO students (name, marks, class) VALUES (?, ?, ?)', [name, marks, studentClass], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    res.redirect('/students');
  });
});

// Route to fetch and display all students
app.get('/students', (req, res) => {
  // Fetch all students from the database
  db.all('SELECT * FROM students', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.render('students', { students: rows });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using the POST method
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//setting up database connection pool, replace values in red
const pool = mysql.createPool({
   host: "m7wltxurw8d2n21q.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
   user: "zovyyv57s78hw9lh",
   password: "ad3pz658rb3fcadr",
   database: "l8nygxrz47fizl99",
   connectionLimit: 10,
   waitForConnections: true
});

app.get('/', (req, res) => {
   res.render('home.ejs');
});

app.get('/signUp', (req, res) => {
   res.render('signUp.ejs');
});

app.get('/createPost', (req, res) => {
   res.render('createPost.ejs');
});

app.listen(3000, () => {
   console.log('server started');
});

//API to check if username exists 
app.post('/checkUsername', async (req, res) => {
   let username = req.body.username;
   let sql = `SELECT username FROM users WHERE username = ?`;
   let [rows] = await pool.query(sql, [username]);

   res.send({ available: rows.length === 0 });
});

//route to createUser after form validation
app.post('/createUser', async (req, res) => {
   try {
      let { username, email, password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10); //hash password before sending to db using a salt of 10 rounds

      // Insert user into database
      let sql = `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`;
      await pool.query(sql, [username, email, hashedPassword]);

      res.json({ success: true });
   } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).json({ success: false, error: err.message });
   }
});

app.get("/dbTest", async (req, res) => {
   try {
      const [rows] = await pool.query("SELECT CURDATE()");
      res.send(rows);
   } catch (err) {
      console.error("Database error:", err);
      res.status(500).send("Database error!");
   }
});//dbTest
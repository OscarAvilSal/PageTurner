import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';
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

//Setting Session
app.use(session({
   //TODO: use in memory state - set session to expire when browser closes
   secret: 'seceret', // Used to sign the session ID cookie
   resave: false,             // Avoid resaving session if unmodified
   saveUninitialized: false,  // Don't create session until something stored
   cookie: {
      secure: false,           // Set to true in production with HTTPS
      // maxAge: expire when page closes   // Session expiry in milliseconds (1 minute)
   }
}));

function isUserAuthenticated(req, res, next){
    if(req.session.authenticated){
        next();
    }else{
        res.redirect("/");//change to login page once created
    }
}

app.get('/', (req, res) => {
   res.render('home.ejs', { user: req.session.username || null });
});

app.get('/signUp', (req, res) => {
   res.render('signUp.ejs', { user: req.session.username || null });
});

// TODO: replace with function after login page is complete
// app.get('/createPost', isUserAuthenticated, (req, res) => {
   app.get('/createPost', (req, res) => {
   res.render('createPost.ejs', { user: req.session.username || null });
});

app.post('/savePost', async (req, res) => {
   try{
      // if user is not authenticated redirect to login
      if(!req.session.userId){
         return res.json({ success: false, error: "Not authenticated" });
      }

      let {title, author, isbn, book_cover, book_review, bookKey} = req.body;

      // check for required inputs
      if(!title || !author || !book_review){
         console.log("Missing post requirements");
         return;
      }

      const userId = req.session.userId;
      let description =  "No description available";

      // Fetch book description from OpenLibrary API
      try{
         let response = await fetch(`https://openlibrary.org${bookKey}.json`);
         let data = await response.json();
         if(data.description){
            description = typeof data.description === 'string' 
               ? data.description 
               : data.description.value;
         }
      }catch (err){
         console.log("Could not fetch description from OpenLibrary", err);
      }

      let sql = `INSERT INTO books (title, author, isbn, description, book_cover, book_review, created_at, userId)
                 VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`;
      
      await pool.query(sql, [title, author, isbn, description, book_cover, book_review, userId]);
      res.json({success: true});
   }catch (err) {
      console.log("Error saving post", err);
      res.json({success: false});
   }
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

      let sql2 = `SELECT id FROM users WHERE username = ?`;
      let [rows] = await pool.query(sql2, [username]);

      //Set Session
      req.session.authenticated = true;
      req.session.userId = rows[0].id;
      req.session.username = username;

      res.json({ success: true });
   } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).json({ success: false, error: err.message });
   }
});

app.get('/logout', (req, res) => {
   req.session.destroy((err) => {
      if (err) {
         console.error("Logout error:", err);
         return res.redirect('/');
      }
      res.redirect('/');  // Redirect to home after session destroyed
   });
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
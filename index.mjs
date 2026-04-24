import express from 'express';
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"))

app.get('/', (req, res) => {
   res.render('home.ejs');
});

app.get('/signUp', (req, res) => {
   res.render('signUp.ejs');
});

app.listen(3000, () => {
   console.log('server started');
});
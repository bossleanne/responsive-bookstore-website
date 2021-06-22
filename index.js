const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const session = require('express-session');
const userRouter = require('./routes/user');
const shopRouter = require('./routes/shop');
const fileUpload = require('express-fileupload');
const url = require('url');  
const {getLoginPage,getHomePage,getbooklistPage} = require('./routes/admin');
const {addBookPage, addBook, deleteBook, editBook, editBookPage} = require('./routes/book');

const db = require('./routes/database')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const nodemailer  = require('nodemailer');
global.db = db;


const {
  promisify,
} = require('util');
const queryAsync = promisify(db.query).bind(db);
const {redisStore} = require('./redis'); 

//===========Recall session=======================
app.use(session({
  store: redisStore,
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    ttl: 30 * 10000,
    httpOnly: true,
    secure: false
  }
}));

//===========Set dirctory all ejs file=======================
app.set('views', path.join(__dirname, '/public/views/'));
app.set('view engine', 'ejs');

//===========Set other file (scc,view,image,etc) under public directory=======================
app.use(express.static(path.join(__dirname, 'public')));




//===========Start our main page=======================
app.get('/',function (req,res) {
  let ratingSQL = "SELECT p.title, p.rating, p.no_of_downloads FROM product p ORDER BY p.rating DESC, p.no_of_downloads DESC LIMIT 5";
  let ratings = {};
  db.query(ratingSQL,function (err,rs) {
    ratings = rs;
    let user = req.session.user;
    res.render('index.ejs', {
      ratings: ratings,
      user:user    
    });
  });
  console.log("=========== Landing Page =======================")
})

//=========== Customer =======================
app.use('/login.html', userRouter);

//=========== Product =======================
app.use('/shop.html',shopRouter);

//=========== Download History =======================

app.get('/download_his.html',async function (req,res) {
  const bookSQL = "SELECT * FROM orderdetail o INNER JOIN product p ON o.Product_ISBN13 = p.ISBN13 WHERE o.customer_email IN (SELECT c.email FROM myapp.customer c WHERE c.email = '"+req.session.user+"')";
  const countSQL = "SELECT COUNT(order_id) FROM myapp.orderdetail WHERE customer_email = '"+req.session.user+"'";
  const sumSQL = "SELECT SUM(unit_price) FROM myapp.Orderdetail WHERE customer_email = '"+req.session.user+"'";
  const usercard = "SELECT * FROM cardinfo where customer_email = '"+req.session.user+"'";
  let book = {};
  let count = {};
  let sum = {};
  let cus = {};
  // let hist = {};
  let user = req.session.user
  try {
    book = await queryAsync(bookSQL);
    count = await queryAsync(countSQL);
    sum = await queryAsync(sumSQL);
    cus = await queryAsync(usercard);
    let first_count=count[0];
    console.log('cus',cus[0])
    first_count = first_count['COUNT(order_id)'];
    let totalsum = sum[0];
    totalsum = totalsum['SUM(unit_price)'];
    if(cus[0]==undefined){
      console.log('cscscs',cus[0])
      res.render('download_his.ejs', {
        sql: bookSQL,
        first_count:first_count,
        totalsum: totalsum,
        book: book,
        user:user,
        card_no:"",
        CVV:"",
        holder_name:"",
        expiry:"",
        card_type:""
  
      });
    }else{
      console.log('trytytytrytyr',cus[0])
      res.render('download_his.ejs', {
        sql: bookSQL,
        first_count:first_count,
        totalsum: totalsum,
        book: book,
        user:user,
        card_no:cus[0].card_no,
        CVV:cus[0].CVV,
        holder_name:cus[0].holder_name,
        expiry:cus[0].expiry,
        card_type:cus[0].card_type

      });
    }
  } catch (err) {
    console.log('SQL error', err);ßßß
    res.status(500).send('Something went wrong');
  }
  console.log("=========== Download History Page =======================")
  console.log('session:download_his ',req.session.user)
});

app.use(fileUpload());



//=========== Admin =======================

app.get('/admin_login.html',function (req,res) {
  res.render('admin_login.ejs',{
    flag:0
  });
})

app.post('/admin_login', getLoginPage);

app.get('/admin_landing.html',getHomePage);

app.get('/admin_booklist.html', getbooklistPage);

app.get('/admin_add.html', addBookPage);

app.get('/edit/:id', editBookPage);

app.get('/delete/:id', deleteBook);

app.post('/admin_add.html', addBook);

app.post('/edit/:id', editBook);


app.get('/unsub',function (req,res){
  let user = req.session.user;
  let updatesql = "update customer set subscribed = 0 where email = '"+req.session.user+"'";
  db.query(updatesql,function (err,rs) {
      res.redirect(url.format({
        pathname:"/login.html/personal",
        user:user,
        sub: '0'
       }))
  })
});



//=========== General Search =======================
app.post('/cdsearch', async (req, res) => {
  const languageSQL = 'SELECT DISTINCT language FROM product';
  const typeSQL = 'SELECT DISTINCT type FROM product';
  const ratingSQL = 'SELECT DISTINCT rating FROM product';
  const generalSQL = 'SELECT * FROM product WHERE CONCAT(TRIM(Title), TRIM(Author),TRIM(Type), TRIM(Language)) like ?';
  let generals = {};
  let languages = {};
  let types = {};
  let ratings = {};
  let user = req.session.user
  try {
    generals = await queryAsync(generalSQL, [`%${req.body.Search}%`]);
    languages = await queryAsync(languageSQL);
    types = await queryAsync(typeSQL);
    ratings = await queryAsync(ratingSQL);
  
    res.render('search_book.ejs', {
      languages: languages,
      types: types,
      ratings: ratings,    
      generals: generals,
      user:user
    });
  } catch (err) {
    console.log('SQL error', err);
    res.status(500).send('Something went wrong');
  }
  console.log("=========== Searching Page =======================")
  console.log('session:cdsearch ',req.session.user)
});


//=========== Advance Search =======================
app.get('/search', async (req, res) => {
  console.log('dasdasdasdasdas')
  const languageSQL = 'SELECT DISTINCT language FROM product';
  const productSQL = 'SELECT title, author FROM product WHERE Title like ? AND Language = ? AND Type = ?';
  const typeSQL = 'SELECT DISTINCT type FROM product';
  const ratingSQL = 'SELECT DISTINCT rating FROM product';
  const AdvanceSQL = 'SELECT * FROM product WHERE Title like ? AND Author like ? AND Language = ?';


  let languages = {};
  let products = {};
  let types = {};
  let ratings = {};
  let generals = {};
  let user = req.session.user

  try {
    languages = await queryAsync(languageSQL);
    products = await queryAsync(productSQL, [`%${req.query.Title}%`, req.query.Language, req.query.Type]);
    types = await queryAsync(typeSQL);
    ratings = await queryAsync(ratingSQL);
    generals = await queryAsync(AdvanceSQL, [`%${req.query.Title}%`, `%${req.query.Author}%`, req.query.Language]);

    res.render('search_book.ejs', {
      sql: productSQL,
      languages: languages,
      products: products,
      types: types,
      ratings: ratings,
      generals: generals,
      user: user
    });

  } catch (err) {
    console.log('SQL error', err);
    res.status(500).send('Something went wrong');
  }
});



//=========== Query Audio =======================
app.post('/audio', async (req, res) => {
  const languageSQL = 'SELECT DISTINCT language FROM product';
  const typeSQL = 'SELECT DISTINCT type FROM product';
  const ratingSQL = 'SELECT DISTINCT rating FROM product';
  let audio = 'audio'
  const generalSQL = "SELECT * FROM product where type = '"+audio+"'";
  let generals = {};
  let languages = {};
  let types = {};
  let ratings = {};
  let user = req.session.user
  try {
    generals = await queryAsync(generalSQL, [`%${req.body.Search}%`]);
    languages = await queryAsync(languageSQL);
    types = await queryAsync(typeSQL);
    ratings = await queryAsync(ratingSQL);
  
    res.render('search_book.ejs', {
      languages: languages,
      types: types,
      ratings: ratings,    
      generals: generals,
      user:user
    });
  } catch (err) {
    console.log('SQL error', err);
    res.status(500).send('Something went wrong');
  }
  console.log("=========== Searching Page =======================")
  console.log('session:cdsearch ',req.session.user)
});

//=========== Query E-read =======================
app.post('/e-read', async (req, res) => {
  const languageSQL = 'SELECT DISTINCT language FROM product';
  const typeSQL = 'SELECT DISTINCT type FROM product';
  const ratingSQL = 'SELECT DISTINCT rating FROM product';
  let audio = 'e-read'
  const generalSQL = "SELECT * FROM product where type = '"+audio+"'";
  let generals = {};
  let languages = {};
  let types = {};
  let ratings = {};
  let user = req.session.user
  try {
    generals = await queryAsync(generalSQL, [`%${req.body.Search}%`]);
    languages = await queryAsync(languageSQL);
    types = await queryAsync(typeSQL);
    ratings = await queryAsync(ratingSQL);
  
    res.render('search_book.ejs', {
      languages: languages,
      types: types,
      ratings: ratings,    
      generals: generals,
      user:user
    });
  } catch (err) {
    console.log('SQL error', err);
    res.status(500).send('Something went wrong');
  }
  console.log("=========== Searching Page =======================")
  console.log('session:cdsearch ',req.session.user)
});

// });

//=========== Contact Use =======================
app.get('/contact.html',function (req,res) {
  let user = req.session.user
  res.render('contact.ejs',{
    user:user
  });
 })

 app.get('/logout.html',function (req,res) {
  req.session.destroy(function(e){
    res.redirect('/')
  });
 })


//=========== Subscribe and send email to user =======================
app.post('/subscribe',async function (req,res){
  console.log(req.body.email)
  var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    Port: 465,
    secure: true,
    auth: {
          user: '',
          pass: ''
      }
  });

  let product = {}
  const productSQL = 'select * from orderdetail where Customer_email = ?'

  let update = {}
  let updatesql = "update customer set subscribed = 1 where email = '"+req.session.user+"'";
  
  
  const mailOptions = {
    from: '', // sender address
    to: req.body.email,
    subject: 'Rosewine', // Subject line
    html: '<p>Thanks for your subscription --Rosewine</p>'// plain text body
  };
  
  let user = req.session.user;
  transporter.sendMail(mailOptions, function (err, info) {
    if(err)
      console.log(err)
    else{
      console.log(info);
      res.redirect('/');
    }
  });

});


app.get('/sendme',function (req,res){

  var emailSQL = "select email,password from customer c where c.email = ?";
  db.query(emailSQL,[req.query.email],function (err,rs) {
    var transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      Port: 465,
      secure: true,
      auth: {
            user: '',
            pass: ''
        }
    });
    console.log('Sending email...');
    console.log('emial',req.query.email)
      const mailOptions = {
      from: '', // sender address
      to: req.query.email,
      subject: 'Rosewine', // Subject line
      text: "Here is your password:   "+rs[0].password
    };

    let user = req.session.user;
    transporter.sendMail(mailOptions, function (err, info) {
      if(err)
        console.log(err)
      else{
        console.log(info);
        res.redirect('/login.html');
      }
    });
   })
});


//=========== Connect to server =======================
var server = app.listen(80, function () {
  var host = server.address().address;
  var port = server.address().port;
  
  console.log("Example app listening at http://%s:%s", host, port);
});

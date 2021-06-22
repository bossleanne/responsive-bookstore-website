const path = require('path');
const express = require('express');
const router = new express.Router();
const app = express();
const connection = require('./database')
const session = require('express-session');
const url = require('url');  
const dateFormat = require('dateformat');
const now = new Date();
const date = require('date-and-time');
const {
  promisify,
} = require('util');
app.set('views', path.join(__dirname, '/public/views/'));
app.set('view engine', 'ejs');
const queryAsync = promisify(connection.query).bind(connection);

const {redisStore} = require('./redis'); 

//===========Recall session=======================
app.use(session({
  store: redisStore,
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {

    maxAge: 20 * 1000,
    httpOnly: true,
    secure: false
  }
}));

router.get('/', async (req, res) => {
  const languageSQL = 'SELECT DISTINCT language FROM product';
  const typeSQL = 'SELECT DISTINCT type FROM product';
  const ratingSQL = 'SELECT DISTINCT rating FROM product';
  let types = {};
  let ratings = {};
  let languages = {};
  var bookSQL = "select * from product";
  let books = {};
  let user = req.session.user
  try {
    languages = await queryAsync(languageSQL);
    books = await queryAsync(bookSQL, [`%${req.query.Title}%`, req.query.Language, req.query.Format]);
    types = await queryAsync(typeSQL);
    ratings = await queryAsync(ratingSQL);
    
    res.render('shop.ejs', {
      sql: bookSQL,
      languages: languages,
      types: types,
      ratings: ratings,
      books: books,
      user:user
    });
  } catch (err) {
    console.log('SQL error', err);
    res.status(500).send('Something went wrong');
  }
});

//=========== Single Product =======================
router.get('/:id',async function (req,res) {
  let bookId = req.params.id;
  console.log('bookId',bookId)
  var itemSQL = "SELECT * FROM `product` WHERE ISBN13 = '" + bookId + "' ";
  const releaseSQL = "SELECT * FROM product ORDER BY DATE(release_date) DESC LIMIT 4"
  const bankSQL ="select Customer_email FROM CardInfo,Customer WHERE Customer.email = CardInfo.Customer_email and CardInfo.Customer_email = '"+req.session.user+"'";
  let bookID = req.params.id
  let book = {};
  let release = {};
  let bankcard = {}
  let user = req.session.user
  try {
    book = await queryAsync(itemSQL);
    release = await queryAsync(releaseSQL);
    bankcard = await queryAsync(bankSQL);
    res.render('single_product.ejs', {
      book: book,
      user:user,
      release:release,
      bankcard:bankcard
    });
  } catch (err) {
    console.log('SQL error', err);
    res.status(500).send('Something went wrong');
  }
})

//=========== Download Book =======================
router.post('/download_book/:id',async function (req,res) {
  const bankSQL ="select Customer_email FROM CardInfo,Customer WHERE Customer.email = CardInfo.Customer_email and CardInfo.Customer_email = '"+req.session.user+"'";
  let bookID = req.params.id
  const orderSQL = "INSERT INTO OrderDetail(customer_email, Product_ISBN13, unit_price, datetime) SELECT c.email, p.ISBN13, p.unit_price, now() FROM customer c, product p WHERE c.email ='"+req.session.user+"' AND p.ISBN13 = '"+bookID+"'";
  
  let order = {}
  let user = req.session.user

  if(req.session.user){
    db.query(bankSQL, function (err,rs) {
      if(rs==''){
        res.render('bank_card.ejs',{
              user:user    
            });
      }else{
          db.query(orderSQL,[req.session.user,bookID], function (err,rs) {
            res.redirect('/download_his.html')
          })
      }
    })
  }
  else{
    res.redirect('/login.html');
  }
});


//=========== Payment add bank card =======================
router.post('/cardinfo',function (req,res,next) {
  console.log('dbcusycbusycbsu')
  var card_no=req.body.number
  var CVV=req.body.securitycode
  var holder_name=req.body.name
  var expiry=req.body.expiration;
  var card_type = req.body.cardtype
  console.log('expiry',expiry)
  let user = req.session.user
  var card ={card_no:card_no,holder_name:holder_name,card_type:card_type,CVV:CVV,expiry:expiry,customer_email:req.session.user};
  db.query('insert into CardInfo set ?',card,function (err,rs) {
   if (err) {
     throw err
    }else{
      console.log('user',user)
      console.log('card_no',card_no)
      console.log('CVV',CVV)
      console.log('holder_name',holder_name)
      console.log('expiry',expiry)
      console.log('card_type',card_type)
    res.render('download_hist',{
      first_count:0,
      book:0,
      totalsum:0,
      user:user,
      card_no:card_no,
      CVV:CVV,
      holder_name:holder_name,
      expiry:expiry,
      card_type:card_type
    })
   }
  })
  console.log('session:cardinfo ',req.session.user)
  console.log('req.params.id',req.params.id)
})

router.post('/cardsave',function (req,res,next) {
  var card_no=req.body.number
  var CVV=req.body.securitycode
  var holder_name=req.body.name
  var expiry=req.body.expiration;
  var card_type = req.body.cardtype
  let user = req.session.user

  const userinfosql = "UPDATE cardinfo SET card_no = ?, holder_name = ?, card_type = ?,CVV =? ,expiry = ? WHERE customer_email = ?"
  connection.query(userinfosql,[card_no,holder_name,card_type,CVV,expiry,req.session.user],function (err,rs) {
  if (err) {
    console.log(err);
    throw err;
  }
  res.redirect(url.format({
    pathname:"/download_his.html",
    user:user
   }))
  
  console.log("=========== Save & Page =======================")
  console.log('session: Save ',req.session.user)
  })
})

module.exports = router;

const path = require('path');
const express = require('express');
const router = new express.Router();
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
var {redisStore} = require('./redis');
var connection = require('./database')
const url = require('url');  
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const {
  promisify,
} = require('util');
app.set('views', path.join(__dirname, '/public/views/'));
app.set('view engine', 'ejs');
const queryAsync = promisify(connection.query).bind(connection);

app.use(express.static(path.join(__dirname, 'public')));


//===========Set up session=======================
router.use(session({
  store: redisStore,
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    // name:'id',
    // maxAge: 20 * 1000,
    ttl: 30 * 10000,
    httpOnly: true,
    secure: false
  }
}));

//=========== Login Page =======================
router.get('/',function (req,res,next) {
  console.log("=== login page ===")
  let user = req.session.user
  if(req.session.user){
    var userifoSQL = "select * from customer where email = ?";
    connection.query(userifoSQL,[req.session.user],async function(error, results, fields){
      console.log('resqescsd',req.session.user)
      console.log('asdcsdcdcds',results[0])
      var first_name=results[0].first_name
      var last_name=results[0].last_name
      var email=results[0].email
      var password=results[0].password;
      var birthday=results[0].birth_date;
      var bill_add=results[0].billing_address;
      var sub = results[0].subscribed
      var user={first_name:first_name,last_name:last_name,email:email,password:password,birthday:birthday,bill_add:bill_add,user:req.session.user,sub:sub};
      res.render('personal.ejs',user);
      console.log("=========== Personal Detail Page =======================")
      console.log('session:personal',req.session.user)
    });
    // res.redirect('/login.html/personal',{

    // })
  }  
  else{res.render('login.ejs', {
    user:0,
    flag:0
  });
  }
})
// res.render('login', {flag: 0});
// /login.html/register.html

//===========Login session=======================
router.post('/login', function(req, res,next) {
   console.log(req.body.email);
   var email=req.body.email;
   var password=req.body.password;
   
  //  var selectSQL = "select email,password from customer c where c.email = '"+email+"' and c.password = '"+password+"'";
   var selectSQL = "select email,password from customer c where c.email = ? and c.password = ?";
   connection.query(selectSQL,[email,password],function (err,rs) {
     if (err) return (err);
      let user = req.session.user
      // console.log('asdcsdcdcds',rs)
    if(rs[0]==undefined){
      res.render('login', {
        user:user,
        flag: 1,
      });
     }else{
       redisStore.client.set('user', JSON.stringify({email: email}))
       req.session.user = email;
       res.redirect(url.format({
        pathname:"/",
        user:user
       }))
    }
   });
    console.log("=========== Login Query Page =======================")
    console.log('session: Login Query Page ',req.session.user)
 });


router.get('/personal',function (req,res,next) {
  redisStore.client.get('user');
  var userifoSQL = "select * from customer where email = ?";
  connection.query(userifoSQL,[req.session.user],async function(error, results, fields){
   var first_name=results[0].first_name
   var last_name=results[0].last_name
   var email=results[0].email
   var password=results[0].password;
   var birthday=results[0].birth_date;
   var bill_add=results[0].billing_address;
   var sub = results[0].subscribed
   var user={first_name:first_name,last_name:last_name,email:email,password:password,birthday:birthday,bill_add:bill_add,user:req.session.user,sub:sub};
   res.render('personal.ejs',user);
   console.log("=========== Personal Detail Page =======================")
   console.log('session:personal ',req.session.user)
  });
})

router.get('/forgetpwd.html',function (req,res) {
  let user = {}
 res.render('forget_pwd.ejs',{
   user:user
 });
})

router.get('/unsub',function (req,res){
  let user = req.session.user;
  let updatesql = "update customer set subscribed = 0 where email = '"+req.session.user+"'";
  db.query(updatesql,function (err,rs) {
    // console.log('product1',rs[0].password)
      // console.log(req.body.email)
      res.redirect(url.format({
        pathname:"/login.html/personal",
        user:user,
        sub: '0'
       }))
  })
});

router.post('/register',async function (req,res,next) {
  //if you are loogin .. doing sth
  //if not redirect to login / index page...
  var first_name=req.body.first_name
  var last_name=req.body.last_name
  var email=req.body.email
  var password=req.body.password;
  var user={first_name:first_name,last_name:last_name,email:email,password:password,subscribed:1};
  connection.query('insert into customer set ?',user,function (err,rs) {
    if (err){
      res.render('register', {
        user:user,
        sign: 1,
      });
    }else{
      redisStore.client.set('user', JSON.stringify({email: email}))
      req.session.user = email
      res.redirect('/login.html/personal',user,{
        user:user
      });
    }

    console.log("=========== Register Page =======================")
    console.log('session:register ',req.session.user)
  }) 
})

router.get('/register',function (req,res,next) {
  let user = {}
  res.render('register.ejs',{
    user:user,
    sign:0
  });
})


router.get('/log_out',function (req,res,next) {
  //delete res.session.user 
  req.session.user = NULL;
})

router.post('/save',function (req,res,next) {
  var birth = req.body.birthday
  var billing=req.body.bill_add
  console.log('billing',billing)
  var mailing=req.body.mail_add
  let lastlogin = new Date();
  let user = req.session.user
  const userinfosql = "UPDATE customer SET billing_address = ?, mailing_address = ?, birth_date = ?,last_login = ? WHERE email = ?"
  // const userinfosql = "UPDATE customer SET billing_address = '123', mailing_address = '123', birth_date = '1992-01-01',last_login =NOW() WHERE email = 'Acosta@hotmail.com'"
  connection.query(userinfosql,[billing,mailing,birth,lastlogin,user],function (err,rs) {
  // connection.query(userinfosql,function (err,rs) {
   if (err) {
     console.log(err);
     throw err;
   }
  //  console.log('ok');
  res.redirect(url.format({
    pathname:"/",
    user:user
   }))
  console.log("=========== Save & Page =======================")
  console.log('session: Save ',req.session.user)
  })
})

module.exports = router;
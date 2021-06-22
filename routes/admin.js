module.exports = {
    getLoginPage: (req, res) => {
        let email=req.body.email;
        let password=req.body.password;

         const selectSQL = "select staff_email,password,department from admin where staff_email = ? and password = ?";
        
        // execute query
        db.query(selectSQL,[email,password],function (err,rs) {
         
            if(rs[0]==undefined){
                res.render('admin_login', {
                    // user:user,
                    flag: 1,
                  });
              }else{
                let dept = rs[0].department
                res.render('store_chart.ejs', {
                    title: 'Rosewine | Admin',
                    dept: dept
                });
            }
        });
    },

    getHomePage: (req, res) => {
        res.render('store_chart.ejs', {
            title: 'Rosewine | Admin',
            dept: 'IT'
        });
    },

    getbooklistPage: (req, res) => {
        let query = "SELECT * FROM `product` "; // query database to get all the players

        // execute query
        db.query(query, (err, result) => {
            res.render('admin_index.ejs', {
                title: 'Rosewine | Admin'
                ,products: result,
                dept:'IT'
            });
        });
    },
};

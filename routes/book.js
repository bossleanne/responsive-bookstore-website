const fs = require('fs');
const url = require('url');  
module.exports = {
    addBookPage: (req, res) => {
        let usernameQuery = "SELECT * FROM genre"; 
        let genre = {}
        db.query(usernameQuery, (err, result) => {
            genre = result
            res.render('add-book.ejs', {
            title: "Welcome to Rosewine | Add a new book"
            ,message: '',
            dept:'IT',
            genre:genre
            });
        });
    },
    addBook: async(req, res) => {
        if (!req.files) {
            return res.status(400).send("No files were uploaded.");
        }
       
        let message = '';
     
        let ISBN13 = req.body.ISBN13;
        let title = req.body.title;
        let author = req.body.author;
        let type = req.body.type;
        let release_date = req.body.release_date;
        let description = req.body.description;
        let file_size = req.body.file_size;
        let Genre_genre_id = req.body.Genre_genre_id;
        let length = req.body.length;
        let publisher = req.body.publisher;
        let language = req.body.language;
        let unit_price = req.body.unit_price;
        let uploadedFile = req.files.image;
        let image_name = uploadedFile.name;
        let fileExtension = uploadedFile.mimetype.split('/')[1];
        image_name = ISBN13 + '.' + fileExtension;

        // let usernameQuery = "SELECT * FROM `players` WHERE user_name = '" + username + "'";
        let usernameQuery = "SELECT * FROM `product` WHERE ISBN13 = '" + ISBN13 + "' "; 
        
 
        db.query(usernameQuery, (err, result) => {            
            if (err) {
                return res.status(500).send(err);
            }
            if (result.length > 0) {
                message = 'ISBN13 already exists';
                res.render('add-book.ejs', {
                    message,
                    title: "Welcome to Rosewine | Add a new book",
                    dept:'IT',
                    
                });
            } else {
                // check the filetype before uploading it
                if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpg' || uploadedFile.mimetype === 'image/gif') {
                    // upload the file to the /public/assets/img directory
                    uploadedFile.mv(`public/images/${image_name}`, (err ) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                        // send the player's details to the database
                        let query = "INSERT INTO `product` (ISBN13, title, type, publisher, release_date, language, description, length, file_size, unit_price, author, Genre_genre_id, image_path) VALUES ('" +
                        ISBN13 + "', '" + title + "', '" + type + "', '" + publisher + "', '" + release_date + "', '" + language + "', '" + description + "', '" + length + "', '" + file_size + "', '" + unit_price + "','" + author + "','" + Genre_genre_id + "', '" + image_name+ "')";
                        db.query(query, (err, result) => {
                            if (err) {
                                return res.status(500).send(err);
                            }
                            // res.redirect('/admin_booklist.html');
                            res.redirect(url.format({
                                pathname:"/admin_booklist.html",
                                dept:'IT'
                            }))
                        });
                    });
                } else {
                    message = "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.";
                    res.render('add-book.ejs', {
                        message,
                        title: "Welcome to Rosewine | Add a new book",
                        dept:'IT'
                    });
                }
            }
        });
    },
    editBookPage: (req, res) => {
        let bookId = req.params.id;
        let query = "SELECT * FROM `product` WHERE ISBN13 = '" + bookId + "' ";
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.render('edit-book.ejs', {
                title: "Edit Book"
                ,products: result[0]
                ,message: '',
                dept:'IT'
            });
        });
    },
    editBook: (req, res) => {
        let bookId = req.params.id;
        let title = req.body.title;
        console.log(title)
        let author = req.body.author;
        let publisher = req.body.publisher;
        let language = req.body.language;
        let unit_price = req.body.unit_price;

        let query = "UPDATE `product` SET `title` = ?, `author` = ?, `publisher` = ?, `language` = ?, `unit_price` = ? WHERE `ISBN13` = ?";
        db.query(query,[title,author,publisher,language,unit_price,bookId],function (err,rs){
            if (err) {
                return res.status(500).send(err);
            }
            // res.redirect('/admin_booklist.html');
            res.redirect(url.format({
                pathname:"/admin_booklist.html",
                dept:'IT'
            }))
            
        });
    },
    deleteBook: (req, res) => {
        let bookId = req.params.id;
        let deleteUserQuery = 'DELETE FROM product WHERE ISBN13 = "' + bookId + '"';
        db.query(deleteUserQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            // res.redirect('/admin_booklist.html');
            res.redirect(url.format({
                pathname:"/admin_booklist.html",
                dept:'IT'
            }))
        });
    }
};
console.log(module.exports); 
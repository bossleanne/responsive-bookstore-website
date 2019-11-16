-- CREATE NEW BOOKS
INSERT INTO product (ISBN13, title, type, publisher, release_date, language, description, length, file_size, unit_price, author, Genre_genre_id) 
VALUES ("9782525147298","Happy","E-read","Harper Publishing", "2019-01-01","English","Lorem",600,300,10.00,"Happy Lee",29);

-- READ BOOK
SELECT *
FROM product
WHERE ISBN13 = "9782525147290";

-- UPDATE BOOK
UPDATE product
SET title = "Happy You", unit_price = 11.00
WHERE ISBN13 = "9782525147290";

-- DELETE BOOK
DELETE FROM product
WHERE ISBN13 = "9782525147290";
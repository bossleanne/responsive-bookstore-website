SELECT c.last_login, c.email, p.title 
FROM myapp.customer c 
INNER JOIN myapp.orderdetail o ON c.email = o.Customer_email
INNER JOIN myapp.product p ON o.Product_ISBN13 = p.ISBN13
WHERE p.title LIKE '%Testaments%';
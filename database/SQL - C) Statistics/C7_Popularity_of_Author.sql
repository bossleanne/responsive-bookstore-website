SELECT COUNT(DISTINCT c.email) 
FROM myapp.customer c, myapp.orderdetail o, myapp.product p 
WHERE o.Customer_email = c.email AND o.Product_ISBN13 = p.ISBN13 AND p.author like '%Margaret%'
GROUP BY p.author
HAVING COUNT(p.ISBN13)>=1;
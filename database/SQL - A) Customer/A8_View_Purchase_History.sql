SELECT * FROM myapp.orderdetail o 
INNER JOIN myapp.product p ON o.Product_ISBN13 = p.ISBN13 
WHERE o.customer_email IN 
	(SELECT c.email FROM myapp.customer c 
		WHERE c.email like '%cantrell%');
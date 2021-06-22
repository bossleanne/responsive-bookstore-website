SELECT *
FROM customer c 
WHERE c.email = 'Dejesus@hotmail.com' and MONTH(c.birth_date) = MONTH(NOW()) ;
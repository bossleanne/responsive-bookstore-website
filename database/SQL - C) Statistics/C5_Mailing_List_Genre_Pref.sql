
-- customer who subscribed to marketing email and placed orders
CREATE VIEW mailing_list 
AS 
select 
	distinct cu.email as email, gen.genre_description as genre_preference from Genre gen, Product p,
	Customer cu, OrderDetail od
where 
	gen.genre_id = p.Genre_genre_id 
AND cu.subscribed = 1
AND cu.email = od.Customer_email
AND p.ISBN13 = od.Product_ISBN13

-- subscribed customers' genre preferences 
CREATE VIEW Customer_genre_preferences AS
SELECT email,GROUP_CONCAT(distinct genre_preference) as "genres"
FROM mailing_list
GROUP BY email;





















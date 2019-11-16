-- extract number of downloads by month
CREATE VIEW No_of_product_downloads_by_month
AS 
    SELECT
	EXTRACT(MONTH FROM od.datetime) AS Month,
	od.Product_ISBN13 AS Product_ID, 
    p.title AS Product_title,
    COUNT(od.order_id) as No_of_downloads
FROM 
	OrderDetail od, Product p 
WHERE 
	od.Product_ISBN13 = p.ISBN13
GROUP BY 
	Month, od.Product_ISBN13, p.title
ORDER BY 
	Month, No_of_downloads DESC;   





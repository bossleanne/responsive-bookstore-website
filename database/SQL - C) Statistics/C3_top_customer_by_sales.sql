-- top customer by sales
SELECT DISTINCT Customer_email, sum(unit_price) as total_sales
FROM OrderDetail
GROUP BY Customer_email
ORDER BY sum(unit_price) DESC
limit 10
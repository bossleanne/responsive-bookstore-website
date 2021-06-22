-- to return count of product based on genre
-- input: genre_id
-- output: count of product

DELIMITER $$
CREATE PROCEDURE sp_GetProductCountByGenre(
	IN Genre smallint(6), 
    OUT product_count INT 
)
BEGIN
SELECT
	count(ISBN13) INTO product_count
FROM product 
WHERE
	Genre_genre_id = Genre;
END$$

DELIMITER ;

-- to execute the stored procedure
CALL sp_GetProductCountByGenre('10', @product_count);
SELECT @product_count;
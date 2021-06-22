SELECT * FROM myapp.product 
WHERE CONCAT(TRIM(Title), ' ', TRIM(Author), ' ', TRIM(Language), ' ', TRIM(Type)) 
LIKE '%Sapiens%';
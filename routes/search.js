function search(req,res,call){
  var searchTitle = req.query.Title//title
  var author = req.query.author//author
  const language = req.query.language
  const type = req.query.type
  const rating = req.query.rating

  let query = "select * from product";
  if(searchTitle!= '' && author!=''){
    if(rating == ''){
      query = "select * from prodcut where author LIKE %='"+author+"' AND (title LIKE %+'"+searchTerm+"') AND language ='"+language+"' AND type = '"+type+"'";
    }
    else{
      query = "select * from prodcut where author LIKE %='"+author+"' AND (title LIKE %+'"+searchTerm+"') AND language ='"+language+"' AND type = '"+type+"' AND rating = '"+rating+"'";
    }  
  }
  else if(searchTitle!= '' && author==''){
    // query = "select * from prodcut where title LIKE %+'"+searchTitle+"'";
    if(rating == ''){
      query = "select * from prodcut where title LIKE %+'"+searchTitle+"' AND language ='"+language+"' AND type = '"+type+"'";
    }
    else{
      query = "select * from prodcut where title LIKE %+'"+searchTitle+"' AND language ='"+language+"' AND type = '"+type+"' AND rating = '"+rating+"'";
    }  
  }
  else if(searchTitle== '' && author!=''){
    // query = "select * from product where author LIKE %+'"+author+"'";
    if(rating == ''){
      query = "select * from product where author LIKE %+'"+author+"' AND language ='"+language+"' AND type = '"+type+"'";
    }
    else{
      query = "select * from product where author LIKE %+'"+author+"' AND language ='"+language+"' AND type = '"+type+"' AND rating = '"+rating+"'";
    }  
  }
}
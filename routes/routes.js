const express = require('express');
const app = express();
const models = require('../models/index');
const Book = models.Book;
const router = express.Router();
const Sequelize = require('sequelize')
const Op = Sequelize.Op;


const paginate = ({ page, pageSize }) => {
 const offset = page * pageSize
 const limit = offset + pageSize

 return {
   offset,
   limit,
 }
};

//Home page redirects to /books
router.get('/', (req, res, next) => {
  res.redirect("/books");
});

//shows the full list of books
router.get('/books/', (req, res, next) => {
  const offset = req.params.page * 5;
  Book.findAll().then(function(books){
    res.render("index", {books: books, title: "Books"});
  }).catch(function(err){
    res.sendStatus(500)
    console.error(err.stack)
  });
});

router.get('/books/search', (req, res) => {
  let { search } = req.query;
  search = search.toLowerCase();
  Book.findAll({
    where:{
      [Op.or]: [
        {
          title:{
            [Op.substring]: search
          }
        },
        {
          author:{
            [Op.substring]: search
          }
        },
        {
          genre:{
            [Op.substring]: search
          }
        },
        {
          year:{
            [Op.substring]: search
          }
        }
      ]
    }
  }).then(function(books){
    if(books.length > 0){
    res.render('index', {books: books, title:'Search Results'})
  } else {
    res.render('index', {books: books, title:'Search Results', noResults: "Your search did not return any results!"})
  }
  }).catch(function(err){
    res.sendStatus(500);
    console.error(err.stack)
  })
});

//shows create new book form
router.get('/books/new', (req, res) => {
  res.render('new-book', {book: Book.build(), title: "New Book", action: '/books/new', value: 'Create Book'})
});

//posts new book to DB
router.post('/books/new', (req, res) => {
    return Book.create(req.body).then(function(book){
      res.redirect('/');
  }).catch(function(err){
    if(err.name === "SequelizeValidationError"){
      res.render('new-book', {book: Book.build(req.body),
                              title: "New Book",
                              action: '/books/new',
                              value: 'Create Book',
                              errors: err.errors})

    } else {
      throw err;
    }
  }).catch(function(err){
    res.sendStatus(500)
    console.error(err.stack)
  });
});

//Shows book detail form
router.get('/book/:id', (req, res) => {
    Book.findByPk(req.params.id).then(function(book){
      if(book){
        res.render("update-book", {book: book, title: book.title, action: `/book/${book.id}`, value: 'Update Book'});
      }else{
        res.status(404).render('server-error');
        console.log(`${res.statusCode} -- I'm sorry! Our Application seems to have an error.`);
      }
    }).catch(function(err){
      res.status(500)
      console.error(err.stack)
    });
});

//Updates book info in DB
router.post('/book/:id', (req, res) => {
  Book.findByPk(req.params.id).then(function(book) {
    if(book){
      return book.update(req.body);
    }else{
      res.sendStatus(404);
    }
  }).then(function(){
    res.redirect("/");
  }).catch(function(err){
    if(err.name === "SequelizeValidationError"){
      const book = Book.build(req.body);
      book.id = req.params.id;
      res.render("update-book", {book: book,
                                title: book.title,
                                action: `/book/${book.id}`,
                                value: 'Update Book',
                                errors: err.errors});
    } else {
      throw err;
    }
  }).catch(function(err){
    res.sendStatus(500)
    console.error(err.stack)
  });
});

//Deletes book from database PERMANENT
router.post('/book/:id/delete', (req, res) => {
  Book.findByPk(req.params.id).then(function(book) {
    if(book){
      return book.destroy();
    }else{
      res.sendStatus(404);
    }
  }).then(function(){
    res.redirect("/");
  }).catch(function(err){
    res.sendStatus(500)
    console.error(err.stack)
  });
});

router.get('*', (req, res) =>{
  res.status(404).render('page-not-found');
});

module.exports = router;

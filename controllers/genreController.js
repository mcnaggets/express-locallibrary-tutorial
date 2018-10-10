const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

let Genre = require('../models/genre');
let Book = require('../models/book');
let async = require('async');
let mongoose = require('mongoose');

// Display list of all Genre.
exports.genre_list = function (req, res, next) {

    Genre.find()
        .sort('name')
        .exec(function (err, list_genres) {
            if (err) return next(err);
            //Successful, so render
            res.render('genre_list', {title: 'Genre List', genre_list: list_genres});
        });

};

// Display detail page for a specific Genre.
exports.genre_detail = function (req, res, next) {
    let id = mongoose.Types.ObjectId(req.params.id);
    async.parallel({
        genre: function (callback) {
            Genre.findById(id).exec(callback);
        },
        genre_books: function (callback) {
            Book.find({'genre': id}).exec(callback);
        }
    }, function (err, results) {
        if (err) return next(err);
        if (results.genre == null) { // No results.
            let err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('genre_detail', {title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books});
    });

};

// Display Genre create form on GET.
exports.genre_create_get = function (req, res, next) {
    res.render('genre_form', {title: 'Create Genre'});
};

// Handle Genre create on POST.
exports.genre_create_post = [

    // Validate that the name field is not empty.
    body('name', 'Genre name required').isLength({min: 1}).trim(),

    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data.
        let genre = new Genre(
            {name: req.body.name}
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('genre_form', {title: 'Create Genre', genre: genre, errors: errors.array()});
            return;
        }
        // Data from form is valid.
        // Check if Genre with same name already exists.
        Genre.findOne({'name': req.body.name}).exec(function (err, found_genre) {
            if (err) return next(err);

            if (found_genre) {
                // Genre exists, redirect to its detail page.
                res.redirect(found_genre.url);
                return;
            }

            genre.save(function (err) {
                if (err) return next(err);
                // Genre saved. Redirect to genre detail page.
                res.redirect(genre.url);
            });
        });
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res, next) {

    async.parallel({
        genre: function (callback) {
            Genre.findById(req.params.id).exec(callback)
        },
        genre_books: function (callback) {
            Book.find({'genre': req.params.id}).exec(callback)
        },
    }, function (err, results) {
        if (err) return next(err);
        if (results.genre == null) { // No results.
            res.redirect('/catalog/genres');
        }
        // Successful, so render.
        res.render('genre_delete', {
            title: 'Delete Genre',
            genre: results.genre,
            genre_books: results.genre_books
        });
    });

};

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res, next) {

    async.parallel({
        genre: function (callback) {
            Genre.findById(req.body.genreid).exec(callback)
        },
        genre_books: function (callback) {
            Book.find({'genre': req.body.genreid}).exec(callback)
        },
    }, function (err, results) {
        if (err) return next(err);
        // Success
        if (results.genre_books.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render('genre_delete', {
                title: 'Delete Genre',
                genre: results.genre,
                genre_books: results.genre_books
            });
            return;
        }
        // Author has no books. Delete object and redirect to the list of genres.
        Genre.findByIdAndRemove(req.body.genreid, function (err) {
            if (err) return next(err);
            // Success - go to genre list
            res.redirect('/catalog/genres')
        })
    });
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};
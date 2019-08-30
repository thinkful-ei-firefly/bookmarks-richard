'use strict';

const path = require('path');
const express = require('express');
const xss = require('xss');
const jsonParser = express.json();
const BookmarksService= require('./bookmarks-service');

const bookmarksRouter = express.Router();


const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title), //sanatize title
    url: xss(bookmark.url), //sanitize url
    description: xss(bookmark.description), //sanitize description
    rating: xss(bookmark.rating), //sanitize rating
});

bookmarksRouter

    .route('/bookmarks')

    .get((req, res, next) => {
        BookmarksService.getAllBookmarks(req.app.get('db'))
            .then(articles => {
                res.json(articles);
            })
            .catch(next);
    })

    .post(jsonParser, (req, res, next) => {
        const { title, url, description, rating } = req.body;
        const newBookmark = { title, url, description, rating };

        for (const field of ['title', 'url', 'description', 'rating']) {
            if (!req.body[field]) {
                return res.status(400).json({
                    error: { message: `Missing '${field}' in request body.` }
                });
            }
        }
        BookmarksService.insertBookmark(
            req.app.get('db'),
            newBookmark
        )
            .then(article => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${article.id}`))
                    .json(article);
            })
            .catch(next);
    });

bookmarksRouter

    .route('/bookmarks/:bookmarkId')

    .all( (req, res, next) => {
        BookmarksService.getById(
            req.app.get('db'),
            req.params.bookmarkId
        )
            .then(bookmark => {
                if(!bookmark) {
                    return res.status(404).json({
                        error: { message: `Bookmark doesn't exist` } // eslint-disable-line quotes
                    });
                }
                res.bookmark = bookmark;
                next();
            })
            .catch(next);
    })
    
    .get( (req, res, next) => { // eslint-disable-line no-unused-vars
        res
            .json(serializeBookmark(res.bookmark));
    })

    .delete( (req, res, next) => {
        BookmarksService.deleteBookmark(
            req.app.get('db'),
            req.params.bookmarkId
        )
            .then(() => {
                res.status(204).end();
            })
            .catch(next);
    })

    .patch(jsonParser, (req, res, next) => {
        
        const { title, url, description, rating } = req.body;
        
        const bookmarkToUpdate = { title, url, description, rating };

        const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean).length;
        if(numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'title', 'url', 'description', or 'rating'.`  // eslint-disable-line quotes
                }
            });
        }

        BookmarksService.updateBookmark(
            req.app.get('db'),
            req.params.bookmarkId,
            bookmarkToUpdate
        )
            .then( () => {
                res.status(204).end();
            })
            .catch(next);
    });


module.exports = bookmarksRouter;
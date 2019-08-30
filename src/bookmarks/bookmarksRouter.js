'use strict';
const express = require('express');
const xss = require('xss');
const jsonParser = express.json();
const { isWebUri } = require('valid-url');
const uuid = require('uuid/v4');
// const logger = require('../logger');
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
                    .location(`/bookmarks/${article.id}`)
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
                        error: { message: `Bookmark doesn't exist` }
                    });
                }
                res.bookmark = bookmark;
                next();
            })
            .catch(next);
    })

    .get( (req, res, next) => {
        res.json(serializeBookmark(res.bookmark));
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
    });


module.exports = bookmarksRouter;
'use strict';
const express = require('express');
const jsonParser = express.json();
const { isWebUri } = require('valid-url');
const uuid = require('uuid/v4');
const logger = require('../logger');
const store = require('../../test/store');
const BookmarksService= require('./bookmarks-service');

const bookmarksRouter = express.Router();

let bookmarks = store.bookmarks;

bookmarksRouter
    .route('/bookmarks')
    .get((req, res, next) => {
        BookmarksService.getAllBookmarks(req.app.get('db'))
            .then(articles => {
                res.json(articles);
            })
            .catch(next);
    })
    .post(jsonParser, (req, res) => {
        //destructure req data
        const { title, url, desc, rating } = req.body;
        //validate title data
        if(!title) {
            return res
                .status(400)
                .send('The title is required.');
        }
        if(title.length < 2, title.length > 20) {
            return res
                .status(400)
                .send('The title must be between 2 and 20 characters.');
        }
        //validate url
        if(!url) {
            return res
                .status(400)
                .send('A url is required.');
        }
        if(!isWebUri(url)) {
            return res
                .status(400)
                .send('The url must be a valid url.');
        }
        //validate desc
        if(!desc) {
            return res
                .status(400)
                .send('The description is required.');
        }
        if(desc.length < 8 || desc.length > 60) {
            return res
                .status(400)
                .send('The description must be between 8 and 60 characters.');
        }
        //validate rating
        if(!rating) {
            return res
                .status(400)
                .send('Rating is required.');
        }
        
        const ratingMustBe = [1, 2, 3, 4, 5];

        if(!ratingMustBe.includes(parseInt(rating))) {
            return res
                .status(400)
                .send('Rating must be one of "1", "2", "3", "4", or "5".');
        }

        //add the new bookmark to bookmarks
        const id = uuid();

        const newBookmark = {
            id,
            title, 
            url, 
            desc, 
            rating,
        };

        bookmarks.push(newBookmark);

        return res
            .status(201)
            .send(newBookmark);
    });

bookmarksRouter
    .route('/bookmarks/:id')
    .get( (req, res, next) => {
        BookmarksService.getById(req.app.get('db'), req.params.id)
            .then(article => {
                res.json(article);
            })
            .catch(next);
    })
    .delete( (req, res) => {
        const bookmarkId = req.params.id;
        //validate the bookmark id
        const removed = bookmarks.filter(obj => obj.id === bookmarkId);
        if(removed.length === 0) {
            return res
                .status(400)
                .send('Bookmark does not exist');
        }
        //remove bookmark from bookmarks
        bookmarks = bookmarks.filter(obj => obj.id !== bookmarkId);
        return res
            .send(bookmarkId);
    });

module.exports = bookmarksRouter;
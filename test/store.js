'use strict';

const uuid = require('uuid/v4');

const bookmarks = [
    {
        id: uuid(),
        title: 'Google',
        url: 'https://www.google.com',
        description: 'Search for anything.',
        rating: 5
    },
    {
        id: uuid(),
        title: 'Thinkful',
        url: 'https://www.thinkful.com',
        description: 'Software Engineering bootcamps.',
        rating: 5
    },
    {
        id: uuid(),
        title: 'Wikipedia',
        url: 'https://www.wikipedia.com',
        description: 'Wiki for anything.',
        rating: 5
    }
];

module.exports = { bookmarks };
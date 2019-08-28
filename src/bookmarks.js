
const express = require('express');

let bookmarks = [
    {
        "id": "28aa3191-5a16-4767-b02c-77b66fd48664",
        "title": "Google",
        "url": "http://google.com",
        "desc": "An indie search engine startup",
        "rating": 4
      },
      {
        "id": "1cfae07c-653a-4a7e-8aaa-47a5a2ac2d28",
        "title": "Fluffiest Cats in the World",
        "url": "http://medium.com/bloggerx/fluffiest-cats-334",
        "desc": "The only list of fluffy cats online",
        "rating": 5
      }
];

module.exports = bookmarks;
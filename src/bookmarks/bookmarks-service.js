'use strict';

const BookmarksService = {
    getAllBookmarks(knex) {
        return knex
            .select('*')
            .from('bookmarks');
    },
    getById(knex, id) {
        return knex
            .from('bookmarks')
            .select('*')
            .where('id', id)
            .first();
    },
    insertBookmark(knex, newArticle) {
        return knex
            .insert(newArticle)
            .into('bookmarks')
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },
    updateBookmark(knex, id, newBookmarkFields) {
        return knex('bookmarks')
            .where({ id })
            .update(newBookmarkFields);
    },
    deleteBookmark(knex, id) {
        return knex('bookmarks')
            .where({ id })
            .delete();
    },
};


// const ArticlesService = {
    
//     updateArticle(knex, id, newArticleFields) {
//         return knex('blogful_articles')
//             .where({ id })
//             .update(newArticleFields);
//     }

module.exports = BookmarksService;
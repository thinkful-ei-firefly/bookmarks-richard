'use strict';

require('dotenv').config();
const knex = require('knex');

const app = require('../src/app');

describe('Bookmarks Endpoints', () => {

    let db;

    const testBookmarks = [
        {
            id: 1,
            title: 'Thinkful',
            url: 'https://www.thinkful.com',
            description: 'Think outside the classroom',
            rating: '5',
        },
        {
            id: 2,
            title: 'Google',
            url: 'https://www.google.com',
            description: 'Where we find everything else',
            rating: '4',
        },
        {
            id: 3,
            title: 'MDN',
            url: 'https://developer.mozilla.org',
            description: 'The only place to find web documentation',
            rating: '5',
        },
    ];

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        });
        
        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('cleanup the table', () => db('bookmarks').truncate());

    afterEach('cleanup', () => db('bookmarks').truncate());

    describe('GET, /api/bookmarks', () => {

        context('Given there are bookmarks in the database', () => {

            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks);
            });
    
            it('Responds with 200 and all of the bookmarks', () => {
                return supertest(app)
                    .get('/api/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_Token}`)
                    .expect(200, testBookmarks);
            });
        });
    });

    describe('GET, /api/bookmarks/:bookmakId', () => {

        context('Given there are bookmarks in the database', () => {

            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks);
            });

            it('GET /api/bookmarks/:bookmark_id responds with 200 and the specified article', () => {
                const bookmarkId = 2;
                const expectedbookmark = testBookmarks[bookmarkId - 1];
                return supertest(app)
                    .get(`/api/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_Token}`)
                    .expect(200, expectedbookmark);
            });
        });
    });

    context('POST /api/bookmarks', () => {
        
        it('creates a bookmark, responding with 201 and the new bookmark', () => {
            
            const newArticle = {
                title: 'Thinkful',
                url: 'https://www.thinkful.com',
                description: 'Think outside the classroom',
                rating: '5'
            };

            return supertest(app)
                .post('/api/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_Token}`)
                .send(newArticle)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newArticle.title);
                    expect(res.body.url).to.eql(newArticle.url);
                    expect(res.body.description).to.eql(newArticle.description);
                    expect(res.body.rating).to.eql(newArticle.rating);
                    expect(res.body).to.have.property('id');
                    expect(res.headers.location).to.equal(`/api/bookmarks/${res.body.id}`);
                })
                .then(postRes => {
                    supertest(app)
                        .get(`/api/bookmarks/${postRes.body.id}`)
                        .expect(postRes.body);
                });
        });

        it('responds with 400 and an error message when the title is missing', () => {
            return supertest(app)
                .post('/api/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_Token}`)
                .send({
                    // title: 'Thinkful',
                    url: 'https://www.thinkful.com',
                    description: 'Think outside the classroom',
                    rating: '5'
                })
                .expect(400, {
                    error: { message: `Missing 'title' in request body.` } // eslint-disable-line quotes
                });
        });

        it('responds with 400 and an error message when the url is missing', () => {
            return supertest(app)
                .post('/api/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_Token}`)
                .send({
                    title: 'Thinkful',
                    // url: 'https://www.thinkful.com',
                    description: 'Think outside the classroom',
                    rating: '5'
                })
                .expect(400, {
                    error: { message: `Missing 'url' in request body.` } // eslint-disable-line quotes
                });
        });

        it('responda with 400 and an error message when the description is missing', () => {
            return supertest(app)
                .post('/api/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_Token}`)
                .send({
                    title: 'Thinkful',
                    url: 'https://www.thinkful.com',
                    // description: 'Think outside the classroom',
                    rating: '5'
                })
                .expect(400, {
                    error: { message: `Missing 'description' in request body.` } // eslint-disable-line quotes
                });
        });

        it('responds with 400 and an error message when the rating is missing', () => {
            return supertest(app)
                .post('/api/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_Token}`)
                .send({
                    title: 'Thinkful',
                    url: 'https://www.thinkful.com',
                    description: 'Think outside the classroom',
                    // rating: '5'
                })
                .expect(400, {
                    error: { message: `Missing 'rating' in request body.` } // eslint-disable-line quotes
                });
        });
    });

    describe('DELETE /api/bookmarks/:bookmarkId', () => {

        context('Given there is data in bookmarks', () => {
        
            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks);
            });
    
            it('responds with 204 and removes the bookmark', () => {
    
                const idToRemove = 2;
    
                const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove);
                return supertest(app)
                    .delete(`/api/bookmarks/${idToRemove}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(204)
                    .then(() => {
                        supertest(app)
                            .get('/api/bookmarks')
                            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                            .expect(expectedBookmarks);
                    });
            });
        });
    
        context('Given no bookmarks', () => {
            it('responds with 404', () => {
                
                const bookmarkId = 1234567890;
    
                return supertest(app)
                    .delete(`/api/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, {
                        error: { message: `Bookmark doesn't exist`} // eslint-disable-line quotes
                    });
    
            });
        });
    });
    

    describe('PATCH /api/bookmarks/;bookmarkId', () => {
        
        context('Given no articles', () => {

            it('responds with 404', () => {
                
                const bookmarkId = 1234567890;

                return supertest(app)
                    .patch(`/api/bookmarks/${bookmarkId}`)
                    .set('Authorization', `Bearer ${process.env.API_Token}`)
                    .expect(404, {error: { message: `Bookmark doesn't exist` }}); // eslint-disable-line quotes
            });
        });

        context('Given there are bookmarks in the database', () => {

            beforeEach('insert bookmarks', () => {
                return db 
                    .into('bookmarks')
                    .insert(testBookmarks);
            });

            it('responds with 204 and updates the bookmark', () => {
                
                const idToUpdate = 2;
                
                const updateBookmark = {
                    title: 'An Updated title',
                    url: 'https://update-url.com',
                    description: 'A new description goes here.',
                    rating: '2',
                };
                
                const expectedBookmark = {
                    ...testBookmarks[idToUpdate -1], 
                    ...updateBookmark
                }
                
                return supertest(app)
                    .patch(`/api/bookmarks/${idToUpdate}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send(updateBookmark)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/articles/${idToUpdate}`)
                            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                            .expect(expectedBookmark);
                    });
            });

            it('responds with 400 when no required fields supplied', () => {
                const idToUpdate = 2;
                return supertest(app)
                    .patch(`/api/bookmarks/${idToUpdate}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send({ irrelevnetField: 'foo' })
                    .expect(400, {
                        error: {
                            message: `Request body must contain either 'title', 'url', 'description', or 'rating'.`
                        }
                    });
            });

            it('responds with 204 when updating only a subset of fields', () => {
                
                const idToUpdate = 2;

                const updateBookmark = {
                    title: 'A Updated Title - only updated field'
                }

                const expectedBookmark = {
                    ...testBookmarks[idToUpdate -1],
                    ...updateBookmark
                }

                return supertest(app)
                    .patch(`/api/bookmarks/${idToUpdate}`)
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .send({
                        ...updateBookmark,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/bookmarks/${idToUpdate}`)
                            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                            .expect(expectedBookmark)
                    });
            });

        });
    });

    context('Given an XSS attack article', () => {

        const maliciousArticle = {
            id: 911,
            title: 'Naughty naughty very naughty <script>alert("xss");</script>',
            url: 'https://www.Thinkful.com',
            description: 'Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.',
            rating: '1'
        };

        beforeEach('insert malicious article', () => {
            return db
                .into('bookmarks')
                .insert([ maliciousArticle ]);
        });

        it('removes XSS attack content', () => {
            return supertest(app)
                .get(`/api/bookmarks/${maliciousArticle.id}`)
                .set('Authorization', `Bearer ${process.env.API_Token}`)
                .expect(200)
                .expect(res => {
                    expect(res.body.title).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;');  // eslint-disable-line no-useless-escape
                    expect(res.body.url).to.eql('https://www.Thinkful.com');
                    expect(res.body.description).to.eql('Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.');
                    expect(res.body.rating).to.eql('1');
                });
        });
    });
});



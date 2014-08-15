
var ThinkORM = require('./lib');

// Or new ThinkORM('mysql://username:passwd@localhost:3306/DbName#utf8')
var models = new ThinkORM({
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'example'
});

// will create a mapper from example table.
var Post = models('Post');


// select posts from example.post table with id and title fields.
// sql: SELECT `id`, `title` FROM `post` WHERE `id` < 3 ORDER BY `id` DESC;
// [{id: 1, title: 'a'}, {id: 2, title: 'b'}]
Post.field(['id', 'title']).where({ id: { 'lt': 3 } })
                           .order('`id` desc')
                           .select()
                           .then(function(posts) {
                               console.log(posts);
                           });

Post.create({title: 'hello'}).add().then(function(newPost) {
    console.log('insert success.');
}).catch(function(err) {
    console.log(err);
});

Post.where({title: 'hello'}).save({title: 'world'}).then(function(post) {
    console.log('update success.');
}).catch(function(err) {
    console.log(err);
});

Post.delete({title: 'hello'}).then(function(oldPost) {
    console.log('delete success.');
}).catch(function(err) {
    console.log(err);
});

ThinkORM —— 基于Node.js的简单、易容、强大的ORM工具。
==========

# 概述 #

基于Node.js编写的一个简单，易用，强大的ORM工具（目前只支持Mysql），想法来源于**ThinkPHP**的模型层。

## 简单的例子 ##

```Javascript
var ThinkORM = require('think-orm');
var ORM = new ThinkORM({
    dbType   : 'mysql',
    host     : 'localhost',
    port     : 3306,
    username : 'root',
    password : 'test',
    database : 'test',
    prefix   : 'easy_',
    charset  : 'utf8'
});

var User = ThinkORM.model('user');

// sql: SELECT * FROM `user` ORDER BY id DESC LIMIT 5
User.order('id DESC').limit(5).select().then(function(users) {
    // [{id: 1, name: '...'}, {id: 2, name: '....'}, ...]
    console.log(users);
});
```

# 安装 #

```
npm install think-orm
```

# 文档 #

## 设计理念 ##

ThinkORM名字中带有'ORM'三个字母，可能大家会误以为其和传统ORM的设计思路相似，只是换了一层接口而已。其实，ThinkORM的设计思路和传统ORM的设计思路还是有比较大的区别的，这里就来说明ThinkORM的不同之处。

模型映射到一张表，对模型的操作就是直接对数据表进行操作。数据表中的一条记录不映射到一个对象上，在ThinkORM中没有这样的概念，数据表中的记录都只映射为javascript中的一个普通对象。

## 连接数据库 ##

## 模型定义 ##

## 链式操作 ##

## CRUD操作 ##

### 数据创建 ###

```Javascript
Post.create({title: 'hello'}).then(function(post) {
    console.log(post);
}).otherwise(function(err) {
    console.log(err);
});
```

### 数据写入 ###

```Javascript
Post.create({title: 'hello'}).then(function(post) {
    return Post.add(post);
}).then(function(newPost) {
    console.log('insert success.');
}).otherwise(function(err) {
    console.log(err);
});
```

### 数据读取 ###

```Javascript
// select posts from example.post table with id and title fields.
// sql: SELECT `id`, `title` FROM `post` WHERE `id` < 3 ORDER BY `id` DESC;
// [{id: 1, title: 'a'}, {id: 2, title: 'b'}]
Post.field(['id', 'title']).where({ id: { 'lt': 3 } })
                           .order('`id` desc')
                           .select()
                           .then(function(posts) {
                               console.log(posts);
                           });
```

### 数据更新 ###

```Javascript
Post.where({title: 'hello'}).save({title: 'world'}).then(function(post) {
    console.log('update success.');
}).catch(function(err) {
    console.log(err);
});
```

### 数据删除 ###

```Javascript
Post.delete({title: 'hello'}).then(function(oldPost) {
    console.log('delete success.');
}).catch(function(err) {
    console.log(err);
});
```

## 数据查询 ##

## 数据验证 ##

## 数据填充 ##

## 字段映射 ##

## 视图模型 ##

## 关联模型 ##

# TODO #

* [ ] 众多文档，功能和测试

## License ##

(The MIT License)

Copyright (c) 2014 happen-zhang <zhanghaipeng404@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

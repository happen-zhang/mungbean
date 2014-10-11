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

ThinkORM可以支持以字符串或者对象为条件的查询参数。但大多数情况下，使用对象查询参数会比较安全。

### 字符串条件 ###

这是最简单的查询方式，但由于字符串中可能包含不安全字符，所以需要进行一些安全性的考虑。下面就是一个简单的例子：

```Javascript
// SELECT * FROM `user` WHERE (age >= 20 AND status = 1)
User.where('age >= 20 AND status = 1').select().then(function(users) {
    console.log(users);
});
```

> ThinkORM在对字符串条件查询时进行了对不安全字符的过滤，但建议用户在使用字符串查询时先进行必要的过滤。

### 对象查询条件 ###

这是最常用的查询方式，例如：

```Javascript
var conditions = {
    name: 'thinkorm',
    age: 12,
    status: 0
};

// SELECT * FROM `user` WHERE `name` = 'thinkorm' AND `age` = 12 AND `status` = 0
User.where(conditions).select().then(function(users) {
    console.log(users);
});
```

多个字段间的默认逻辑是使用`AND`的，如果需要使用`OR`的话，可以在对象查询条件中定义一个`_logic`键，比如：

```Javascript
var conditions = {
    name: 'thinkorm',
    age: 12,
    status: 0,
    _logic: 'OR'
};

// SELECT * FROM `user` WHERE `name` = 'thinkorm' OR `age` = 12 OR `status` = 0
User.where(conditions).select().then(function(users) {});
```

在使用对象查询条件时，ThinkORM会自动检查字段的有效性。如果对象中定义的查询字段在表中不存在，ThinkORM则会把无效的字段过滤掉，例如：

```Javascript
var conditions = {
    name: 'thinkorm',
    test: 'hello'
};

// SELECT * FROM `user` WHERE `name` = 'thinkorm'
User.where(conditions).select().then(function(users) {});
```

上面`conditions`对象中的`test`字段在表中不存在，那么`test`字段将被视作为无效条件过滤掉。

> 如果在调试（debug）模式下，无效字段将会导致查询抛出异常，而不是静默地过滤无效字段。

使用对象查询条件比字符串查询条件更加方便和安全，推荐使用对象来作为查询条件。

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

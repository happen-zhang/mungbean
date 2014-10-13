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

## 索引 ##

* [设计理念](#%E8%AE%BE%E8%AE%A1%E7%90%86%E5%BF%B5)
* [连接数据库](#%E8%BF%9E%E6%8E%A5%E6%95%B0%E6%8D%AE%E5%BA%93)
* [连贯操作](#%E8%BF%9E%E8%B4%AF%E6%93%8D%E4%BD%9C)
    * [where](#where)
    * [table](#table)
    * [alias](#alias)
* [CRUD操作](#crud%E6%93%8D%E4%BD%9C)
    * [数据创建](#%E6%95%B0%E6%8D%AE%E5%88%9B%E5%BB%BA)
    * [数据写入](#%E6%95%B0%E6%8D%AE%E5%86%99%E5%85%A5)
    * [数据读取](#%E6%95%B0%E6%8D%AE%E8%AF%BB%E5%8F%96)
    * [数据更新](#%E6%95%B0%E6%8D%AE%E6%9B%B4%E6%96%B0)
    * [数据删除](#%E6%95%B0%E6%8D%AE%E5%88%A0%E9%99%A4)
* [数据查询](#%E6%95%B0%E6%8D%AE%E6%9F%A5%E8%AF%A2)
    * [查询方式](#%E6%9F%A5%E8%AF%A2%E6%96%B9%E5%BC%8F)
        * [字符串条件](#%E5%AD%97%E7%AC%A6%E4%B8%B2%E6%9D%A1%E4%BB%B6)
        * [对象条件](#%E5%AF%B9%E8%B1%A1%E6%9D%A1%E4%BB%B6)
    * [查询表达式](#%E6%9F%A5%E8%AF%A2%E8%A1%A8%E8%BE%BE%E5%BC%8F)
        * [EQ](#eq%E7%AD%89%E4%BA%8E)
        * [NEQ](#neq%E4%B8%8D%E7%AD%89%E4%BA%8E)
        * [GT](#gt%E5%A4%A7%E4%BA%8E)
        * [EGT](#egt%E5%A4%A7%E4%BA%8E%E7%AD%89%E4%BA%8E)
        * [LT](#lt%E5%B0%8F%E4%BA%8E)
        * [ELT](#elt%E5%B0%8F%E4%BA%8E%E7%AD%89%E4%BA%8E)
        * [[NOT]LIKE](#notlike%E6%A8%A1%E7%B3%8A%E6%9F%A5%E8%AF%A2)
        * [[NOT]BETWEEN](#notbetween%E5%8C%BA%E9%97%B4%E6%9F%A5%E8%AF%A2)
        * [[NOT]IN](#notin-in%E6%9F%A5%E8%AF%A2)
        * [EXP](#exp%E6%9F%A5%E8%AF%A2%E8%A1%A8%E8%BE%BE%E5%BC%8F)
    * [快捷查询](#%E5%BF%AB%E6%8D%B7%E6%9F%A5%E8%AF%A2)
    * [区间查询](#%E5%BF%AB%E6%8D%B7%E6%9F%A5%E8%AF%A2)
    * [组合查询](#%E7%BB%84%E5%90%88%E6%9F%A5%E8%AF%A2)
        * [字符串模式查询](#%E5%AD%97%E7%AC%A6%E4%B8%B2%E6%A8%A1%E5%BC%8F%E6%9F%A5%E8%AF%A2)
        * [请求字符串查询](#%E8%AF%B7%E6%B1%82%E5%AD%97%E7%AC%A6%E4%B8%B2%E6%9F%A5%E8%AF%A2)
        * [复合查询](#%E5%A4%8D%E5%90%88%E6%9F%A5%E8%AF%A2)
    * [统计查询](#%E7%BB%9F%E8%AE%A1%E6%9F%A5%E8%AF%A2)
        * [count](#count)
        * [max](#max)
        * [min](#min)
        * [avg](#avg)
        * [sum](#sum)
    * [SQL查询](#sql%E6%9F%A5%E8%AF%A2)
        * [query](#query%E6%96%B9%E6%B3%95)
        * [execute](#execute%E6%96%B9%E6%B3%95)
    * [字段查询](#%E5%AD%97%E6%AE%B5%E6%9F%A5%E8%AF%A2)
        * [getBy](#getby%E6%A0%B9%E6%8D%AE%E5%AD%97%E6%AE%B5%E5%80%BC%E6%9F%A5%E8%AF%A2%E6%95%B0%E6%8D%AE)
        * [getFieldBy](#getfieldby%E6%A0%B9%E6%8D%AE%E5%AD%97%E6%AE%B5%E5%80%BC%E6%9F%A5%E8%AF%A2%E5%B9%B6%E8%BF%94%E5%9B%9E%E6%9F%90%E4%B8%AA%E5%AD%97%E6%AE%B5%E7%9A%84%E5%80%BC)
    * [子查询](#%E5%AD%90%E6%9F%A5%E8%AF%A2)
        * [select](#select)
        * [buildSql](#buildsql)
* [数据验证](#%E6%95%B0%E6%8D%AE%E9%AA%8C%E8%AF%81)
* [数据填充](#%E6%95%B0%E6%8D%AE%E5%A1%AB%E5%85%85)
* [字段映射](#%E5%AD%97%E6%AE%B5%E6%98%A0%E5%B0%84)
* [试图模型](#%E8%A7%86%E5%9B%BE%E6%A8%A1%E5%9E%8B)
* [关联模型](#%E5%85%B3%E8%81%94%E6%A8%A1%E5%9E%8B)

## 设计理念 ##

ThinkORM名字中带有'ORM'三个字母，可能大家会误以为其和传统ORM的设计思路相似，只是换了一层接口而已。其实，ThinkORM的设计思路和传统ORM的设计思路还是有比较大的区别的，这里就来说明ThinkORM的不同之处。

模型映射到一张表，对模型的操作就是直接对数据表进行操作。数据表中的一条记录不映射到一个对象上，在ThinkORM中没有这样的概念，数据表中的记录都只映射为javascript中的一个普通对象。

## 连接数据库 ##

## 模型定义 ##

## 连贯操作 ##

ThinkORM模型提供连贯操作方法（也可以称作链式操作），它可以有效的提高数据存取的代码清晰度和开发效率，并且支持所有的CRUD操作。

连贯操作的使用也比较简单， 假如我们现在要查询一个`User`表的满足`status`值为1的前10条记录，并希望按照`created_at`排序 ，代码如下：

```Javascript
// SELECT * FROM `user` WHERE `status` = 1 ORDER BY created_at DESC LIMIT 10
User.where({ status: 1 }).order('created_at DESC').limit(10).select().then(function(users) {
    console.log(users);
});
```

这里的`where`、`order`和`limit`方法就被称之为连贯操作方法，除了`select`方法必须放到最后一个外（因为`select`方法并不是连贯操作方法，它返回的时一个`Promise`）。连贯操作的方法调用顺序没有先后，例如，下面的代码和上面的等效：

```Javascript
User.order('created_at DESC').limit(10).where({ status: 1 }).select().then(function(users) {
    console.log(users);
});
```

如果不习惯使用连贯操作的话，还支持直接使用参数进行查询的方式。例如上面的代码可以改写为：

```Javascript
User.select({where: { status: 1 }, order: 'created_at DESC', limit: 10}).then(function(users) {
    console.log(users);
});
```

使用上面方式取代连贯查询的话，键的名称就是连贯操作的方法名称。其实不仅仅是查询方法可以使用连贯操作，包括所有的CRUD方法都可以使用，例如：

```Javascript
// SELECT `id`,`name`,`age` FROM `user` WHERE (id = 1) LIMIT 1
User.where('id = 1').field('id, name, age').find().then(function(user) {});

// UPDATE `user` SET `name`='hello' WHERE `name` LIKE 'orm'
User.where({ name: { like: 'orm' } }).save({ name: 'hello' }).then(function(result) {});
```

连贯操作通常只有一个参数，并且仅在当此查询或者操作有效，完成后会自动清空连贯操作的所有传值（有个别特殊的连贯操作有多个参数，并且会记录当前的传值）。简而言之，连贯操作的结果不会带入以后的查询。

系统支持的连贯操作方法有：

| 方法名  | 作用 | 参数类型 |
| ------ | --- | ------- |
| where  | 查询或者更新条件的定义 | String，Array，Object |
| table  | 定义要操作的数据表名称 | String，Array |
| alias  | 定义当前表的别名      | String |
| data   | 新增或者更新数据之前有效的数据对象 | Object |
| field  | 定义查询或者更新需要的字段（支持字段排除） | String，Array |
| order  | 定义结果排序 | String，Object |
| limit  | 定义返回查询结果的数量 | String，Number |
| page   | 定义分页查询 | String，Number |
| group  | 对查询group支持 | String |
| having | 对查询having支持 | String |
| join   | 对查询join支持 | String，Object |
| union  | 对查询union支持 | String，Object |
| distinct | 对查询distinct支持 | Boolean |
| lock   | 对查询having支持 | Boolean |
| cache  |                |         |
| relation | 启用关联查询 | String |
| validate | 数据自动验证 | Object |
| auto | 数据自动完成 | Object |
| filter | 数据过滤 | String |
| scope | 命名范围 | String，Object |
| comment | SQL注释 | String |
| index | 数据索引 | String |

> 所有的连贯操作都返回当前的模型实例对象（this），其中where，join，union，scope方法支持多次调用。

### where ###

`where`方法的是进行条件查询最常用的方法了，基本上所有带条件的查询都需要调用到`where`方法。它可以完成包括普通查询、表达式查询、快捷查询、区间查询、组合查询在内的查询操作。`where`方法的参数支持字符串和对象，但大部分情况下建议使用对象参数。

#### 字符串参数 ####

```Javascript
// SELECT * FROM `user` WHERE (status=1 AND score>10)
User.where('status=1 AND score>10').select().then(function(users) {});
```

使用字符串条件的时候，可以配合预处理机制，例如：

```Javascript
// SELECT * FROM `user` WHERE (id=1 AND name like 'orm')
User.where('id=%d AND name LIKE %s', 1, 'orm').select().then(function(users) {});
```

或者：

```Javascript
User.where('id=%d AND name LIKE %s', [1, 'orm']).select().then(function(users) {});
```

字符串预处理格式类型支持指定数字、字符串等，具体可以参考[node.js的util.format](http://nodejs.org/api/util.html#util_util_format_format)方法所支持的格式。

#### 对象参数 ####

大部分情况下支持`where`方法的对象参数用法。

最简单的对象参数用法就是直接赋值，例如：

```Javascript
var map = {
    id: 1,
    name: 'hello'
};

// SELECT * FROM `user` WHERE `id` = 1 AND `name` = 'hello'
User.where(map).select().then(function(users) {});
```

上面的查询条件仅仅是一个简单的相等判断，除此之外还可用更加灵活多用的表达式查询来支持更多的SQL查询语法，查询表达式的使用格式如下：

```Javascript
var map = {
    fieldA: {
        expressionA: conditionA
    },

    fieldB: {
        expressionB: conditionB
    }
};

Model.where(map).select().then(function(result) {});
```

更多关于表达式查询，可以查看：[查询表达式](#%E6%9F%A5%E8%AF%A2%E8%A1%A8%E8%BE%BE%E5%BC%8F)。

#### 多次调用where ####

`where`方法支持多次调用，但字符串条件只能出现一次，例如：

```Javascript
// SELECT * FROM `user` WHERE (id >= 1) AND `name` = 'hello' AND `age` = 20
User.where('id >= 1').where({ name: 'hello' }).where({ age: 20 }).select().then(function(users) {});
```

多次的数组条件表达式会最终合并，但字符串条件则只支持一次。

更多的查询用法，可以参考：[数据查询](#%E6%95%B0%E6%8D%AE%E6%9F%A5%E8%AF%A2)部分。

### table ###

`table`方法也属于模型类的连贯操作方法之一，主要用于指定操作的数据表。

一般情况下，操作模型的时候系统能够自动识别当前对应的数据表，所以，使用`table`方法的情况通常是为了：

* 切换操作的数据表
* 对多表进行操作

例如：

```Javascript
// SELECT * FROM `book` WHERE (id >= 1)
Model.table('book').where('id >= 1').select().then(function(books) {});
```

当然，如果需要的话，也可以在`table`方法中指定数据库，例如：

```Javascript
// SELECT * FROM test.book
Model.table('test.book').select().then(function(books) {});
```

`table`方法指定的数据表需要完整的表名，但可以采用下面的方式简化数据表前缀的传入，例如：

```Javascript
// SELECT * FROM `book`
Model.table('__BOOK__').select().then(function(books) {});
```

`table`方法中使用`__TABLENAME__`字符串的形式时，会自动获取当前模型对应的数据表前缀（如果有定义前缀的话）来生成数据表名称。

需要注意的是`table`方法不会改变数据库的连接，所以你要确保当前连接的用户有权限操作相应的数据库和数据表。

如果需要对多表进行操作，可以这样使用：

```Javascript
// SELECT u.name,b.author FROM user u,book b
Model.field('u.name, b.author').table('user u, book b').select().then(function(result) {});
```

为了尽量避免和`Mysql`的关键字冲突，可以使用对象的方式定义，例如：

```Javascript
var alias = {
    user: 'u',
    book: 'b'
};

// SELECT u.name,b.author FROM `user` AS `u`,`book` AS `b` LIMIT 10
Model.field('u.name, b.author').table(alias).limit(10).select().then(function(result) {});
```

使用对象方式定义的优势是可以避免因为表名和关键字冲突而出错的情况。一般情况下，无需调用`table`方法，默认会自动获取当前模型对应或者定义的数据表。

### alias ###

`alias`用于设置当前数据表的别名，便于使用其他的连贯操作例如`join`方法等。

示例：

```Javascript
// SELECT * FROM `user` `u`
User.alias('u').select().then(function(users) {});

// SELECT * FROM `user` `u` INNER JOIN book b ON b.user_id = u.id
User.alias('u').join('__BOOK__ b ON b.user_id = u.id').select().then(function(result) {});
```

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

### 查询方式 ###

#### 字符串条件 ####

这是最简单的查询方式，但由于字符串中可能包含不安全字符，所以需要进行一些安全性的考虑。下面就是一个简单的例子：

```Javascript
// SELECT * FROM `user` WHERE (age >= 20 AND status = 1)
User.where('age >= 20 AND status = 1').select().then(function(users) {
    console.log(users);
});
```

> ThinkORM在对字符串条件查询时进行了对不安全字符的过滤，但建议用户在使用字符串查询时先进行必要的过滤。

#### 对象条件 ####

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

### 查询表达式 ###

上面提到了查询条件可以使用字符串，但在大多数时候使用对象作为查询条件比较多。

查询表达式就是以对象作为查询条件的一种查询方式，它可以支持比较判断，它的格式类似于下面这种形式：

```Javascript
var map = { };
// map['fieldname'] = { 'expression': 'value' };
map.fieldname = { 'expression': 'value' };
```

`expression`部分即为支持可用的表达式键，`value`则为满足条件的值。支持的表达式如下：

|     表达式    |          含义        | 辅助记忆 |
| ------------ | -------------------- | ------- |
|      EQ      | 等于（=）             | Equal |
|      NEQ     | 不等于（<>）          | Not Equal |
|      GT      | 大于（>）             | Greater Then |
|     EGET     | 大于等于（>=）        | Equal or Greater Then |
|      LT      | 小于（<）             | Less Then |
|      ELT     | 小于等于（<=）        | Equal or Less Then |
|     LIKE     | 模糊查询              |  |
| [NOT]BETWEEN | （不在）区间查询       |  |
|    [NOT]IN   | （不在）IN查询        |  |
|      EXP     | 表达式查询，支持SQL语法 | Expression |

以上即为支持可用的表达式键，**不区分大小写** 。下面为各表达式的使用例子：

#### EQ：等于（=） ####

例如：

```Javascript
// map['id'] = { eq: 23333 };
map.id = { eq: 23333 };
```

或者：

```Javascript
// map['id'] = { '=': 23333 };
map.id = { '=': 23333 };
```

和上面的查询等效：

```Javascript
// map['id'] = 23333;
map.id = 23333;
```

`EQ`表达式生成的SQL语句类似如下：

```Javascript
// SELECT * FROM `user` WHERE `id` = 23333
User.where({ id: { eq: 23333 } }).select().then(function(user) {});
```

#### NEQ：不等于（<>） ####

例如：

```Javascript
// map['id'] = { neq: 23333 };
map.id = { neq: 23333 };
```

或者：

```Javascript
// map['id'] = { '<>': 23333 };
map.id = { '<>': 23333 };
```

`NEQ`表达式生成的SQL语句类似如下：

```Javascript
// SELECT * FROM `user` WHERE `id` <> 23333
User.where({ id: { neq: 23333 } }).select().then(function(user) {});
```

#### GT：大于（>） ####

例如：

```Javascript
// map['id'] = { gt: 23333 };
map.id = { gt: 23333 };
```

或者：

```Javascript
// map['id'] = { '>': 23333 };
map.id = { '>': 23333 };
```

`GT`表达式生成的SQL语句类似如下：

```Javascript
// SELECT * FROM `user` WHERE `id` > 23333
User.where({ id: { gt: 23333 } }).select().then(function(user) {});
```

#### EGT：大于等于（>=） ####

例如：

```Javascript
// map['id'] = { egt: 23333 };
map.id = { egt: 23333 };
```

或者：

```Javascript
// map['id'] = { '>=': 23333 };
map.id = { '>=': 23333 };
```

`EGT`表达式生成的SQL语句类似如下：

```Javascript
// SELECT * FROM `user` WHERE `id` >= 23333
User.where({ id: { egt: 23333 } }).select().then(function(user) {});
```

#### LT：小于（<） ####

例如：

```Javascript
// map['id'] = { lt: 23333 };
map.id = { lt: 23333 };
```

或者：

```Javascript
// map['id'] = { '<': 23333 };
map.id = { '<': 23333 };
```

`LT`表达式生成的SQL语句类似如下：

```Javascript
// SELECT * FROM `user` WHERE `id` < 23333
User.where({ id: { lt: 23333 } }).select().then(function(user) {});
```

#### ELT：小于等于（<=） ####

例如：

```Javascript
// map['id'] = { elt: 23333 };
map.id = { elt: 23333 };
```

或者：

```Javascript
// map['id'] = { '<=': 23333 };
map.id = { '<=': 23333 };
```

`ELT`表达式生成的SQL语句类似如下：

```Javascript
// SELECT * FROM `user` WHERE `id` <= 23333
User.where({ id: { elt: 23333 } }).select().then(function(user) {});
```

#### [NOT]LIKE：模糊查询 ####

`[NOT]LIKE`表达式支持模糊查询，同SQL中`(NOT) LIKE`语法相同。

```Javascript
// `name` LIKE '%orm%'
map.name = { like: '%orm%' };

// `name` NOT LIKE '%orm%'
map.name = { notlike: '%orm%' };
```

`[NOT]LIKE`也支持多条件形式的模糊查询，它支持`AND`，`OR`和`XOR`的逻辑组合：

```Javascript
// `name` LIKE 'orm' OR `name` LIKE '%nodejs%' AND `name` LIKE '_He%' XOR `name` LIKE '%js'
map.name = {
    like: {
        or: ['orm', '%nodejs%'],
        and: '_He%',
        xor: '%js'
    }
};
```

上面是一个比较复杂的模糊查询。`AND`，`OR`和`XOR`的值支持字符串或者是数组。

#### [NOT]BETWEEN：区间查询 ####

`[NOT]BETWEEN`表达式支持区间查询，同SQL中`(NOT) BETWEEN...AND...`语法相同。

```Javascript
// `id` BETWEEN 100 AND 200
map.id = { between: '100, 200' };

// `id` NOT BETWEEN 100 AND 200
map.id = { notbetween: '100, 200' };
```

或者使用数组作为区间：

```Javascript
map.id = { between: [100, '200'] };
```

#### [NOT]IN： IN查询 ####

`[NOT]IN`表达式支持IN查询，同SQL中`(NOT) IN`语法相同。

```Javascript
// `id` IN ('100','200','300','400')
map.id = { in: '100, 200, 300, 400' };

// `id` NOT IN ('100','200','300','400')
map.id = { notin: '100, 200, 300, 400' };
```

或者使用数组作为IN的条件：

```Javascript
// `id` IN (100,'200',300,'400')
map.id = { in: [100, '200', 300, '400'] };
```

#### EXP：查询表达式 ####

使用`EXP`能支持更加复杂的查询条件，比如：

```Javascript
map.id = { in: '1, 3 , 8' };
```

可以改成：

```Javascript
map.id = { exp: 'IN (1, 3, 8)' };
```

`EXP`查询条件可以是任何有效的SQL语句，包括SQL支持的函数或者是表字段等。`EXP`不仅能供查询使用，而且还能支持数据更新：

```Javascript
// UPDATE `user` SET `score`=score+1 WHERE `id` = 1
User.where({ id: 1 }).save({ score: { exp: 'score+1' } }).then(function() {});
```

### 快捷查询 ###

快捷查询方式是一种多字段查询的简化写法，可以进一步简化查询条件的写法，在多个字段之间用`|`分割表示`OR`查询，用`&`分割表示`AND`查询。例如：

```Javascript
map['name|title'] = 'orm';

// SELECT * FROM `user` WHERE (`name` = 'orm' OR `title` = 'orm')
User.where(map).select().then(function() {});
```

当然，使用`&`或`|`快捷查询支持为不同字段指定不同条件的情况：

```Javascript
// `name` LIKE '%orm%' OR `age` = 12 OR `score` > 3
map['name|age|score'] = [{ like: '%orm%' }, 12, { gt: 3 }];
```

上面的形式等价于：

```Javascript
map.name = { like: '%orm%' };
map.age = 12;
map.score = { gt: 3 };
```

`&`和`|`可以混合使用，但这种使用方式只能支持单一条件，即所有字段都只能应用同一个条件，例如：

```Javascript
// `name` LIKE 'orm' AND `title` LIKE 'orm' OR `address` LIKE 'orm'
map['name&title|address'] = { like: 'orm' };
```

> 快捷查询为不同字段指定不同条件时，不能把'|'和'&'混用。需要注意的是，不同字段所对应的条件是按照出现的顺序来赋值的。

### 区间查询 ###

ThinkORM支持对某些字段进行区间查询，例如：

```Javascript
// `id` > 10 AND `id` < 30
map.id = [{ gt: 10 }, { lt: 30 }];
```

区间查询也可以支持`OR`和`XOR`逻辑：

```Javascript
// `id` > 10 OR `id` < 30
map.id = [{ gt: 10 }, { lt: 30 }, 'OR'];
```

> 逻辑操作符AND，OR和XOR只能作为数组的最后一个元素，默认是AND。

区间查询的条件可以支持普通查询的所有表达式，也就是说类似`LIKE`、`GT`和`EXP`这样的表达式都可以支持。另外区间查询还可以支持更多的条件，只要是针对一个字段的条件都可以写到一起，例如：

```Javascript
// `name` LIKE '%orm%' OR `name` = 'nodejs' OR `name` = 'think'
map.name = [{ like: '%orm%' }, 'nodejs', 'think', 'OR'];
```

### 组合查询 ###

组合查询是一种可以混用的查询方式，查询的主体还是采用对象作为查询条件，只是加入了一些特殊的查询支持，包括字符串模式查询（`_string`）、复合查询（`_complex`）、请求字符串查询（`_query`）。

#### 字符串模式查询 ####

对象条件可以和字符串条件混用（`_string`作为查询条件），例如：

```Javascript
map.id = { gt: 100 };
map.name = 'orm';
map._string = 'status=1 AND score>10';

// SELECT * FROM `user` WHERE `id` > 100 OR `name` = 'orm' OR (status=1 AND score>10)
User.where(map).select().then(funciton(users) {});
```

#### 请求字符串查询 ####

请求字符串查询是一种类似于URL传参的方式，可以支持简单的条件相等判断。

```Javascript
map.id = { gt: 100 };
map._query = 'status=1&score=100&_logic=or';

// SELECT * FROM `user` WHERE `id` > 100 AND (`status`='1' OR `score`='100')
User.where(map).select().then(funciton(users) {});
```

#### 复合查询 ####

复合查询相当于封装了一个新的查询条件，然后并入原来的查询条件之中，所以可以完成比较复杂的查询条件组装。 例如：

```Javascript
var where = {
    name: { like: '%thinkorm%' },
    title: { like: '%nodejs%' },
    _logic: 'OR'
};

var map = {
    id: { gt: 1 },
    _complex: where
};

// SELECT * FROM `post` WHERE `id` > 1 AND (`name` LIKE '%thinkorm%' OR `title` LIKE '%nodejs%')
Post.where(map).select().then(function(posts) {});
```

复合查询使用了`_complex`作为子查询条件来定义，配合之前的查询方式，可以非常灵活的制定更加复杂的查询条件。 很多查询方式可以相互转换，例如上面的查询条件可以改成：

```Javascript
var map = {
    id: { gt: 1 },
    _string: "name LIKE '%thinkorm%' OR title LIKE '%nodejs%'"
};
```

这个结果和使用`_complex`的例子是一样的。

### 统计查询 ###

在应用中我们经常会用到一些统计数据，例如当前所有（或者满足某些条件）的用户数、所有用户的最大积分、用户的平均成绩等等，ThinkORM为这些统计操作提供了一系列的内置方法，这些方法的作用类似于SQL中对应的函数，包括：

|  方法  | 说明 |
| ----- | ---- |
| count | 统计数量，默认是统计“*” |
|  max  | 获取最大值 |
|  min  | 获取最小值 |
|  avg  | 获取平均值 |
|  sum  | 获取总和   |

#### count ####

统计用户总数：

```Javascript
// User.count('*').then(function(result) {});
User.count().then(function(result) {});
```

或者根据字段进行统计：

```Javascript
// SELECT COUNT(`id`) FROM `user`
User.count('id').then(function(result) {});
```

#### max ####

获取用户中的最大年龄：

```Javascript
// SELECT MAX(`age`) FROM `user` WHERE `status` = 1
User.where({ status: 1 }).max('age').then(function() {});
```

#### min ####

获取用户中的最小年龄：

```Javascript
// SELECT MIN(`age`) FROM `user` WHERE `status` = 1
User.where({ status: 1 }).min('age').then(function(result) {});
```

#### avg ####

获取用户平均年龄：

```Javascript
// SELECT AVG(`age`) FROM `user`
User.avg('age').then(function(result) {});
```

#### sum ####

获取用户的年龄总和：

```Javascript
// SELECT SUM(`age`) FROM `user`
User.sum('age').then(function(result) {});
```

统计查询方法都支持连贯操作的方式使用。

> 这里的五个方法中，返回的结果都为一个数值。除了count方法外，max，min，avg，sum都需要提供一个字段名作为参数，否则结果将会是NaN。

### SQL查询 ###

ThinkORM虽然提供了许多方便的查询方法，但为了满足复杂查询的需要和一些特殊的数据操作，还是保留了支持原生SQL查询的功能。SQL查询的返回值依赖于底层库返回的结果，ThinkORM未对原生结果进行处理。

支持原生SQL查询的方法有`query`和`execute`。

#### query方法 ####

`query`方法用于执行SQL查询操作，返回原生的结果集。如果SQL语句有语法错误或者数据库错误，则抛出异常。

```Javascript
Model.query('SELECT * FROM think_user WHERE status = 1');
```

`query`方法支持表前缀和表名的简化写法，这样便于更改表前缀，这里有三种形式的前缀：

|        形式        | 替换为 |
| ---------------   | ------ |
| \_\_PREFIX\_\_    | 替换为当前表前缀 |
| \_\_TABLE\_\_     | 替换为当前表名称 |
| \_\_MODELNAME\_\_ | 替换成前缀 + 表名称的形式 |

例如：

```Javascript
Model.query('SELECT * FROM __PREFXI__user');

Model.query('SELECT * FROM __TABLE__');

Model.query('SELECT * FROM __USER__');
```

#### execute方法 ####

`execute`方法用于写入和更新数据，返回原生结果。它支持的用法同[query](#query%E6%96%B9%E6%B3%95)方法。

### 字段查询 ###

ThinkORM提供了字段查询，方便了可以按照某个字段的要求进行查询。

#### getBy：根据字段值查询数据 ####

`getBy`查询方式针对数据表的字段进行查询。例如，`User`模型对应的表拥有`id`，`name`字段，那么我们就可以下面的方式进行查询：

```Javascript
// SELECT * FROM `user` WHERE `id` = 1 LIMIT 1
User.getBy('id', 1).then(function(user) {});

// SELECT * FROM `user` WHERE `name` LIKE 'orm' LIMIT 1
User.getBy({ name: { like: 'orm' } }).then(function(user) {});
```

> getBy方法默认对结果集进行了LIMIT 1，这意味着getBy方法只能返回一行结果。

#### getFieldBy：根据字段值查询并返回某个字段的值 ####

`getFieldBy`方法和`getBy`方法类似，只是多了一个参数来支持期望获得的字段值，例如：

```Javascript
// SELECT `id` FROM `user` WHERE `id` >= 1
// [1, 2, 3, 4, 5]
User.getFieldBy('id', { egt: 1 }, 'id').then(function(result) {});

// SELECT `name`,`age`,`id` FROM `user` WHERE `id` >= 1
// [{orm: { name: 'orm', age: 12, id: 1 }}, ...]
User.getFieldBy('id', { egt: 1 }, 'name, age, id').then(function(result) {});
```

查询数据量比较大时，对于字段多的表，指定表中字段是十分必要的。

### 子查询 ###

ThinkORM提供两种方式来支持子查询，一种是通过`select`方法，另一种是`buildSql`方法。

#### select ####

当调用`select`方法时给它传递一个`false`参数时，表示`select`不进行查询，只是返回构建的SQL语句，例如：

```Javascript
// SELECT `id`,`name` FROM `user` WHERE `id` > 5 GROUP BY age ORDER BY status ASC
Model.field('id,name').table('user').group('age').where({id: {gt: 5}}).order('status ASC').select(false).then(function(sql) {
    console.log(sql);
});
```

#### buildSql ####

调用`buildSql`方法后不会进行实际的查询操作，而只是生成该次查询的SQL语句（为了避免混淆，会在SQL两边加上括号），然后我们直接在后续的查询中直接调用，例如：

```Javascript
var sql = Model.field('id,name').table('user').group('age').where({id: {gt: 5}}).order('status ASC').getBuildSql();

// SELECT * FROM (SELECT `id`,`name` FROM `user` WHERE `id` > 5 GROUP BY age ORDER BY status ASC) aliasname
Model.table(sql + ' aliasname').select().then(function(users) {});
```

构造的子查询SQL可用于[连贯操作](#%E8%BF%9E%E8%B4%AF%E6%93%8D%E4%BD%9C)方法，例如`table`，`where`等。

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

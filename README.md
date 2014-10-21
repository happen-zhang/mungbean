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
        * [字符串参数](#%E5%AD%97%E7%AC%A6%E4%B8%B2%E5%8F%82%E6%95%B0)
        * [对象参数](#%E5%AF%B9%E8%B1%A1%E5%8F%82%E6%95%B0)
        * [多次调用where](#%E5%A4%9A%E6%AC%A1%E8%B0%83%E7%94%A8where)
    * [data](#data)
        * [setData](#setdata)
        * [getData](#getdata)
    * [table](#table)
    * [alias](#alias)
    * [field](#field)
        * [返回指定的字段](#%E8%BF%94%E5%9B%9E%E6%8C%87%E5%AE%9A%E7%9A%84%E5%AD%97%E6%AE%B5)
        * [指定写入字段](#%E6%8C%87%E5%AE%9A%E5%86%99%E5%85%A5%E5%AD%97%E6%AE%B5)
        * [使用SQL函数](#%E4%BD%BF%E7%94%A8sql%E5%87%BD%E6%95%B0)
        * [字段别名](#%E5%AD%97%E6%AE%B5%E5%88%AB%E5%90%8D)
        * [获取所有字段](#%E8%8E%B7%E5%8F%96%E6%89%80%E6%9C%89%E5%AD%97%E6%AE%B5)
        * [字段排除](#%E8%8E%B7%E5%8F%96%E6%89%80%E6%9C%89%E5%AD%97%E6%AE%B5)
    * [order](#order)
    * [limit](#limit)
        * [限制结果数量](#%E9%99%90%E5%88%B6%E7%BB%93%E6%9E%9C%E6%95%B0%E9%87%8F)
        * [分页查询](#%E5%88%86%E9%A1%B5%E6%9F%A5%E8%AF%A2)
    * [page](#page)
    * [group](#group)
    * [having](#having)
    * [join](#join)
    * [union](#union)
    * [distinct](#distinct)
    * [lock](#lock)
    * cache
    * [comment](#comment)
    * relation
    * index
* [CRUD操作](#crud%E6%93%8D%E4%BD%9C)
    * [数据创建](#%E6%95%B0%E6%8D%AE%E5%88%9B%E5%BB%BA)
        * [create](#create)
    * [数据写入](#%E6%95%B0%E6%8D%AE%E5%86%99%E5%85%A5)
        * [add](#add)
        * [字段写入和过滤](#%E5%AD%97%E6%AE%B5%E5%86%99%E5%85%A5%E5%92%8C%E8%BF%87%E6%BB%A4)
        * [addAll](#addall)
    * [数据读取](#%E6%95%B0%E6%8D%AE%E8%AF%BB%E5%8F%96)
        * [find](#find)
        * [select](#select)
        * [getField](#getfield)
    * [数据更新](#%E6%95%B0%E6%8D%AE%E6%9B%B4%E6%96%B0)
        * [save](#save)
        * [字段更新和过滤](#%E5%AD%97%E6%AE%B5%E6%9B%B4%E6%96%B0%E5%92%8C%E8%BF%87%E6%BB%A4)
        * [saveField](#savefield)
        * [saveInc](#saveinc)
        * [saveDec](#savedec)
    * [数据删除](#%E6%95%B0%E6%8D%AE%E5%88%A0%E9%99%A4)
        * [delete](#delete)
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
* [ActiveRecords](#activerecords)
    * [创建数据对象](#%E5%88%9B%E5%BB%BA%E6%95%B0%E6%8D%AE%E5%AF%B9%E8%B1%A1)
    * [查询记录](#%E6%9F%A5%E8%AF%A2%E8%AE%B0%E5%BD%95)
    * [更新记录](#%E6%9B%B4%E6%96%B0%E8%AE%B0%E5%BD%95)
    * [删除记录](#%E5%88%A0%E9%99%A4%E8%AE%B0%E5%BD%95)
* [命名范围](#%E5%91%BD%E5%90%8D%E8%8C%83%E5%9B%B4)
    * [_scope](#_scope)
    * [scope](#scope)
    * [默认命名空间](#%E9%BB%98%E8%AE%A4%E5%91%BD%E5%90%8D%E8%8C%83%E5%9B%B4)
    * [命名范围调整](#%E5%91%BD%E5%90%8D%E8%8C%83%E5%9B%B4%E8%B0%83%E6%95%B4)
    * [自定义命名范围](#%E8%87%AA%E5%AE%9A%E4%B9%89%E5%91%BD%E5%90%8D%E8%8C%83%E5%9B%B4)
    * [与连贯操作混合使用](#%E4%B8%8E%E8%BF%9E%E8%B4%AF%E6%93%8D%E4%BD%9C%E6%B7%B7%E5%90%88%E4%BD%BF)
    * [动态调用](#%E5%8A%A8%E6%80%81%E8%B0%83%E7%94%A8)
* [字段映射](#%E5%AD%97%E6%AE%B5%E6%98%A0%E5%B0%84)
    * [_map](#_map)
    * [parseFieldsMap](#parsefieldsmap)
* [数据验证](#%E6%95%B0%E6%8D%AE%E9%AA%8C%E8%AF%81)
    * [验证规则项](#%E9%AA%8C%E8%AF%81%E8%A7%84%E5%88%99%E9%A1%B9)
        * [验证字段](#%E9%AA%8C%E8%AF%81%E5%AD%97%E6%AE%B5)
        * [验证规则](#%E9%AA%8C%E8%AF%81%E8%A7%84%E5%88%99)
        * [提示信息](#%E6%8F%90%E7%A4%BA%E4%BF%A1%E6%81%AF)
        * [验证条件](#%E9%AA%8C%E8%AF%81%E6%9D%A1%E4%BB%B6)
        * [附加规则](#%E9%99%84%E5%8A%A0%E8%A7%84%E5%88%99)
        * [验证时间](#%E9%AA%8C%E8%AF%81%E6%97%B6%E9%97%B4)
        * [附加参数](#%E9%99%84%E5%8A%A0%E5%8F%82%E6%95%B0)
    * [静态定义](#%E9%9D%99%E6%80%81%E5%AE%9A%E4%B9%89)
    * [动态定义](#%E5%8A%A8%E6%80%81%E9%AA%8C%E8%AF%81)
    * [批量验证](#%E6%89%B9%E9%87%8F%E9%AA%8C%E8%AF%81)
* [数据填充](#%E6%95%B0%E6%8D%AE%E5%A1%AB%E5%85%85)
    * [填充规则项](#%E5%A1%AB%E5%85%85%E8%A7%84%E5%88%99%E9%A1%B9)
        * [填充字段](#%E5%A1%AB%E5%85%85%E5%AD%97%E6%AE%B5)
        * [填充规则](#%E5%A1%AB%E5%85%85%E8%A7%84%E5%88%99)
        * [填充时间](#%E5%A1%AB%E5%85%85%E6%97%B6%E9%97%B4)
        * [附加规则](#%E9%99%84%E5%8A%A0%E8%A7%84%E5%88%99-1)
        * [附加参数](#%E9%99%84%E5%8A%A0%E5%8F%82%E6%95%B0-1)
    * [静态定义](#%E9%9D%99%E6%80%81%E5%AE%9A%E4%B9%89-1)
    * [动态定义](#%E5%8A%A8%E6%80%81%E5%AE%9A%E4%B9%89)
* [视图模型](#%E8%A7%86%E5%9B%BE%E6%A8%A1%E5%9E%8B)
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

ThinkORM支持的连贯操作方法有：

| 方法名  | 作用 | 参数类型 |
| ------ | --- | ------- |
| where  | 查询或者更新条件的定义 | String，Array，Object |
| table  | 定义要操作的数据表名称 | String，Array |
| alias  | 定义当前表的别名      | String |
| setData | 保存新增或者更新数据之前有效的数据对象 | String，Object |
| getData | 保存新增或者更新数据之前有效的数据对象 | String |
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
| filter | 数据过滤 | Function |
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

### data ###

在ThinkORM中，虽然没有实体对象的概念，但是ThinkORM中的每个模型示例都可以保存或读取一些临时数据，这些数据可以被保存到数据库中。保存数据的方法为`setData`，而读取数据的方法为`getData`。支持`setData`保存数据的方法用`add`和`save`方法。需要注意的是，每调用一次`add`或者`save`方法后，`setData`临时保存在模型中的数据将会被清空，即`getData`的数据将会被清空。

#### setData ####

`setData`方法也是模型类的连贯操作方法之一，用于设置当前要操作的数据对象的值。`setData`方法支持两种形式的调用，分别为`key-value`的形式和对象的形式，例如：

```Javascript
// hello
// User.setData('name', 'hello').getData('name');
User.setData({name: 'hello'}).getData('name');
```

`setData`保存的数据能被用在`add`或`save`方法上，即`setData`所保存的数据将会被用在本次的`add`或`save`方法中。

```Javascript
// INSERT INTO `user` (`name`,`email`,`age`) VALUES ('hello','v8@orm.com',18)
User.setData('name', 'hello').setData('age', 18).add().then(function(result) {});

// UPDATE `user` SET `name`='eventloop',`age`=26 WHERE (id = 1)
User.where('id = 1').setData({name: 'eventloop', age: 26}).save().then(function(result) {});
```

> 调用完add或者save方法后，setData保存的数据都将会被清空，在下次add或save中无效。

#### getData ####

`getData`方法可以读取`setData`所保存的数据，它只有一个参数为键名的字符串。例如：

```Javascript
// hello
User.setData({name: 'hello'}).getData('name');
```

### table ###

`table`方法也属于模型类的连贯操作方法之一，主要用于指定操作的数据表。

一般情况下，操作模型的时候ThinkORM能够自动识别当前对应的数据表，所以，使用`table`方法的情况通常是为了：

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

### field ###

`field`方法属于模型的连贯操作方法之一，主要目的是指定要返回或者操作的字段，可以用于查询和写入操作。

`field`方法支持字符串或者数组作为参数。

#### 返回指定的字段 ####

在查询操作中，`field`方法是十分常用的。例如，只取出`User`模型对应表中的`id`, `name`和`age`字段：

```Javascript
// SELECT `id`,`name`,`age` FROM `user`
// User.field(['id', 'name', 'age']).select().then(function(users) {});
User.field('id, name, age').select().then(function(users) {});
```

#### 指定写入字段 ####

除了查询操作之外，`field`方法还有一个非常重要的安全功能——字段合法性检测。`field`方法结合[create]()方法使用就可以完成对字段的合法性检测。例如：

```Javascript
var user = {
    id: 100,
    name: 'hello',
    age: 18,
    nickname: 'world'
};

User.field('name, age, gender').create(user).then(function(user) {
    //  { name: 'hello', age: 18 }
    console.log(user);
});
```

上面表示合法字段只有`name`，`age`和`gender`字段，`id`和`nickname`字段将会被屏蔽。

同样的，`field`也可以结合`add`和`save`方法，进行字段过滤，例如：

```Javascript
// INSERT INTO `user` (`name`,`age`) VALUES ('hello',18)
User.field('name, age').add(user).then(function(result) {});

// UPDATE `user` SET `name`='hello',`age`=18 WHERE (id = 1)
User.field('name, age').where('id = 1').save(user).then(function(result) {});
```

在`field`中没有指定的字段会被过滤掉。

#### 使用SQL函数 ####

在`field`方法中可以直接使用SQL中的函数，例如：

```Javascript
// SELECT `id`,SUM(age) FROM `user`
User.field('id, SUM(age)').select().then(function(users) {});
```

#### 字段别名 ####

`field`也可为字段设置别名：

```Javascript
// SELECT `id`,name AS nickname FROM `user`
// User.field({ id: 'id', name: 'nickname' }).select().then(function(users) {});
User.field('id, name AS nickname').select().then(function(users) {});
```

也可能会有更复杂的别名定义，例如：

```Javascript
// SELECT `id` AS `id`,CONCAT(name, '-', id) AS `truename`,AVG(age) AS `age` FROM `user`
User.field({ id: 'id', "CONCAT(name, '-', id)": 'truename', 'AVG(age)': 'age' }).select().then(function(users) {});
```

#### 获取所有字段 ####

如果有一个表有非常多的字段，需要获取所有的字段（这个也许很简单，因为不调用`field`方法或者直接使用空的`field`方法都能做到），例如：

```Javascript
// SELECT * FROM `user`
User.select().then(function(users) {});

User.field().select().then(function(users) {});

User.field('*').select().then(function(users) {});
```

以上三个用法的结果都是一样的。

如果希望显式的调用所有字段（对于对性能要求比较高的系统，这个要求并不过分，起码是一个比较好的习惯），`field`方法仍然能够实现，下面的用法可以完成预期的作用：

```Javascript
// SELECT `id`,`name`,`age`,`gender`,`score`,`status`,`created_at` FROM `user`
User.field(true).select().then(function(users) {});
```

`field(true)`的用法会显式的获取数据表的所有字段列表，哪怕数据表中有再多的字段。

#### 字段排除 ####

如果在某次查询中不希望获取某些字段（如`article`表中存放文章内容的`content`字段）之外的所有字段值（假设包含`id`，`title`，`author`字段），我们就可以使用`field`方法的排除功能，例如下面的方式就可以实现所说的功能：

```Javascript
// SELECT `id`,`title`,`author` FROM `article`
Article.field('content', true).select().then(function(articles) {});

// SELECT `id`,`title` FROM `article`
// Article.field(['content', 'author'], true).select().then(function(articles) {});
Article.field('content, author', true).select().then(function(articles) {});
```

> 当然，除了select方法之外，所有的查询方法，包括find等都可以使用field方法，这里只是以select为例说明。

#### order ####

`order`方法属于模型的连贯操作方法之一，用于对操作的结果排序。

```Javascript
// SELECT * FROM `user` WHERE (status = 1) ORDER BY id desc LIMIT 5
User.where('status = 1').order('id desc').limit(5).select().then(function(users) {});
```

> 注意：连贯操作方法没有顺序，可以在select方法调用之前随便改变调用顺序。

支持多个字段排序，例如：

```Javascript
// SELECT * FROM `user` WHERE (status = 1) ORDER BY id DESC, age ASC LIMIT 5
User.where('status = 1').order('id DESC, age ASC').limit(5).select().then(function(users) {});
```

> 如果没有指定desc或者asc排序规则的话，默认为asc。

如果字段和`Mysql`关键字有冲突，那么建议采用对象的方式调用，例如：

```Javascript
// SELECT * FROM `user` WHERE (status=1) ORDER BY `id` desc,`age` asc
User.where('status=1').order({ id: 'desc', age: 'asc' }).select().then(function(users) {});
```

### limit ###

`limit`方法也是模型类的连贯操作方法之一，主要用于指定查询和操作的数量，特别在分页查询的时候使用较多。

#### 限制结果数量 ####

例如从`User`中获取满足`status=1`的10条数据，如下调用即可：

```Javascript
// SELECT * FROM `user` WHERE (status = 1) LIMIT 10
User.where('status = 1').limit(10).select().then(function(users) {});
```

`limit`方法也可以用于写操作。例如，更新满足`score > 100`的3条数据：

```Javascript
// UPDATE `user` SET `age`=18 WHERE (score > 100) LIMIT 3
User.where('score > 100').limit(3).save({ level: 'A' }).then(function(result) {});
```

#### 分页查询 ####

使用`limit`方法可以支持分页查询。例如，从第10条记录开始，取出30条记录：

```Javascript
// SELECT * FROM `user` LIMIT 10,30
// User.limit(10, 30).select().then(function(users) {});
User.limit('10, 30').select().then(function(users) {});
```

对于大数据表，尽量使用`limit`限制查询结果，否则会导致很大的内存开销和性能问题。

### page ###

`page`方法也是模型的连贯操作方法之一，是完全为分页查询而诞生的一个人性化操作方法。

我们在前面已经了解了关于`limit`方法用于分页查询的情况，而`page`方法则是更人性化的进行分页查询的方法，例如还是以`User`列表分页为例来说，如果使用`limit`方法，我们要查询第一页和第二页（假设我们每页输出10条数据）写法如下：

```Javascipt
// 第一页记录
User.limit('0, 10').select(then(users) {});

// 第二页记录
User.limit('10, 10').select(then(users) {});
```

虽然利用`limit`方法也能实现分页的效果，但是这样做还需要手动计算记录的起始行数，稍微麻烦一点。如果用`page`方法来写则简单多了，例如：

```Javascipt
// SELECT * FROM `user` LIMIT 0,10
User.page('1, 10').select(then(users) {});

// SELECT * FROM `user` LIMIT 10,10
// User.page(2, 10).select(then(users) {});
User.page('2, 10').select(then(users) {});
```

显而易见的是，使用`page`方法你不需要计算每个分页数据的起始位置，`page`方法内部会自动计算。

`page`方法可以和`limit`方法配合使用，例如：

```Javascipt
// SELECT * FROM `user` LIMIT 20,10
User.limit(10).page(3).select().then(function(users) {});

// 和上面的结果相同
User.page(3, 10).select().then(function(users) {});
```

当`page`方法只有一个值传入的时候，表示第几页，而`limit`方法则用于设置每页显示的数量。

### group ###

`group`方法也是连贯操作方法之一，通常用于结合合计函数，根据一个或多个列对结果集进行分组 。

`group`方法只有一个参数，并且只能使用字符串。

```Javascript
// SELECT `name`,`author` FROM `book` GROUP BY `user_id`
Book.field('name, author').group('user_id').select().then(function(books) {});
```

`group`也可以支持多字段分组，例如：

```Javascript
// SELECT `name`,`author` FROM `book` GROUP BY `user_id`, `created_at`
Book.field('name, author').group('user_id, created_at').select().then(function(books) {});
```

### having ###

`having`方法也是连贯操作之一，用于配合`group`方法完成从分组的结果中筛选（通常是聚合条件）数据。

`having`方法只有一个参数，并且只能使用字符串，例如：

```Javascript
// SELECT `name`,`author` FROM `book` GROUP BY `user_id` HAVING COUNT(number) > 3
Book.field('name, author').group('user_id').having('COUNT(number) > 3').select().then(function(books) {});
```

### join ###

`join`方法也是连贯操作方法之一，用于根据两个或多个表中的列之间的关系，从这些表中查询数据。

`join`通常有下面几种类型，不同类型的`join`操作会影响返回的数据结果。

* `INNER JOIN`: 如果表中有至少一个匹配，则返回行，等同于`JOIN`
* `LEFT JOIN`: 即使右表中没有匹配，也从左表返回所有的行
* `RIGHT JOIN`: 即使左表中没有匹配，也从右表返回所有的行
* `FULL JOIN`: 只要其中一个表中存在匹配，就返回行

`join`方法可以支持以上四种类型，例如：

```Javascript
// SELECT * FROM `orm_user_book` INNER JOIN orm_user ON orm_user_book.user_id = orm_user.id INNER JOIN orm_book ON orm_user_book.book_id = orm_book.id
UserBook.join('orm_user ON orm_user_book.user_id = orm_user.id').join('orm_book ON orm_user_book.book_id = orm_book.id').select().then(function(result) {});
```

`join`方法支持多次调用，但指定的数据表必须是全称，但我们可以这样来定义：

```Javascript
// 假设前缀为'orm_'
// SELECT * FROM `orm_book` INNER JOIN orm_user ON orm_book.user_id = orm_user.id
Book.join('__USER__ ON __BOOK__.user_id = __USER__.id').select().then(function(result) {});
```

上面例子中的`__USER__`和`__BOOK__`会被分别解析为全表名`orm_user`和`orm_book`（这里假设前缀为`orm_`）。

默认采用`INNER JOIN`方式，如果需要用其他的`JOIN`方式，可以改成

```Javascript
// SELECT * FROM `book` RIGHT JOIN user ON book.user_id = user.id
Book.join('RIGHT JOIN __USER__ ON __BOOK__.user_id = __USER__.id').select().then(function(result) {});
```

或者：

```Javascript
// SELECT * FROM `book` RIGHT JOIN user ON book.user_id = user.id
Book.join('__USER__ ON __BOOK__.user_id = __USER__.id', 'RIGHT').select().then(function(result) {});
```

> join方法的第二个参数支持的类型包括：INNER，LEFT，RIGHT，FULL。

如果`join`方法的参数用数组的话，只能使用一次`join`方法，并且不能和字符串方式混合使用。

```Javascript
// SELECT * FROM `user_book` INNER JOIN user ON user_book.user_id = user.id INNER JOIN book ON user_book.book_id = book.id
UserBook.join(['user ON user_book.user_id = user.id', 'book ON user_book.book_id = book.id']).select().then(function(result) {});
```

使用数组方式的情况下，第二个参数无效。因此必须在字符串中显式定义`join`类型，例如：

```Javascript
// SELECT * FROM `user_book` RIGHT JOIN user ON user_book.user_id = user.id LEFT JOIN book ON user_book.book_id = book.id
UserBook.join(['RIGHT JOIN user ON user_book.user_id = user.id', 'LEFT JOIN book ON user_book.book_id = book.id']).select().then(function(result) {});
```

### union ###

`union`操作用于合并两个或多个`SELECT`语句的结果集。

下面为`union`的使用例子：

```Javascript
// SELECT * FROM `user` UNION SELECT * FROM book UNION SELECT * FROM user_book
User.union('SELECT * FROM book').union('SELECT * FROM user_book').select().then(function(result) {});
```

对象作为参数的用法：

```Javascript
var unionA = {
    field: 'author',
    table: 'book'
};

var unionB = {
    where: {
        user_id: {
            egt: 10
        }
    },
    table: 'user_book'
};

// SELECT * FROM `user` UNION SELECT `author` FROM `book`  UNION SELECT * FROM `user_book` WHERE `user_id` >= 10
// User.union(unionA).union(unionB).select().then(function(result) {});
User.union([unionA, unionB]).select().then(function(result) {});
```

`union`方法支持`UNION ALL`，例如：

```Javascript
// SELECT * FROM `user` UNION ALL SELECT * FROM book UNION ALL SELECT * FROM user_book
// User.union('SELECT * FROM book', true).union('SELECT * FROM user_book', true).select().then(function(result) {});
User.union(['SELECT * FROM book', 'SELECT * FROM user_book'], true).select().then(function(result) {});
```

每个`union`方法相当于一个独立的`SELECT`语句。

> UNION 内部的 SELECT 语句必须拥有相同数量的列。列也必须拥有相似的数据类型。同时，每条 SELECT 语句中的列的顺序必须相同。

### distinct ###

`distinct`方法用于返回唯一不同的值，例如。

```Javascript
// SELECT DISTINCT `name` FROM `user`
User.distinct(true).field('name').select().then(function(result) {});
```

`distinct`方法的参数是`Boolean`类型。

### lock ###

`lock`方法是用于数据库的锁机制，如果在查询或者执行操作的时候使用：

```Javascript
lock(true);
```

就会自动在生成的SQL语句最后加上`FOR UPDATE`。

### comment ###

`comment`方法 用于在生成的SQL语句中添加注释内容，例如：

```Javascript
// SELECT `id`,`name` FROM `user` WHERE (score >= 100) /* Find users whose score equal or greater 100. */
User.field('id, name').where('score >= 100').comment('Find users whose score equal or greater 100.').select().then(function(users) {});
```

## CRUD操作 ##

### 数据创建 ###

在进行数据操作之前，我们往往需要把数据的值计算出来后手动赋值给对象。ThinkORM可以帮助你快速地创建数据对象，最典型的应用就是自动根据表单数据创建数据对象，这个优势在一个数据表的字段非常之多的情况下尤其明显。

#### create ####

`create`方法可以用来创建对象，通过这个方法创建出来的对象都会经过一系列自定义的[自动验证](#%E6%95%B0%E6%8D%AE%E9%AA%8C%E8%AF%81)或[自动填充](#%E6%95%B0%E6%8D%AE%E5%A1%AB%E5%85%85)操作。如果定义检验或填充方法，那么`create`方法将返回一个空对象。例如，创建一个带有当前时间戳的`published_at`属性的对象，并对`title`属性进行检验：

```Javascript
Article.create({title: 'unexpect'}).then(function(article) {
    // { title: 'unexpect', published_at: 1413684883 }
    console.log(article);
});
```

`create`方法的第二个参数可以指定创建数据的操作状态，默认情况下是自动判断是写入还是更新操作。可以为`create`方法显式指定操作状态，例如：

```Javascript
User.create({}, ThinkORM.MODEL_UPDATE).then(function(user) {});
```

ThinkORM内置的数据操作状态包括`ThinkORM.MODEL_INSERT`（或者1）和`ThinkORM.MODEL_UPDATE`（或者2），当没有指定的时候，ThinkORM根据数据源是否包含主键数据来自动判断，如果存在主键数据，就当成`Model::MODEL_UPDATE`操作。

不同的数据操作状态可以定义不同的数据验证和自动完成机制，所以，你可以自定义自己需要的数据操作状态。例如，可以设置登录操作的数据状态（假设为3）：

```Javascript
User.create({}, 3).then(function(user) {});
```

在进行`add`或者`save`操作数据写入或更新的时候，建议使用`create`方法进行一些自定义处理，这样数据表中不存在的字段以及非法的数据类型（例如对象、数组等非标量数据）是会自动过滤的，不用担心非数据表字段的写入导致SQL错误的问题。

```Javascript
User.create({ name: 'hello' }).then(function() {
    return User.add();
}).then(function(result) {});
```

在执行`create`方法之前，我们可以调用相关的连贯操作方法，配合完成数据创建操作。`create`方法支持的连贯操作方法包括：

| 方法名  | 作用 | 参数类型 |
| ------ | --- | ------- |
| field  | 定义合法的字段 | String，Array |
| validate | 数据自动验证 | Object |
| auto | 数据自动完成 | Object |

如果在`create`方法之前调用`field`方法，则表示只允许创建指定的字段数据，其他非法字段将会被过滤，例如：

```Javascript
var data = {
    name: 'hello',
    email: 'nodejs@orm.com',
    age: 18,
    status: 1
};

User.field('name, email').create(data).then(function(user) {
    // { name: 'hello', email: 'nodejs@orm.com' }
    console.log(user);
});
```

最终只有`name`和`email`字段的数据被允许写入，`age`和`status`字段直接被过滤了，哪怕`status`也是数据表中的合法字段。

### 数据写入 ###

#### add ####

ThinkORM的数据写入操作使用`add`方法，使用示例如下：

```Javascript
var data = {
    name: 'hello',
    email: 'world@orm.com',
    age: 18
};

// INSERT INTO `user` (`name`,`email`,`age`) VALUES ('hello','world@orm.com',18)
User.add(data).then(function(result) {});
```

或者使用`setData`方法连贯操作：

```Javascript
User.setData(data).then(function(result) {});
```

如果在`add`之前已经创建数据对象的话（例如使用了`create`或者`setData`方法），`add`方法就不需要再传入数据了。 使用`create`方法的例子：

```Javascript
User.create(data).then(function() {
    return User.add();
}).then(function(result) {});
```

`add`方法可以支持`REPLACE`语法，只需要给`add`传递第三个参数`true`值即可。例如：

```Javascript
var data = {
    name: 'hello',
    email: 'world@orm.com',
    age: 18
};

// REPLACE INTO `user` (`name`,`email`,`age`) VALUES ('hello','world@orm.com',18)
User.add(data, {}, true).then(function(result) {});
```

在执行`add`方法之前，我们可以调用相关的连贯操作方法，配合完成数据写入操作。`add`方法支持的连贯操作如下：

| 方法名  | 作用 | 参数类型 |
| ------ | --- | ------- |
| table  | 定义要操作的数据表名称 | String，Array |
| setData | 保存新增或者更新数据之前有效的数据对象 | String，Object |
| field  | 定义查询或者更新需要的字段（支持字段排除） | String，Array |
| relation | 启用关联查询 | String |
| validate | 数据自动验证 | Object |
| auto | 数据自动完成 | Object |
| filter | 数据过滤 | Function |
| scope | 命名范围 | String，Object |
| comment | SQL注释 | String |

#### 字段写入和过滤 ####

```Javascript
var data = {
    name: 'hello',
    age: 18,
    test: 'world'
};

// INSERT INTO `user` (`name`,`age`) VALUES ('hello',18)
User.add(data).then(function(result) {});
```

其中`test`字段是不存在的，所以写入数据的时候会自动过滤掉。

如果在`add`方法之前调用`field`方法，则表示只允许写入指定的字段数据，其他非法字段将会被过滤，例如：

```Javascript
var data = {
    name: 'hello',
    email: 'world@orm.com',
    age: 18
};

// INSERT INTO `user` (`name`) VALUES ('hello')
User.field('name').add(data).then(function(result) {});
```

最终只有`name`字段的数据被允许写入，`age`和`email`字段直接被过滤了。

通过`filter`方法可以对数据的值进行过滤处理，例如：

```Javascript
var data = {
    name: 'eventloop',
    email: 'js@\"orm.com'
};

// INSERT INTO `user` (`name`,`email`) VALUES ('eventloop','js@\\\"orm.com')
User.filter(utils.addslashes).add(data).then(function(result) {});
```

#### addAll ####

`addAll`方法支持批量插入，例如：

```Javascript
// INSERT INTO `user` (`age`,`name`) VALUES (21,'lili'),(18,'fangfang')
User.addAll([{ age: 21, name: 'lili' }, { age: 18, name: 'fangfang' }]).then(function(result) {});
```

`addAll`方法的第二个参数表示是否使用`REPLACE`语法。

### 数据读取 ###

在ThinkORM中读取数据的方式很多，通常分为读取数据、读取数据集和读取字段值。

数据查询方法支持的连贯操作方法可以见：[连贯操作](#%E8%BF%9E%E8%B4%AF%E6%93%8D%E4%BD%9C)

> 注意：某些情况下有些连贯操作是无效的，例如limit方法对find方法是无效的。

#### find ####

读取数据是指读取数据表中的一行数据（或者关联数据），主要通过`find`方法完成，例如：

```Javascript
// SELECT * FROM `user` WHERE (status = 1 AND id >= 1) LIMIT 1
User.where('status = 1 AND id >= 1').find().then(function(user) {
    console.log(user);
});
```

`find`方法查询数据的时候可以配合相关的连贯操作方法，其中最关键的则是`where`方法。如何使用`where`方法，移步[where](#where)方法。

如果查询出错，`find`方法会抛出异常，如果查询结果为空返回`null`，查询成功则返回一个对象（键值是字段名或者别名）。 如果上面的查询成功的话，会输出：

```Javascript
{
    id: 1,
    name: 'happen',
    email: '',
    age: 23,
    gender: 'm',
    score: 21,
    status: 1,
}
```

即使满足条件的数据不止一个，`find`方法也只会返回第一条记录（可以通过`order`方法排序后查询）。

#### select ####

读取数据集其实就是获取数据表中的多行记录（以及关联数据），使用`select`方法，使用示例：

```Javascript
// SELECT * FROM `user` WHERE (status = 1) ORDER BY id DESC LIMIT 5
User.where('status = 1').order('id DESC').limit(5).select().then(function(users) {});
```

如果查询出错，`select`方法会抛出异常。如果查询结果为空，则返回空数组，即`[]`。否则返回一个对象数组。

#### getField ####

读取字段值其实就是获取数据表中的某个列的多个或者单个数据，最常用的方法是`getField`方法。

```Javascript
// SELECT `name` FROM `user` WHERE (status = 1)
User.where('status = 1').getField('name').then(function(users) {});
```

默认情况下，当只有一个字段的时候，返回满足条件的数据表中的该字段的第一行的值。

如果需要返回带整个列数据的数组，可以用：

```Javascript
// SELECT `name` FROM `user`
// ['orm', 'nodejs', 'db']
User.getField('name', true).then(function(names) {});
```

如果传入多个字段的话，默认返回一个对象：

```Javascript
// SELECT `id`,`name` FROM `user`
User.getField('id, name', true).then(function(users) {
    // 这里的结果是以id为键，name为值的形式
    // [{ '1': 'orm' }, { '2': 'nodejs' }, { '3': 'db' } ]
    console.log(users);
});
```

再例如更多的字段：

```Javascript
// SELECT `id`,`name`,`email` FROM `user`
User.getField('id, name, email').then(function(users) {
    // [
    //   { '1': { id: 1, name: 'orm', email: 'abc@orm.com' } },
    //   { '2': { id: 2, name: 'nodejs', email: 'test@orm.com' } },
    //   { '3': { id: 3, name: 'db', email: 'apple@orm.com' } }
    // ]
    console.log(users);
});
```

上面结果类似`select`方法的返回结果，区别的是这个结果对象的键名是`id`，准确的说是`getField`方法的第一个字段名。

如果传入一个字符串分隔符给`getField`方法：

```Javascript
User.getField('id, name, email').then(function(users) {
    // [
    //   { '1': 'happen:abc@orm.com' },
    //   { '2': 'shumei:test@orm.com' },
    //   { '3': 'hello:apple@orm.com' }
    // ]
    console.log(users);
});
```

那么返回的结果就是一个数组，键名是`id`，键值是`name:email`的输出字符串。

`getField`方法还可以支持限制数量，例如：

```Javascript
// SELECT `id`,`name` FROM `user` LIMIT 5
User.getField('id, name', 5).then(function(users) {});

// SELECT `name` FROM `user` LIMIT 3
User.getField('name', 3).then(function(users) {});
```

可以配合使用`order`方法使用。更多的查询方法可以移步：[数据查询](#%E6%95%B0%E6%8D%AE%E6%9F%A5%E8%AF%A2)

### 数据更新 ###

ThinkORM的数据更新操作包括更新数据和更新字段方法。

#### save ####

`save`方法支持的连贯操作方法有：

| 方法名  | 作用 | 参数类型 |
| ------ | --- | ------- |
| where  | 查询或者更新条件的定义 | String，Array，Object |
| table  | 定义要操作的数据表名称 | String，Array |
| alias  | 定义当前表的别名      | String |
| order  | 定义结果排序 | String，Object |
| limit  | 定义返回查询结果的数量 | String，Number |
| lock   | 对查询having支持 | Boolean |
| relation | 启用关联查询 | String |
| scope | 命名范围 | String，Object |
| comment | SQL注释 | String |

更新数据使用`save`方法，例如：

```Javascript
var data = {
    name: 'eventloop',
    email: 'js@orm.com'
}

// UPDATE `user` SET `name`='eventloop',`email`='js@orm.com' WHERE (id = 1)
User.where('id = 1').save(data).then(function(result) {});
```

`save`方法的结果是影响的记录数，如果SQL语句有错误，则抛出异常。

为了保证数据库的安全，避免出错更新整个数据表，如果没有任何更新条件，数据对象本身也不包含主键字段的话，`save`方法不会更新任何数据库的记录，因此下面的代码不会更改数据库的任何记录
：

```Javascript
var data = {
    name: 'eventloop',
    email: 'js@orm.com'
};

User.save(data);
```

下面这种形式就可以：

```Javascript
var data = {
    id: 1,
    name: 'eventloop',
    email: 'js@orm.com'
};

User.save(data);
```

如果`id`是数据表的主键的话，ThinkORM自动会把主键的值作为更新条件来更新其他字段的值。

还有一种方法是通过`create`或者`setData`方法创建要更新的数据对象，然后进行保存操作，这样`save`方法的参数可以不需要传入，例如：

```Javascript
// UPDATE `user` SET `name`='eventloop',`email`='js@orm.com',`age`=26 WHERE (id = 1)
User.where('id = 1').setData(data).setData('age', 26).save().then(function(result) {});
```

或者使用`create`方法：

```Javascript
User.create().then(function(data) {
    return User.save();
}).then(function(result) {});
```

#### 字段更新和过滤 ####

和`add`方法一样，`save`方法支持使用`field`方法过滤字段和`filter`方法过滤数据，例如：

```Javascript
var data = {
    name: 'eventloop',
    email: 'js@\"orm.com'
};

// UPDATE `user` SET `email`='js@\\\"orm.com' WHERE (id = 1)
User.where('id = 1').field('email').filter(utils.addslashes).save(data).then(function(result) {});
```

当使用`field('email')`的时候，只允许更新`email`字段的值（使用自定义的`utils.addslashes`方法过滤），`name`字段的值将不会被更新到数据库中。

> filter方法的参数是Function类型的。

#### saveField ####

如果只是更新个别字段的值，可以使用`saveField`方法。

例如只想更新`name`字段的值，那么可以如下例：

```Javascript
// UPDATE `user` SET `name`='newonehere' WHERE (id = 1)
User.where('id = 1').saveField('name', 'newonehere').then(function(result) {});
```

`saveField`方法支持同时更新多个字段，只需要传入对象即可，例如：

```Javascript
var data = {
    name: 'eventloop',
    email: 'js@orm.com'
};

// UPDATE `user` SET `name`='eventloop',`email`='js@orm.com' WHERE (id = 1)
User.where('id = 1').saveField(data).then(function(result) {});
```

#### saveInc ####

而对于统计字段（通常指的是`数值类型`）的更新，ThinkORM还提供了`saveInc`方法。

```Javascript
// UPDATE `user` SET `score`=score+1 WHERE (id = 1)
User.where('id = 1').saveInc('score').then(function(result) {});

// UPDATE `user` SET `score`=score+3 WHERE (id = 1)
User.where('id = 1').saveInc('score', 3).then(function(result) {});
```

#### saveDec ####

同样的，`saveDec`方法也是如此：

```Javascript
// UPDATE `user` SET `score`=score-1 WHERE (id = 1)
User.where('id = 1').saveDec('score').then(function(result) {});

// UPDATE `user` SET `score`=score-5 WHERE (id = 1)
User.where('id = 1').saveDec('score', 5).then(function(result) {});
```

### 数据删除 ###

#### delete ####

ThinkORM删除数据使用`delete`方法, `delete`方法支持的连贯操作方法有：

| 方法名  | 作用 | 参数类型 |
| ------ | --- | ------- |
| where  | 查询或者更新条件的定义 | String，Array，Object |
| table  | 定义要操作的数据表名称 | String，Array |
| alias  | 定义当前表的别名      | String |
| order  | 定义结果排序 | String，Object |
| limit  | 定义返回查询结果的数量 | String，Number |
| lock   | 对查询having支持 | Boolean |
| relation | 启用关联查询 | String |
| scope | 命名范围 | String，Object |
| comment | SQL注释 | String |

例如，表示删除主键为1的数据：

```Javascript
// DELETE FROM `user` WHERE `id` = 1
User.delete(1).then(function(result) {});
```

`delete`方法可以删除单个数据，也可以删除多个数据，这取决于删除条件，例如：

```Javascript
// DELETE FROM `user` WHERE `id` = 1
User.where('id = 1').delete().then(function(result) {});

// DELETE FROM `user` WHERE `id` IN ('100','101','102')
User.delete('100, 101, 102').then(function(result) {});

// DELETE FROM `user` WHERE (status = 0)
User.where('status = 0').delete().then(function(result) {});
```

`delete`方法的返回值是删除的记录数，如果SQL出错将会抛出异常，结果值如果为0表示没有删除任何数据。

也可以用`order`和`limit`方法来限制要删除的个数，例如：

```Javascript
// DELETE FROM `user` WHERE (status = 0) ORDER BY created_at LIMIT 5
User.where('status = 0').order('created_at').limit(5).delete().then(function(result) {});
```

为了避免错删数据，如果没有传入任何条件进行删除操作的话，不会执行删除操作，例如：

```Javascript
User.delete().then(function(result) {});
```

不会删除任何数据，如果你确实要删除所有的记录，除非使用下面的方式：

```Javascript
User.where(1).delete().then(function(result) {});
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

## ActiveRecords ##

ThinkORM实现了`ActiveRecords`模式的ORM模型，采用了非标准的ORM模型：表映射到类，记录映射到对象。最大的特点就是使用方便和便于理解（因为采用了对象化），提供了开发的最佳体验，从而达到敏捷开发的目的。

下面我们用AR模式来换一种方式重新完成CURD操作。

### 创建数据对象 ###

```javascript
User.setData('name', 'hello').setData('age', 18).add().then(function(result) {});
```

如果使用了`create`方法创建数据对象的话，仍然可以在创建完成后进行赋值：

```Javascript
User.create().then(function() {
    return User.setData('age', 18).add();
}).then(function(result) {});
```

### 查询记录 ###

AR模式的数据查询比较简单，因为更多情况下面查询条件都是以主键或者某个关键的字段。这种类型的查询，ThinkORM有着很好的支持。 先举个最简单的例子，假如我们要查询主键为8的某个用户记录，如果按照之前的方式，我们可能会使用下面的方法：

```Javascript
// SELECT * FROM `user` WHERE (id = 8) LIMIT 1
User.where('id = 8').find().then(function(user) {});
```

用AR模式的话可以直接写成：

```Javascript
// SELECT * FROM `user` WHERE (id = 8) LIMIT 1
User.find(8).then(function(user) {});
```

如果要根据某个字段查询，例如查询姓名为ThinkORM的可以用：

```Javascript
// SELECT * FROM `user` WHERE `name` = 'hello' LIMIT 1
User.getBy('name', 'hello').then(function(user) {});
```

这个作为查询语言来说是最为直观的，如果查询成功，查询的结果直接保存在当前的数据对象中，在进行下一次查询操作之前，我们都可以提取，例如获取查询的结果数据：

```Javascript
User.getData('name');

User.getData('age');
```

如果要查询数据集，可以直接使用：

```Javascript
// SELECT * FROM `user` WHERE `id` IN ('1','3','5')
User.select('1, 3, 5').then(function(user) {});
```

### 更新记录 ###

可以直接添加或修改数据对象然后保存到数据库。

```Javascript
// UPDATE `user` SET `name`='eventloop',`age`=26 WHERE (id = 1)
User.where('id = 1').setData({name: 'eventloop', age: 26}).save().then(function(result) {});
```

### 删除记录 ###

可以删除当前查询的数据对象：

```Javascript
// DELETE FROM `user` WHERE `id` = 2
User.delete(2).then(function(result) {});
```

或者直接根据主键进行删除：

```Javascript
// DELETE FROM `user` WHERE `id` IN ('100','101','102')
User.delete('100, 101, 102').then(function(result) {});
```

## 命名范围 ##

在应用开发过程中，使用最多的操作还是数据查询操作，凭借ThinkORM的连贯操作的特性，可以使得查询操作变得更优雅和清晰，命名范围功能则是给模型操作定义了一系列的封装，让你更方便的操作数据。

命名范围功能的优势在于可以一次定义多次调用，并且在项目中也能起到分工配合的规范，避免开发人员在写CURD操作的时候出现问题，项目经理只需要合理的规划命名范围即可。

要使用命名范围功能，主要涉及到模型`_scope`属性的定义和`scope`连贯操作方法的使用。

### _scope ###

我们首先需要为模型定义`_scope`属性。例如，假设是`Article`模型：

```Javascript
var Article = ORM.model('article', function() {
    return {
        _scope: {
            published: {
                where: {
                    status: 1
                }
            },

            latest: {
                order: 'id desc',
                limit: 15
            }
        }
    }
});
```

`_scope`属性是一个数组，每个数组项表示定义一个命名范围，命名范围的定义格式为：

```Javascript
{
    _scope: {
        scopename: {
            attrA: valueA,
            attrB: valueB
        }
    }
}
```

命名范围标识`scopename`：可以是任意的字符串，用于标识当前定义的命名范围名称。

命名范围支持的属性包括：

| 属性名 | 描述 |
| ----- | --- |
| where | 查询条件 |
| field | 查询字段 |
| order | 结果排序 |
| table | 查询表名 |
| limit | 结果限制 |
|  page | 分页查询 |
| having | having查询 |
| group | group查询 |
| lock  | 查询锁定 |
| distinct | 去重查询 |
| cache | 查询缓存 |

每个命名范围的定义可以包括这些属性中一个或者多个。

### scope ###

属性定义完成后，接下来就是使用`scope`方法进行命名范围的调用了，每调用一个命名范围，就相当于执行了命名范围中定义的相关操作选项对应的连贯操作方法。

最简单的调用方式就直接调用某个命名范围，例如：

```Javascript
// SELECT * FROM `article` WHERE `status` = 1
Article.scope('published').select().then(function(articles) {});

// SELECT * FROM `article` ORDER BY id desc LIMIT 15
Article.scope('latest').select().then(function(articles) {});
```

`scope`支持同时调用多个命名范围，例如：

```Javascript
// SELECT * FROM `article` WHERE `status` = 1 ORDER BY id desc LIMIT 15
// Article.scope('latest, published').select().then(function(articles) {});
Article.scope('latest').scope('published').select().then(function(articles) {});
```

如果两个命名范围的定义存在冲突，则后面调用的命名范围定义会覆盖前面的相同属性的定义。

如果调用的命名范围标识不存在，则会忽略该命名范围，例如：

```Javascript
// SELECT * FROM `article` ORDER BY id desc LIMIT 15
Article.scope('latest,normal').select().then(function(articles) {});
```

上面的命名范围中`normal`是不存在的，因此只有`latest`命名范围生效。

### 默认命名范围 ###

ThinkORM支持默认命名范围功能，如果你定义了一个`default`命名范围，例如：

```Javascript
var Article = ORM.model('article', function() {
    return {
        _scope: {
            default: {
                where: {
                    status: 1
                }
            }
        }
    }
});
```

那么调用`default`命名范围可以直接使用：

```Javascript
// SELECT * FROM `article` WHERE `status` = 1
Article.scope().select().then(function(articles) {});
```

而无需再传入命名范围标识名`default`：

```Javascript
Article.scope('default').select().then(function(articles) {});
```

虽然这两种方式是等效的。

### 命名范围调整 ###

假设需要在`latest`命名范围的基础上增加额外的调整，可以使用：

```Javascript
// SELECT * FROM `article` LIMIT 5
Article.scope('latest', { limit: 5 }).select().then(function(articles) {});
```

当然，也可以在两个命名范围的基础上进行调整，例如：

```Javascript
// SELECT * FROM `article` WHERE `status` = 1 ORDER BY id desc LIMIT 5
Article.scope('published, latest', { limit: 5 }).select().then(function(articles) {});
```

### 自定义命名范围 ###

又或者，干脆不用任何现有的命名范围，我直接传入一个命名范围：

```Javascript
// SELECT `id`,`title` FROM `article` WHERE status=1 ORDER BY published_at DESC LIMIT 5
Article.scope({ field: 'id, title', limit: 5, where: 'status=1', order: 'published_at DESC'}).select().then(function(atricle) {});
```

#### 与连贯操作混合使 ####

命名范围一样可以和之前的连贯操作混合使用，例如定义了命名范围`_scope`属性：

```Javascript
var Article = ORM.model('article', function() {
    return {
        _scope: {
            normal: {
                where: 'status = 1',
                field: 'id, title',
                limit: 10
            }
        }
    }
});

// SELECT `id`,`title` FROM `article` WHERE status = 1 LIMIT 8
Article.scope('normal').limit(8).select().then(function(atricle) {});
```

如果定义的命名范围和连贯操作的属性有冲突，则后面调用的会覆盖前面的。如果是这样调用：

```Javascript
// SELECT `id`,`title` FROM `article` WHERE status = 1 LIMIT 10
Article.limit(8).scope('normal').select().then(function(atricle) {});
```

### 动态调用 ###

除了采用`scope`方法调用命名范围外，我们还支持直接调用命名范围名称的方式来动态调用，例如：

```Javascript
// SELECT `id`,`title` FROM `article` WHERE status = 1 LIMIT 5
Article.scope('normal', { limit: 5 }).select().then(function(atricle) {});
```

## 字段映射 ##

ThinkORM的字段映射功能可以让你在表单中隐藏真正的数据表字段，而不用担心放弃自动创建表单对象的功能。

### _map ###

假设`User`表里面有`name`和`email`字段，如果需要映射成另外的字段，那么就需要先定义`_map`属性，例如：

```Javascript
var User = ORM.model('User', function() {
    return {
        _map: {
            username: 'name',
            mail: 'email'
        }
    }
});
```

这样，在表单里面就可以直接使用`username`和`mail`名称作为表单数据提交了。我们使用`create`方法创建数据对象的时候，会自动转换成定义的实际数据表字段。例如：

```Javascript
User.create({ username: 'happen', mail: 'ormmap@orm.com' }).then(function(user) {
    // { name: 'happen', email: 'ormmap@orm.com' }
    console.log(user);
});
```

> 字段映射还可以支持对主键的映射。

### parseFieldsMap ###

使用字段映射后，默认不会对读取的数据会自动处理：

```Javascript
User.find().then(function(user) {
    // { id: 1, name: 'happen', email: 'abcaa@cc.ccom' }
    console.log(user);
});
```

如果想要进行映射之后的字段，可以使用`parseFieldsMap`方法：

```Javascript
User.find().then(function(user) {
    // { id: 1, username: 'happen', mail: 'abcaa@cc.ccom' }
    console.log(User.parseFieldsMap(user));
});
```

通过上面的方式后，无论是`find`还是`select`方法读取后的数据中就包含了`username`和`mail`字段数据了，而不再有`name`和`email`字段数据了。

## 数据验证 ##

数据验证是ThinkORM提供的一种数据验证方法，可以在使用`create`创建数据对象的时候自动进行数据验证。

数据验证有两种方式：

* 静态方式：在定义模型的同时定义`_validate`属性来定义验证规则。
* 动态方式：使用模型类的`validate`方法动态创建自动验证规则。

无论是什么方式，验证规则的定义是统一的规则，定义格式为：

```Javascript
// [验证字段, 验证规则, 错误提示, 验证条件, 附加规则, 验证时间, 附加参数]
['field', 'rule', 'message', 'condition', 'type', 'when', 'params']
```

### 验证规则项 ###

下面就来说明一下以上各项的具体含义。

#### 验证字段 ####

验证字段：必需。

需要验证的表单字段名称，这个字段不一定是数据库字段，也可以是表单的一些辅助字段，例如确认密码和验证码等等。有个别验证规则和字段无关的情况下，验证字段是可以随意设置的。如果定义了[字段映射]()的话，这里的验证字段名称应该是实际的数据表字段而不是表单字段。

#### 验证规则 ####

验证规则：必需。

要进行验证的规则，需要结合附加规则，如果在使用正则验证的附加规则情况下，ThinkORM还内置了一些常用正则验证的规则（[regex]()），可以直接作为验证规则使用，包括：`require` 字段必须、`email` 邮箱、`url` URL地址、`currency` 货币、`number` 数字。

#### 提示信息 ####

提示信息：必需。

用于验证失败后的提示信息定义。

#### 验证条件 ####

验证条件：可选。

条件包含以下几种情况：

* `ThinkORM.EXISTS_VALIDATE`或者0，即存在字段就验证（默认）
* `ThinkORM.MUST_VALIDATE`或者1，即必须验证
* `ThinkORM.VALUE_VALIDATE`或者2，即值不为空的时候验证

#### 附加规则 ####

附加规则：可选。

配合验证规则使用，包括下面一些规则：

| 规则 | 说明 |
| ---- | ---- |
| regex | 正则验证，定义的验证规则是一个正则表达式（默认）|
| function（callback） | 函数（方法）验证，定义的验证规则是一个函数（方法）名 |
| confirm | 验证两个字段的值是否相同，定义的验证规则是一个字段名 |
| equal | 验证是否等于某个值，该值由前面的验证规则定义 |
| notequal | 验证是否不等于某个值，该值由前面的验证规则定义 |
| in | 验证是否在某个范围内，定义的验证规则可以是一个数组或者逗号分割的字符串
| notin | 验证是否不在某个范围内，定义的验证规则可以是一个数组或者逗号分割的字符串 |
| length | 验证长度，定义的验证规则可以是一个数字（表示固定长度）或者数字范围 |
| between | 验证范围，定义的验证规则表示范围，可以使用字符串或者数组 |
| nobetween | 验证不在某个范围，定义的验证规则表示范围，可以使用字符串或者数组 |

#### 验证时间 ####

验证时间：可选。

| 时间 | 说明 |
| ---- | --- |
| ThinkORM.MODEL_INSERT 或者1 | 新增数据时候验证 |
| ThinkORM.MODEL_UPDATE 或者2 | 编辑数据时候验证 |
| ThinkORM.MODEL_BOTH 或者3 | 所有情况下验证（默认） |

这里的验证时间需要注意，并非只有这三种情况，你可以根据业务需要增加其他的验证时间。

#### 附加参数 ####

附加参数：可选。

我们可以为验证函数或方法提供附加参数，以到达期望的验证结果。

### 静态定义 ###

在模型类里面预先定义好该模型的自动验证规则，我们称为静态定义。

举例说明，我们在`User`模型类里面定义的`_validate`属性如下：

```Javascript
var User = ORM.model('User', {
    _validate: [
        ['name', 'require', 'Name must not be empty.', ThinkORM.MUST_VALIDATE],

        ['repasswd', 'passwd', 'Password is incorrect.', ThinkORM.EXISTS_VALIDATE, 'confirm'],

        ['passwd', 'require', 'Password must not be empty.', ThinkORM.EXISTS_VALIDATE, 'regex', ThinkORM.MODEL_INSERT],

        ['email', 'email', 'Invalid email.'],

        ['score', '0, 100', 'Score is incorrect.', ThinkORM.MUST_VALIDATE, 'between'],

        ['slug', utils.checkSlug, 'Parse slug failure.', ThinkORM.MUST_VALIDATE, 'function']
    ]
});
```

定义好验证规则后，就可以在使用`create`方法创建数据对象的时候自动调用：

```Javascript
User.create(data).then(function(user) {
    return User.add();
}).then(function(result) {
    console.log(result);
}).otherwise(function(errMsg) {
    // console.log(User.getError());
    console.log(errMsg);
});
```

在进行自动验证的时候，ThinkORM会对定义好的验证规则进行依次验证。如果某一条验证规则没有通过，则会报错，`getError`方法返回的错误信息（字符串）就是对应字段的验证规则里面的错误提示信息。

一般情况下，`create`方法会自动判断当前是新增数据还是编辑数据（主要是通过表单的隐藏数据添加主键信息），你也可以明确指定当前创建的数据对象是新增还是编辑，例如：

```Javascript
User.create(data, 1).then(function(user) {
    console.log(user);
}).otherwise(function(errMsg) {
    console.log(errMsg);
});
```

`create`方法的第二个参数就用于指定自动验证规则中的验证时间，也就是说`create`方法的自动验证只会验证符合验证时间的验证规则。

我们在上面提到这里的验证时间并非只有这几种情况，你可以根据业务需要增加其他的验证时间，例如，你可以给登录操作专门指定验证时间为4。我们定义验证规则如下：

```Javascript
var User = ORM.model('User', {
    _validate: [
        ['name', 'require', 'Name must not be empty.', 0, 'regex', 4],
    ]
});
```

那么我们可以这样使用`create`方法了：

```Javascript
User.create(data, 4);
```

### 动态验证 ###

如果采用动态验证的方式，就比较灵活，可以根据不同的需要，在操作同一个模型的时候使用不同的验证规则，例如：

```Javascript
var validations = [
    ['name', 'require', 'Name must not be empty.', 1],

    ['email', 'email', 'Invalid email.', 1],

    ['age', '0, 100', 'Age is incorrect.', 1, 'between']
];

User.validate(validations).create({}).then(function(user) {
    console.log(user);
}).otherwise(function(err) {
    console.log(err);
});
```

### 批量验证 ###

ThinkORM支持数据的批量验证功能，只需要在模型类里面设置`isPatchValidate`属性为`true`（ 默认为`false`）

```Javascript
var User = ORM.model('User', {
    isPatchValidate: true
});
```

设置批处理验证后，`getError`方法返回的错误信息是一个对象，返回格式是：

```Javascript
{
    name: 'Name must not be empty.',
    email: 'Invalid email.',
    age: 'Age is incorrect.'
}
```

## 数据填充 ##

数据完成是ThinkORM提供用来完成数据自动处理和过滤的方法，使用`create`方法创建数据对象的时候会自动完成数据处理。

因此，在ThinkORM使用`create`方法来创建数据对象是更加安全的方式，而不是直接通过`add`或者`save`方法实现数据写入。

数据填充通常用来完成默认字段写入，安全字段过滤以及业务逻辑的自动处理等，和自动验证的定义方式类似，数据填充的定义也支持静态定义和动态定义两种方式。

* 静态方式：在模型类里面通过`_auto`属性定义处理规则。
* 动态方式：使用模型类的`auto`方法动态创建自动处理规则。

两种方式的定义规则都采用：

```Javascript
// [填充字段, 填充规则, 填充时间, 附加规则, 附加参数]
['field', 'value', 'type', 'rule', 'params']
```

### 填充规则项 ###

下面就来说明一下以上各项的具体含义。

#### 填充字段 ####

填充字段：必需。

需要进行处理的数据表实际字段名称。

#### 填充规则 ####

填充规则：必需。

需要处理的规则，配合附加规则完成。

#### 填充时间 ####

设置数据填充的时间，包括：

| 时间 | 说明 |
| ---- | --- |
| ThinkORM.MODEL_INSERT 或者1 | 新增数据的时候处理（默认） |
| ThinkORM.MODEL_UPDATE 或者2 | 更新数据的时候处理 |
| ThinkORM.MODEL_BOTH 或者3 | 所有情况都进行处理 |

#### 附加规则 ####

支持的规则如下：

| 规则 | 说明 |
| ---- | --- |
| function（callback） | 函数（方法）验证，定义的验证规则是一个函数（方法）名 |
| field | 用其它字段填充，表示填充的内容是一个其他字段的值 |
| string | 字符串（默认方式） |
| ignore | 为空则忽略 |

#### 附加参数 ####

附加参数：可选。

我们可以为验证函数或方法提供附加参数，以到达期望的验证结果。

### 静态定义 ###

预先在模型类里面定义好自动完成的规则，我们称之为静态定义。例如，我们在模型类定义`_auto`属性：

```Javascript
var User = ORM.model('User', function() {
    return {
        _auto: [
            ['status', 1],

            ['passwd', utils.md5, ThinkORM.MODEL_INSERT, 'function'],

            ['created_at', utils.getTime, ThinkORM.MODEL_INSERT, 'function'],

            ['updated_at', utils.getTime, ThinkORM.MODEL_UPDATE, 'function']
        ]
    }
});
```

然后，就可以在使用`create`方法创建数据对象的时候自动处理：

```Javascript
User.create().then(function(user) {
    console.log(user);
    User.add();
});
```

`create`方法的第二个参数就用于指定自动完成规则中的完成时间，也就是说`create`方法的自动处理规则只会处理符合完成时间的自动完成规则。`create`方法在创建数据的时候，已经自动过滤了非数据表字段数据信息，因此不需要担心表单会提交其他的非法字段信息而导致数据对象写入出错，甚至还可以自动过滤不希望用户在表单提交的字段信息（详见[数据验证](#%E6%95%B0%E6%8D%AE%E9%AA%8C%E8%AF%81)）。

### 动态定义 ###

除了静态定义之外，我们也可以采用动态完成的方式来解决不同的处理规则。

```Javascript
var rules = [
    ['status', 1],

    ['passwd', 'asdasdd', ThinkORM.MODEL_INSERT, 'function'],

    ['created_at', (new Date()).getTime(), ThinkORM.MODEL_INSERT, 'function'],

    ['updated_at', (new Date()).getTime(), ThinkORM.MODEL_UPDATE, 'function']
];

User.auto(rules).create().then(function(user) {
    console.log(user);
});
```

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

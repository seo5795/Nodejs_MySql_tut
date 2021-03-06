
var db = require('./db');
var url = require('url');
var template = require('./template.js');
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');

exports.home = function (request, response) {//api 복수 exports 하나는 module.exports
  db.query(`SELECT * FROM topic`, function (error, topics) {
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(topics);
    var html = template.HTML(title, list,
      `<h2>${title}</h2>${description}`,
      `<a href="/create">create</a><hr>`,
      `
      <form action="/search" method="get">
        <select name="category">
          <option value="title">타이틀</option>
          <option value="author">저자</option>
        </select>
          <input type="text" name="search">
          <input type="submit" value="검색">  
      </form>`);

    response.writeHead(200);
    response.end(html);
  });
}

exports.page = function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  db.query(`SELECT * FROM topic`, function (error, topics) {
    if (error) {
      throw (error);
      //error메시지는 출력하지만 홈페이지에서 나오게되는 코드
    }
    db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], function (error2, topic) {
      if (error2) {
        throw error2;
      }
      var title = topic[0].title;
      //쿼리문으로 불러온 것은 배열형식으로 전달되므로 다음과 같이 사용
      var description = topic[0].description;
      var list = template.list(topics);
      //topic 제목 목록
      var html = template.HTML(title, list,
        `<h2>${sanitizeHtml(title)}</h2>${sanitizeHtml(description)}
            <p>by ${sanitizeHtml(topic[0].name)}</p>`,
        `<a href="/create">create</a>
            <a href="/update?id=${queryData.id}">update</a>
            <form action="delete_process" method="post">
              <input type="hidden" name="id" value="${queryData.id}">
              <input type="submit" value="delete">
            </form><hr>`,
        `
        <form action="/search" method="get">
        <select name="category">
          <option value="title">타이틀</option>
          <option value="author">저자</option>
        </select>
          <input type="text" name="search">
          <input type="submit" value="검색">  
        </form>`,
            );
      response.writeHead(200);
      response.end(html);//html 코드 서버에서 실행시킴
    })
  });
}

exports.search = function (request, response) {//검색 결과 출력페이지
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  console.log(queryData.category);
  var sql='';
  if(queryData.category==='title'){//타이틀로 검색시
     sql='topic.title';
  }else if(queryData.category==='author'){//저자로 검색시
     sql='author.name';
  }
  db.query(`SELECT * FROM topic`,function(error,topics){
    db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE ${sql} LIKE ?`,  ["%" + queryData.search +"%"], function (error, topic) {
      //검색 단어가 포함되어있으면 출력되도록 구현
      var title = 'Search';
      var list = template.list(topics);
      var i= 0;
      var body = '';
      while(i<topic.length){
        body+=`
        <h2>${sanitizeHtml(topic[i].title)}</h2>
        ${sanitizeHtml(topic[i].description)}`
        i+=1;
      }
      var html = template.HTML(title, list,
        body,
        `<a href="/create">create</a>
        <hr>`,
        `
        <form action="/search" method="get">
          <select name="category">
            <option value="title">타이틀</option>
            <option value="author">저자</option>
          </select>
            <input type="text" name="search">
            <input type="submit" value="검색">  
        </form>`);
  
      response.writeHead(200);
      response.end(html);
    });
  })
  
}

exports.create = function (request, response) {
  db.query(`SELECT * FROM topic`, function (error, topics) {
    db.query(`SELECT * FROM author`, function (error2, authors) {
      console.log(authors);
      var title = 'Create';
      var list = template.list(topics);
      var html = template.HTML(sanitizeHtml(title), list,
        ` <form action="/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                <textarea name="description" placeholder="description"></textarea>
              </p>
              <p>
               ${template.authorSelect(authors)}
              </p>
              <p>
                <input type="submit">
              </p>
            </form>`,
        `<a href="/create">create</a><hr>`,
        ``
      );
      response.writeHead(200);
      response.end(html);
    });
  });
}

exports.create_process = function (request, response) {
  var body = '';
  request.on('data', function (data) {
    //포스트 방식으로 많은양의 데이터를 전송할때 조각조각으로 데이터 추가
    body = body + data;
  });
  request.on('end', function () {//더이상 줄 데이터가 없을 때 post에 데이터 객체화후 저장
    var post = qs.parse(body);

    db.query(`
            INSERT INTO topic (title, description, created, author_id) VALUES(?, ?, NOW(), ?)`,
      [post.title, post.description, post.author],
      function (error, result) {
        if (error) {
          throw error;
        }
        response.writeHead(302, { Location: `/?id=${result.insertId}` });
        response.end();
      }
    )
  });
}

exports.update = function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  db.query('SELECT * FROM topic', function (error, topics) {
    if (error) {
      throw error;
    }
    db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], function (error2, topic) {
      if (error2) {
        throw error2;
      }
      db.query(`SELECT * FROM author`, function (error2, authors) {
        var list = template.list(topics);
        var html = template.HTML(sanitizeHtml(topic[0].title), list,
          `
              <form action="/update_process" method="post">
                <input type="hidden" name="id" value="${topic[0].id}">
                <p><input type="text" name="title" placeholder="title" value="${sanitizeHtml(topic[0].title)}"></p>
                <p>
                  <textarea name="description" placeholder="description">${topic[0].description}</textarea>
                </p>
                <p>
                  ${template.authorSelect(authors, topic[0].author_id)}
                </p>
                <p>
                  <input type="submit">
                </p>
              </form>
              `,
          `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a><hr>`,
          ``
        );
        response.writeHead(200);
        response.end(html);
      });

    });
  });
}

exports.update_process = function (request, response) {
  var body = '';
  request.on('data', function (data) {
    body = body + data;
  });
  request.on('end', function () {
    var post = qs.parse(body);
    db.query(`
            UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`, [post.title, post.description, post.author, post.id],
      function (error, result) {
        response.writeHead(302, { Location: `/?id=${post.id}` });
        response.end();
      }
    )
  });
}
exports.delete_process = function (request, response) {
  var body = '';
  request.on('data', function (data) {
    body = body + data;
  });
  request.on('end', function () {
    var post = qs.parse(body);
    var id = post.id;
    db.query('DELETE FROM topic WHERE id = ?', [post.id], function (error, result) {
      if (error) {
        throw error;
      }
      response.writeHead(302, { Location: `/` });
      response.end();
    })
  });
}

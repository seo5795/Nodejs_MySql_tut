var http = require('http');//html페이지를 전달하는데 주로 쓰임
//var fs = require('fs');//파일 처리와 관련된 모듈
var url = require('url');//url정보를 객체로 가져와 분석하거나 url객체를 문자열로 바꿔주는 기능 수행
var qs = require('querystring');//querystring 모듈은 url 객체의 query와 관련된 모듈. url 모듈의 두 번째 인자 값을 조정함으로써 해결할 수도 있다.
var template = require('./lib/template.js');
var path = require('path');//파일/폴더/디렉터리 등의 경로를 편리하게 설정할 수 있는 기능을 제공.
var sanitizeHtml = require('sanitize-html');
var mysql=require('mysql');
var db = mysql.createConnection({
  host: 'localhost',
  user: 'nodejs',
  password: 'tjwjd5795',
  database: 'opentutorials',
  port: '3307'
});
db.connect();

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){
        db.query(`SELECT * FROM topic`, function(error,topics){
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.list(topics);
          var html = template.HTML(title, list,
              `<h2>${title}</h2>${description}`,
              `<a href="/create">create</a>`);
          console.log(topics);
          response.writeHead(200);
          response.end(html);
        });
      } else {
        db.query(`SELECT * FROM topic`, function(error,topics){
          if(error){
            throw(error);
            //error메시지는 출력하지만 홈페이지에서 나오게되는 코드
          }
          db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`,[queryData.id], function(error2,topic){
          if(error2){
            throw error2;
          }
          var title = topic[0].title;
          var description = topic[0].description;
          var list = template.list(topics);
          var html = template.HTML(title, list,
              `
              <h2>${title}</h2>${description}
              <p>by ${topic[0].name}</p>
              `,
              `<a href="/create">create</a>
              <a href="/update?id=${queryData.id}">update</a>
              <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${queryData.id}">
                <input type="submit" value="delete">
              </form>`
          );
          response.writeHead(200);
          response.end(html);
          })
        });
      }
    } else if(pathname === '/create'){
      db.query(`SELECT * FROM topic`, function(error,topics){
        db.query(`SELECT * FROM author`, function(error2, authors){
          console.log(authors); 
          var title = 'Create';
          var list = template.list(topics);
          var html = template.HTML(title, list,
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
              `<a href="/create">create</a>`
              );
        response.writeHead(200);
        response.end(html);
        });
      });
    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);

          db.query(`
            INSERT INTO topic (title, description, created, author_id) VALUES(?, ?, NOW(), ?)`,
            [post.title, post.description, post.author],
            function(error, result){
              if(error){
                throw error;
              }
              response.writeHead(302, {Location: `/?id=${result.insertId}`});
            response.end();
            }
          )
      });
    } else if(pathname === '/update'){
      db.query('SELECT * FROM topic', function(error, topics){
        if(error){
          throw error;
        }
        db.query(`SELECT * FROM topic WHERE id=?`,[queryData.id], function(error2, topic){
          if(error2){
            throw error2;
          }
          db.query(`SELECT * FROM author`, function(error2, authors){
            var list = template.list(topics);
            var html = template.HTML(topic[0].title, list,
              `
              <form action="/update_process" method="post">
                <input type="hidden" name="id" value="${topic[0].id}">
                <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
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
              `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
            );
            response.writeHead(200);
            response.end(html);
          });
         
        });
      });
    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          db.query(`
            UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`, [post.title, post.description, post.author, post.id],
            function(error, result){
              response.writeHead(302, {Location: `/?id=${post.id}`});
            response.end();
            }
          )
      });
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var filteredId = path.parse(id).base;
          db.query('DELETE FROM topic WHERE id = ?', [post.id], function(error,result){
            if(error){
              throw error;
            }
            response.writeHead(302, {Location: `/`});
            response.end();
          })
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);

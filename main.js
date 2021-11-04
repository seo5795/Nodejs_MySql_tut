var http = require('http');//html페이지를 전달하는데 주로 쓰임
//var fs = require('fs');//파일 처리와 관련된 모듈
var url = require('url');//url정보를 객체로 가져와 분석하거나 url객체를 문자열로 바꿔주는 기능 수행
var qs = require('querystring');//querystring 모듈은 url 객체의 query와 관련된 모듈. url 모듈의 두 번째 인자 값을 조정함으로써 해결할 수도 있다.
var template = require('./lib/template.js');//template 모듈 호출
var path = require('path');//파일/폴더/디렉터리 등의 경로를 편리하게 설정할 수 있는 기능을 제공.
var db = require('./lib/db');
var topic = require('./lib/topic');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){//path name이 '/'일 때 를 호출 할때
      if(queryData.id === undefined){//pathnamed이 '/'이고, id값이 없을 때
        topic.home(request, response);
      } else {//path name이 '/'이고, 다른 id 값을 호출 하였을 때
        topic.page(request, response);
      }
    } else if(pathname === '/create'){
      topic.create(request,response);
    } else if(pathname === '/create_process'){
      topic.create_process(request,response);
    } else if(pathname === '/update'){
      topic.update(request, response);
    } else if(pathname === '/update_process'){
      topic.update_process(request,response);
    } else if(pathname === '/delete_process'){
      topic.delete_process(request,response);
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);

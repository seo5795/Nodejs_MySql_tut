var mysql      = require('mysql');//mysql 변수에 mysql 모듈을 할당
var connection = mysql.createConnection({//커넥션변수에 mysql변수에 있는 크리에이트커넥션 메소드를 호출(객체를 받음) 할당
  host     : 'localhost',
  user     : 'nodejs',
  password : 'tjwjd5795',
  database : 'opentutorials',
  port: '3307'
});
 
connection.connect();//위에 선언한 객체들을 가진 커넥션변수의 connect()메서드를 호출하면 db접속이 됨
 
connection.query('SELECT * FROM topic', function (error, results, fields) {
  //커넥션.query 메소드를 호출해서(첫번째인자는 SQL문을 주고, 두번째 인자로 콜백함수를 줌)
  if (error){
      console.log(error);
  }
  console.log(results);
});
 
connection.end()
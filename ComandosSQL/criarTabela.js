var mysql = require('mysql');

var con = mysql.createConnection({
host: "localhost",
user: "root",
password: "",
database: "onepiece",
});

con.connect(function(err) {
    if (err) throw err;
    var sql = "CREATE TABLE tripulacao(id INT AUTO_INCREMENT PRIMARY KEY,capitao VARCHAR(255), bando VARCHAR(255) unique, senha VARCHAR(255))";
    con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Tabela criada");
    });
    con.end();
});
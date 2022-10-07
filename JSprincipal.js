//Declarações usando require
const http = require("http");
const express = require("express");
var session = require('express-session');
const bodyParser = require("body-Parser")
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const app = express();
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const { render } = require("express/lib/response");
const { resourceLimits } = require("worker_threads");

var port = 100;
//conexão mysql

app.use(bodyParser.urlencoded({extended: true}))
app.use( express.static("public") );
app.set('view engine', 'ejs')
app.use(session({secret: '2C44-4D44-WppQ38S',resave: false,saveUninitialized: true}));

//rota 
app.get('/', function(req, res){
    res.render("login.ejs");
});

//rota cadastrar
app.get('/cadastrar', function(req, res){
    res.render('cadastrar.ejs');
});


app.post('/cadastrar/inserir', function(req, res){
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "onepiece"
    }); 

    var nome = req.body['nome'];
    var bando = req.body['bando'];
    var senha = req.body['senha'];
    /*
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
    var oldpath = files.imagem.filepath;
    var newpath = 'C:\Users\Thamiris\Documents\NodeProjects\ProjetoOnePiece\public\imagens' + files.imagem.originalFilename;
    fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        console.log('Arquivo Carregado e Salvo!')
        });
    });
    */
    var sql = "select bando from tripulacao where bando = '"+bando+"'";

    con.connect(function(err) {
        con.query(sql, function (err, result) {
            if (err) throw err;
            if(result.length == 0){
                const saltRounds = 10;
                bcrypt.hash(senha, saltRounds, function(err, hash) {
                    var sql = "insert into tripulacao (capitao, bando, senha) values (?)";
                    var values = [
                        nome, bando, hash
                    ];
                    con.query(sql, [values], function (err, result) {
                        if (err) throw err;
                    });
                    res.redirect('/inicial');
                    con.end();
                });

            }else{
                var mensagem = "Já existe um bando com esse nome. Por favor, insira outro";
                res.render('cadastrarmensagem.ejs', {mensagem});
            }
        });
    });
});

app.post('/desconectar', function(req, res){
    req.session.destroy(function(err) {
        // cannot access session here
    })
    res.redirect('/');
});

app.post('/inicial', function(req, res){
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "onepiece"
    });

    const nome = req.body['nome'];
    const senha = req.body['senha'];
    var sql = "select * from tripulacao where capitao = '"+nome+"'";
    var sql2 = "select * from tripulacao";
    
    if (req.session.loggedin) {
        var sql = "select * from tripulacao";
        con.connect(function(err) {
            con.query(sql, function (err, dados, fields) {
                if (err) throw err;
                res.render('inicial.ejs', {dadosbanco:dados});
            }); 
        });   
    }else{
        if(nome != "" || nome != null || nome != undefined){
            con.connect(function(err) {
                con.query(sql, function (err, result) {
                    if(result.length){
                        bcrypt.compare(senha, result[0]['senha'], function(err, comparacao){
                            if(err) throw err;
                            if(comparacao){
                                req.session.loggedin = true;
                                req.session.username = result[0]['nome'];
                                con.query(sql2, function (err, dados, fields) {
                                    if (err) throw err;
                                    res.render('inicial.ejs', {dadosbanco:dados});
                                }); 
                            }else {
                                res.redirect('/');
                            }
                        });
                    }
                });             
            });
        }else{
            res.redirect('/');
        }
    }    
});

app.post('/inicial/pesquisar', function(req, res){
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "onepiece"
    });

    const pesquisar = req.body['pesquisar'];
    var sql = "select * from tripulacao where capitao like '%"+pesquisar+"%' or bando like '%"+pesquisar+"%'";
    con.connect(function(err) {
        con.query(sql, function (err, dados, fields) {
            if (err) throw err;
            res.render('inicial.ejs', {dadosbanco:dados});
        }); 
    });   
})

//rota inicial
app.get('/inicial', function(req, res){
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "onepiece"
    });

    if (req.session.loggedin) {
            var sql = "select * from tripulacao";
            con.connect(function(err) {
                con.query(sql, function (err, dados, fields) {
                    if (err) throw err;
                    res.render('inicial.ejs', {dadosbanco:dados});
                }); 
            });   
    }else{
        res.redirect("/");
    }         
});

app.post('/inicial/:remover', function(req, res){
    const parametro = req.params['remover'];

    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "onepiece"
    });

    var sql ="delete from tripulacao where id = "+parametro;
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
    }); 

    var sql2 ="select * from tripulacao"
    con.query(sql2, function (err, dados, fields) {
        if (err) throw err;
        res.render('inicial.ejs', {dadosbanco:dados});
    }); 
    con.end();
});

app.post('/editar', function(req, res){
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "onepiece"
    });

    const capitao = req.body['capitao'];
    const novocapitao = req.body['novocapitao'];
    const novobando = req.body['novobando'];
    const novasenha = req.body['novasenha'];
    var sql = "select bando from tripulacao where bando = '"+novobando+"'";

    con.connect(function(err) {
        con.query(sql, function (err, result) {
            if (err) throw err;
            if(result.length == 0){
                if (err) throw err;
                const saltRounds = 10;
                bcrypt.hash(novasenha, saltRounds, function(err, hash) {
                    var sql = "update tripulacao set capitao = '"+novocapitao+"',bando = '"+novobando+"',senha = '"+hash+"'  where capitao = '"+capitao+"'";
                    con.query(sql, function (err, result) {
                        if (err) throw err;
                        res.redirect('/inicial');
                    });
                    con.end();
                });
            }else{
                console.log();
                console.log(novobando);
                if(result[0] == novobando){
                    var mensagem = "Você inseriu um nome de bando igual ao antigo";
                    res.render('editarmensagem.ejs', {mensagem,capitao});
                }else{
                    var mensagem = "Já existe um bando com esse nome. Por favor, insira outro";
                    res.render('editarmensagem.ejs', {mensagem,capitao});
                }
                
            }
        });
    });
});

app.post('/editar/:capitao', function(req, res){
    var capitao = req.params['capitao'];
    res.render('editar.ejs', {capitao});
});

var server = app.listen(port);
console.log('Executando em http://localhost:'+port);
//url: localhost:100
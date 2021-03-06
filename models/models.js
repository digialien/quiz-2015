var path = require('path');

//Postgres DATABASE_URL = postgres://user:passwd@host:port/database
//SQLite   DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name = (url[6]||null);
var user    = (url[2]||null);
var pwd     = (url[3]||null);
var protocol= (url[1]||null);
var dialect = (url[1]||null);
var port    = (url[5]||null);
var host    = (url[4]||null);
var storage = process.env.DATABASE_STORAGE;

//load ORM model
var Sequelize = require('sequelize');

//use SQLite DB
var sequelize = new Sequelize(DB_name, user, pwd, 
	                   {dialect: protocol,
	                    protocol: protocol,
	                    port: port,
	                    host: host,
	                   	storage: storage,
	                    omitNull: true
	                   }
	                );

//import the table defition from quiz.js
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));

//Import the table definition
var comment_path = path.join(__dirname, 'comment');
var Comment = sequelize.import(comment_path);

Comment.belongsTo(Quiz, {onDelete: 'cascade'});
Quiz.hasMany(Comment, {onDelete: 'cascade'});

//export the table Quiz definition
exports.Quiz = Quiz;
//export the table Comment definition
exports.Comment = Comment;

//sequelize.sync() create and initialize the table of questions in DB
sequelize.sync().then(function() {
	// success run the hook once created the table
	Quiz.count().then(function (count){
		console.log('numero de registros: ' + count);
		if (count === 0) {
			Quiz.create({ pregunta: 'Capital de Italia',
		                  respuesta: 'Roma',
		                  tema: 'humanidades'
		              });
			Quiz.create({ pregunta: 'Capital de Portugal', 
		                  respuesta: 'Lisboa'
		              }).then(function() {
		              	   console.log('Base de datos inicializada')
		              	  });
		};
	});
});
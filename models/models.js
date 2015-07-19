var path = require('path');

//load ORM model
var Sequelize = require('sequelize');

//use SQLite DB
var sequelize = new Sequelize(null, null, null, 
	                   {dialect: "sqlite", storage: "quiz.sqlite"}
	                );

//import the table defition from quiz.js
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));

//export the table Quiz definition
exports.Quiz = Quiz;

//sequelize.sync() create and initialize the table of questions in DB
sequelize.sync().success(function() {
	// success run the hook once created the table
	Quiz.count().success(function (count){
		if (count === 0) {
			Quiz.create({ pregunta: 'Capital de Italia',
		                  respuesta: 'Roma'
		              })
			.success(function() {console.log('Base de datos inicializada')});
		};
	});
});
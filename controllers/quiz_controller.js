var models = require('../models/models.js');

var mapTema = {'Otro':'otro', 'Humanidades': 'humanidades', 'Ocio':'ocio', 'Ciencia':'ciencia', 'Tecnologia':'tecnologia'};

exports.load = function(req, res, next, quizId) {
  models.Quiz.find(
    {where: {id: Number(quizId)}, 
     include: [{model: models.Comment}]
   }).then(
    function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else {
        next(new Error('No existe quizId=' + quizId));
      }
    }
  ).catch(function(error) {next(error);});
}

exports.show = function(req, res) {
    res.render('quizes/show', {quiz: req.quiz, errors: []});
};

exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  };
  res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors: []});

};

exports.index = function(req, res) {
  if (req.query.search == undefined || req.query.search == null) {
    models.Quiz.findAll().then(function(quizes) {
      res.render('quizes/index.ejs', {quizes: quizes, errors: []});
    }).catch(function(error){next(error);})
  }
  else {
    var search = req.query.search;
    var search = "%" + search.toLowerCase().trim() + "%";
    search = search.replace(/\s/g, "%");
    models.Quiz.findAll({ where: ["lower(pregunta) like ?", search], order:["pregunta"]}).then(function(quizes) {
      res.render('quizes/index.ejs', {quizes: quizes, errors: []});
    }).catch(function(error){next(error);})
  };
};


exports.author = function(req, res) {
	res.render('author', 
              {autor: 'Qin Jian', urlFoto: '/images/foto.jpg', 
               profesor: 'Juan Quemada', urlFotoProfesor: '/images/juan_quemada.jpg', 
               errors: []});
}

exports.transactionTimeout = function(req, res) {
  res.render('timeout', {errors: []});
}

// GET /quiezes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build(
    {pregunta: "Pregunta", respuesta: "Respuesta"}
  );
  res.render('quizes/new', {quiz: quiz, temas: mapTema, errors: []});
};  

// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build(req.body.quiz);
  quiz.validate().then(
    function(err){
      if (err) {
        res.render('quizes/new', {quiz: quiz, temas:mapTema, errors: err.errors});
      } else {
        quiz.save({fields: ["pregunta", "respuesta", "tema"]}).then(
          function(){
            res.redirect('/quizes');
          }
        );    
      }
    }, function(reason) {
      console.log("DEBUG: " + reason);
    }
  )
};

exports.edit = function(req, res) {
  var quiz = req.quiz;
  res.render('quizes/edit', {quiz: quiz, temas: mapTema, errors: []});
};

exports.update = function(req, res) {
  req.quiz.pregunta = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.tema = req.body.quiz.tema;

  req.quiz.validate().then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz:req.quiz, temas: mapTema, errors: err.errors});
      } else {
        req.quiz.save({fields: ["pregunta", "respuesta", "tema"]})
                .then( function(){ res.redirect('/quizes');});
      }
    })
};

exports.destroy = function(req, res) {
  req.quiz.destroy().then(function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};

exports.getStats = function(req, res) {
  var resultado = {nPreguntas: 0, nComentarios: 0, nPreguntaConComentario: 0};

  models.Quiz.count().then(function(count){
    resultado.nPreguntas = count;
    console.log('numero de preguntas: ' + resultado.nPreguntas);
  });
  
  models.Comment.count().then(function(count){
    resultado.nComentarios = count;
    console.log('numero de comentarios: ' + resultado.nComentarios);
  });
  
  models.Comment.aggregate('QuizId', 'count', {distinct: true}).then(function(count){
    resultado.nPreguntaConComentario = count;
    console.log('numero de preguntas con comentarios: ' + resultado.nPreguntaConComentario);
    for (var key in resultado) {
    	console.log(key + " : " + resultado[key]);
    };
    console.log('el resultado a pasar es: ', resultado);
    res.render('quizes/statistics', {resultado:resultado, errors: []});
  });
  
 


/*  
  if (resultado.nPreguntas != 0) {
    resultado.nComentariosPregunta = resultado.nComentarios / resultado.nPreguntas;
    console.log('numero medio de comentarios por pregunta: ' + resultado.nComentariosPregunta);
  };
    
  models.Comment.aggregate('QuizId', 'count', {distintct: true}).then(function(count){
    resultado.nPreguntaConComentario = count;
    console.log('numero de preguntas con comentarios: ' + resultado.nPreguntaConComentario);
  });

  resultado.nPreguntaSinComentario = resultado.nPreguntas - resultado.nPreguntaConComentario;
  console.log('numero de preguntas sin comentarios: ' + resultado.nPreguntaSinComentario);
*/
}
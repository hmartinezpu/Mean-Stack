'use strict'
var bcrypt= require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');


function getImageFile(req, res){
	var imageFile = req.params.getImageFile;
	var path_file = './uploads/users/'+imageFile;
	fs.exists('./uploads/users/'+imageFile, function(exists){
		if(exists){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(200).send({message:'no existe imagen'});
		}

	});
}

function pruebas(req,res){
	res.status(200).send({
		message: 'probando'
	});
}

function saveUser(req,res){
	var user = new User();
	var params= req.body;
	 console.log(params);

	user.name=params.name;
	user.surname= params.surname;
	user.email= params.email;
	user.role= 'ROLE_ADMIN';
	user.image= 'null';

	if(params.password){
		//encriptar y guardar
		bcrypt.hash(params.password,null,null, function(err,hash){
			user.password=hash;
			if(user.name!=null && user.surname !=null && user.email!=null){
					user.save((err,userStored)=>{
						if(err){
								res.status(500).send({message:"Error al guardar el usuario"});
						}else{
							if (!userStored) {
								res.status(404).send({message:"No se ha registrado usuario"});
							}else{
								res.status(200).send({user:userStored});

							}
						}
					});
			}else{
				res.status(200).send({message:'introduce lo datos'});
			}
		})
	}else{
		res.status(200).send({message:'introduce la contraseña'});
	}
}

function loginUser(req,res){
	var params = req.body;

	var email= params.email;
	var password = params.password;

	User.findOne({email:email}, (err,user)=>{
		if(err){
			res.status(500).send({message: 'error'});
		}else{
			if(!user){
				res.status(404).send({message:'el usuario no existe'});
			}else{
				//comprobar contra
				bcrypt.compare(password,user.password,function(err,check){
					if(check){
						//devolver datos de usuario
						if(params.gethash){
							res.status(200).send({
								token: jwt.createToken(user)
							});
						}else {
						res.status(200).send({user});
						}
					}else{
						res.status(404).send({message:'el usuario no ha podido loguearse'});
					}
				});
			}
		}

	});
}
function uploadImage(req,res){
	var userId= req.params.id;
	var file_name= 'No Subido';
		console.log(req.files);
	if(req.files){
		var file_path= req.files.image.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2];  
		var ext_split = file_name.split('\.');
		var fileext = ext_split[1]; 
			console.log(file_path);
		if(fileext=='png' || fileext =='jpg' || fileext =='gif'){
			User.findByIdAndUpdate(userId,{image: file_name}, (err,userUpdated)=>{	

				if(err){
 			res.status(500).send({message:'Error al actualizar el usuario'});
 				}else{
 			if(!userUpdated){
 				res.status(404).send({message:'El usuario no se ha podido actualizar'})
 				}else{
 				res.status(200).send({user: userUpdated});
 			}
 		}


				});
		}else{
			res.status(200).send({message:'Extención de imagen no válida'});
		}
		console.log(file_path);
	}else{
		res.status(200).send({message:'No ha subido imagen...'});

	}
}


 function updateUser(req, res){
 	var userId = req.params.id;
 	var update = req.body;
 	User.findByIdAndUpdate(userId,update,(err,userUpdated)=>{
 		if(err){
 			res.status(500).send({message:'Error al actualizar el usuario'});
 		}else{
 			if(!userUpdated){
 				res.status(404).send({message:'El usuario no sse ha podido actualizar'})
 			}else{
 				res.status(200).send({user: userUpdated});
 			}
 		}
 	});
 }
module.exports = {
	pruebas,
	saveUser,
	loginUser,
	updateUser,
	uploadImage,
	getImageFile
};
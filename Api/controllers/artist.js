'use strict'

var path =  require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination')
var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');
function getArtist(req,res){
	var artistId = req.params.id;
	Artist.findById(artistId,(err, artist)=>{
		if(err){
			res.status(500).send({message:'Error en la petición'});

		}else{
			if(!artist){
				res.status(404).send({message:'El atista no existe'});
			}else{
				res.status(200).send({artist});
			}
		}
	});
	
}
function updateArtist(req, res) {
    var artistId = req.params.id;
    var update = req.body;
    Artist.findByIdAndUpdate(artistId, update, (err, artistUpdated) => {
        if (err) {
            res.status(500).send({
                message: 'Error al guardar el artista'
            });
        } else {
            if (!artistUpdated) {
                res.status(404).send({
                    message: 'No se ha actualizado el artista'
                });
            } else {
                return res.status(200).send({
                    artist: artistUpdated
                });
            }
        }
    });
}

function getArtists(req,res){
	var page;
	if(req.params.page)
	page = req.params.page;
	else{
	 page = 1;
	}
	var itemsPerPage = 3;

	Artist.find().sort('name').paginate(page, itemsPerPage, function(err, artists, total) {
        if (err) {
            res.status(500).send({
                message: 'Error en la peticion.'
            });
        } else {
            if (!artists) {
                res.status(4040).send({
                    message: 'No hay artistas'
                });
            } else {
                return res.status(200).send({
                    pages: total,
                    artists: artists
                });
            }
        }
    });

}

function deleteArtist(req, res) {
    var artistId = req.params.id;
    Artist.findByIdAndRemove(artistId, (err, artistRemoved) => {
        if (err) {
            res.status(500).send({
                message: 'Error al eliminar el artista'
            });
        } else {
            if (!artistRemoved) {
                res.status(404).send({
                    message: 'El artista no ha sido eliminado'
                });
            } else {
                Album.find({
                    artist: artistRemoved._id
                }).remove((err, albumRemoved) => {
                    if (err) {
                        res.status(500).send({
                            message: 'Error al eliminar los albums del artista'
                        });
                    } else {
                        if (!artistRemoved) {
                            res.status(404).send({
                                message: 'Los albums no han sido eliminados'
                            });
                        } else {
                            Song.find({
                                album: albumRemoved._id
                            }).remove((err, songRemoved) => {
                                if (err) {
                                    res.status(500).send({
                                        message: 'Error al eliminar las canciones del album'
                                    });
                                } else {
                                    if (!songRemoved) {
                                        res.status(404).send({
                                            message: 'La cancion no ha sido eliminada'
                                        });
                                    } else {
                                        res.status(200).send({
                                            message: 'El artista ha sido eliminado',
                                            artist: artistRemoved
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    });
}
function uploadImage(req, res) {
    var artistId = req.params.id;
    var file_name = "No subido...";
    if (req.files) {
        var file_path = req.files.image.path;
        //variables para sacar el nombre del archivo 
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        //variables para obtener la extencion del archivo
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        // console.log(file_path);
        console.log(ext_split);
        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'JPG' || file_ext == 'gif') {
            Artist.findByIdAndUpdate(artistId, {
                image: file_name
            }, (err, artistUpdated) => {
                if (err) {
                    res.status(500).send({
                        message: ' Error al actualizar el usuario'
                    });
                } else {
                    if (!artistUpdated) {
                        res.status(404).send({
                            message: ' No se ha podido actualizar el usuario'
                        });
                    } else {
                        res.status(200).send({
                            artist: artistUpdated
                        });
                    }
                }
            });
        } else {
            res.status(200).send({
                message: 'Extension del archivo no valida'
            });
        }
    } else {
        res.status(200).send({
            message: 'No has subido ninguna imagen'
        });
    }
}


function saveArtist(req,res){
	var artist = new Artist();
	var params =  req.body;
	artist.name= params.name;
	artist.description = params.description;
	artist.image = 'null';

	artist.save((err, artistStored) =>{
			if(err){
				res.status(500).send({message:'error en guardar'})
			}else{
				if(artistStored){
					res.status(200).send({artist:artistStored});
					
				}else{
					res.status(404).send({message:'Elartista no ha sido guardado'})
				}
			}
	});

}
function getImageFile(req,res){
    var image_file  = req.params.imageFile;
    var path_file = './uploads/artists/'+ image_file;
    fs.exists(path_file, function(exists){
        if(exists){
            res.sendFile(path.resolve(path_file));
        } else {
          res.status(200).send({message:  'No existe la imagen'});
        }

    });

}

module.exports = {
    getArtist,
    saveArtist,
    getArtists,
    getImageFile,
    updateArtist,
    deleteArtist,
    uploadImage

}
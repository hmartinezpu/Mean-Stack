'use strict'
var mongoose=require("mongoose");
var Schema = mongoose.Schema;

var AlbumSchema=Schema({
	title: String,
	description:String,
	year: Number,
	image: String,
	artits: {type:Schema.Types.ObjectId,ref:'artists'}
});

module.exports=mongoose.model('Album',AlbumSchema);
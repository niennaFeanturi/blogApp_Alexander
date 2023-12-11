//const mongoose = require("mongoose");
const dynamoose = require("dynamoose");

const postSchema = new dynamoose.Schema({
  postId: {
    type: String,
    hashKey: true,
    required: true,
    default: () => Math.random().toString(36).substring(2),
  },
  username: {
    type: String,
    required: true,
    validate: (val) => /^[a-zA-Z0-9]+$/.test(val),
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

module.exports = dynamoose.model("Post", postSchema);


//const postSchema = new mongoose.Schema({
//	username: {
	//	type: String,
	//	lowercase: true,
	//	required: [ true, "can't be blank" ],
	//	match: [ /^[a-zA-Z0-9]+$/, 'Invalid username' ],
	//	index: true,
	//	unique: true
//	},
//	title: { type: String, required: [ true, "can't be blank" ] },
//	content: { type: String, required: [ true, "can't be blank" ] }
//});

//module.exports = mongoose.model("Post", postSchema);
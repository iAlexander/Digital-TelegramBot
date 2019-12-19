const {
	Schema,
	model
} = require("mongoose");

const userSchema = new Schema({
	id: Number,
	first_name: String,
	last_name: String,
	chat_id: Number,
	isAdmin: Boolean,
	balance: {
		type: Number,
		default: 100
	}
});

const userModel = new model('User', userSchema);

module.exports = userModel;
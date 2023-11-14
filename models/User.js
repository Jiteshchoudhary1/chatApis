const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
}, { timestamps: true })

module.exports = mongoose.model("User", userSchema);
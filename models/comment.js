var mongoose    = require("mongoose");

mongoose.connect("mongodb://localhost/yelp_camp_v11");
mongoose.Promise = global.Promise;

var commentSchema = mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});


module.exports = mongoose.model("Comment", commentSchema);
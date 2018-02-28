var mongoose    = require("mongoose");

mongoose.connect("mongodb://localhost/yelp_camp_v11");
mongoose.Promise = global.Promise;

//================================================
//SCHEMA SETUP
//================================================

var campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    description: String,
    address: {
        street: String,
        number: Number,
        postal_code: String,
        city: String,
        country: String
    },
    location: String,
    lat: Number,
    lng: Number,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment"
            }
        ]
});

module.exports = mongoose.model("Campground", campgroundSchema);
var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var geocoder = require("geocoder");
var request = require("request");


//INDEX - show all campgrounds

router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds: allCampgrounds, page: "campgrounds"});
       }
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var address = {
        street: req.body.street,
        number: req.body.number,
        postal_code: req.body.postal_code,
        city: req.body.city,
        country: req.body.country
    };
    var location = address.street + " " + address.number + " " + address.city + " " + address.country;
      geocoder.geocode(location, function (err, data) {
    if (err || data.status === 'ZERO_RESULTS') {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newCampground = {name: name, image: image, description: desc, price: price, author:author, address: address, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });
});



//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found!");
            res.redirect("back");
        } else {
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership,  function(req, res) {
        Campground.findById(req.params.id, function(err, foundCampground) {
            console.log(foundCampground);
            res.render("campgrounds/edit", {campground: foundCampground});
        });
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", /*isSafe,*/ function(req, res){
    var address = {
        street: req.body.campground.street,
        number: req.body.campground.number,
        postal_code: req.body.campground.postal_code,
        city: req.body.campground.city,
        country: req.body.campground.country
    };
    var location = address.street + "%20" + address.number + "%20" + address.city + "%20" + address.country;
    var url = "https://maps.google.com/maps/api/geocode/json?address=" + location;
    request(url, function(err, response, body) {
        let address = JSON.parse(body);
        console.log(address);
        console.log(address.status);
        if (err || address.status != 'OK') {
            req.flash('error', "Invalid address or something went wrong");
            return res.redirect('back');
        } else {
            let location = address.results[0].formatted_address;
            let lat = address.results[0].geometry.location.lat;
            let lng = address.results[0].geometry.location.lng;
            var newData = {name: req.body.campground.name, image: req.body.campground.image, description: req.body.campground.description, price: req.body.campground.price, address: address, location: location, lat: lat, lng: lng};
            Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("back");
                } else {
                    req.flash("success", "Successfully updated!");
                    res.redirect("/campgrounds/"+campground._id);
                }
            });
        }
    });
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(err) {
        if (err){
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;

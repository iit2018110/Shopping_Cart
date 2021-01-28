var Product = require('../models/product')
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shopping', { useNewUrlParser: true, useUnifiedTopology: true });

var products = [
    new Product({
        imagePath: "https://www.mydesignation.com/wp-content/uploads/2019/03/shammi-tshirt-image-unisex-mydesignation-.jpg",
        title: "Nikey",
        description: "Just Awesome!!",
        price: 10
    }),
    new Product({
        imagePath: "https://www.mydesignation.com/wp-content/uploads/2019/03/shammi-tshirt-image-unisex-mydesignation-.jpg",
        title: "Nikey",
        description: "Just Awesome!!",
        price: 10
    }),
    new Product({
        imagePath: "https://www.mydesignation.com/wp-content/uploads/2019/03/shammi-tshirt-image-unisex-mydesignation-.jpg",
        title: "Nikey",
        description: "Just Awesome!!",
        price: 10
    }),
    new Product({
        imagePath: "https://www.mydesignation.com/wp-content/uploads/2019/03/shammi-tshirt-image-unisex-mydesignation-.jpg",
        title: "Nikey",
        description: "Just Awesome!!",
        price: 10
    }),
];

var count = 0;
for(var i = 0; i < products.length; ++i) {
    products[i].save((err,result)=>{
        count++;
        if(count === products.length) {
            exit();
        }
    })
}

function exit() {
    mongoose.disconnect();
}
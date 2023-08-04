const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    reviews:
    {
        totalRating:Number,
        totalRatingCount:Number,
        uid: String,
        review: [
            {
                reviewerId:String,
                profilePic:String,
                time: String,
                userRating: Number,
                review: String
            }
        ]
    }
});

const Review = mongoose.model('reviews',reviewSchema);

module.exports = Review;
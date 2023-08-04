const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    totalRating: Number,
    totalRatingCount: Number,
    uid: String,
    reviewList: [
        {
            reviewerId: String,
            profilePic: String,
            reviewDate: String,
            userRating: Number,
            review: String
        }
    ]
});

const Review = mongoose.model('reviews', reviewSchema);

module.exports = Review;
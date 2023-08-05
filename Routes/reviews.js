const express = require('express');
const router = express.Router();

const Review = require('../models/Reviews');

router
    .get('/getReviews', async (req, res) => {
        const id = req.query.id;
        const review = await Review.findOne({uid:id});
        res.send(review);
    })
    .post('/addReviews', (req, res) => {
        setReview(req.body);
        res.status(200).json('sucess');
    })

async function setReview(reviewData) {
    const { rating, review, senderId, recepientId,profilePic,name } = reviewData;
    const dateTime = new Date()
    const date = dateTime.toLocaleString('default', { month: 'long', day: '2-digit' });
    const reviewMessage = {
        name:name,
        reviewerId: senderId,
        profilePic: profilePic,
        reviewDate: date,
        userRating: rating,
        review: review
    }

    try {  
        const existingReviewsList = await Review.findOne({ uid: recepientId }).orFail();
        let newTotalRating;
        const previousTotalRating = existingReviewsList.totalRating;
        const totalRatingCount = existingReviewsList.totalRatingCount;
        const reviewerIndex = existingReviewsList.reviewList.findIndex(entry => entry.reviewerId === senderId);

        if (reviewerIndex === -1) {
             newTotalRating = ((previousTotalRating * totalRatingCount) + rating) / (totalRatingCount + 1);
             existingReviewsList.totalRatingCount += 1;
            existingReviewsList.reviewList.push(reviewMessage);
        } else {
            const previousRating = existingReviewsList.reviewList[reviewerIndex].userRating;
            newTotalRating = ((previousTotalRating * totalRatingCount) - previousRating + rating) / totalRatingCount;
            existingReviewsList.reviewList[reviewerIndex]= reviewMessage;
        }

        existingReviewsList.totalRating = newTotalRating.toFixed(1);
        existingReviewsList.save();

    } catch (err) {
        await new Review({
            uid: recepientId,
            totalRating: rating,
            totalRatingCount: 1,
            reviewList: [reviewMessage]
        }).save();
    }
}

module.exports = router
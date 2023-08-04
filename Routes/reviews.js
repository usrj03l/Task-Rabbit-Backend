const express = require('express');
const router = express.Router();

const Review = require('../models/Reviews');

router
    .get('/getReviews', (req, res) => {
        console.log('getReviews');
        res.json('200')
    })
    .post('/addReviews', (req, res) => {

        setReview(req.body);

    })

async function setReview(reviewData) {
    const { rating, review, senderId, recepientId } = reviewData;
    const dateTime = new Date()
    const date = dateTime.toLocaleString('default', { month: 'long', day: '2-digit' });
    const reviewMessage = {
        reviewerId: senderId,
        profilePic: '',
        reviewDate: date,
        userRating: rating,
        review: review
    }

    try {

        const existingReviewsList = await Review.findOne({ uid: recepientId }).orFail();

        

        // const previousTotalRating = existingReviewsList.totalRating;
        // const totalRatingCount = existingReviewsList.totalRatingCount;
        // let newTotalRating;
        // const reviewerIndex = existingReviewsList.reviewList.findIndex(entry => entry.reviewerId === senderId);
        // console.log(reviewerIndex);

        // if (reviewerIndex !== -1) {
        //     newTotalRating = ((previousTotalRating * totalRatingCount) + rating) / (totalRatingCount + 1);
        //     existingReviewsList.totalRatingCount += 1;
        //     existingReviewsList.reviewList.push(reviewMessage);
        // } else {
        //     // previousTotalRating = abs(previousTotalRating - existingReviewsList.reviewList[reviewerIndex].userRating);
        //     // newTotalRating = ((previousTotalRating * totalRatingCount) + rating) / (totalRatingCount + 1);
        //     //     newTotalRating = (previousTotalRating * totalRatingCount + ratingDifference) / totalRatingCount;
        //     //     existingReviewsList.reviewList[reviewerIndex] = reviewMessage;
        // }

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
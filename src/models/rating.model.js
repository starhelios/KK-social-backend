const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const ratingSchema = mongoose.Schema({
  experience: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Experience',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
});

// add plugin that converts mongoose to json
ratingSchema.plugin(toJSON);
ratingSchema.plugin(paginate);

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;

const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const ratingSchema = mongoose.Schema({
  specificExperience: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Specific Experience',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

// add plugin that converts mongoose to json
ratingSchema.plugin(toJSON);
ratingSchema.plugin(paginate);

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;

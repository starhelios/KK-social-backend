const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const specificExperienceSchema = mongoose.Schema({
  experience: { type: mongoose.SchemaTypes.ObjectId, ref: 'Experience' },
  imageUrl: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  usersGoing: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }],
  reservations: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Reservation' }],
});

// add plugin that converts mongoose to json
specificExperienceSchema.plugin(toJSON);
specificExperienceSchema.plugin(paginate);

const SpecificExperience = mongoose.model('Specific Experience', specificExperienceSchema);

module.exports = SpecificExperience;

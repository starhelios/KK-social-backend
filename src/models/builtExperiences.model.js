const mongoose = require('mongoose');

const builtexperiencesSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    required: true,
  },
  meetingId: {
    type: String,
  },
  meetingPassword: {
    type: String,
  },
});

const BuiltExperience = mongoose.model('BuiltExperience', builtexperiencesSchema);

module.exports = BuiltExperience;

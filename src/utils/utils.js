const uuid = require('node-uuid');

function assignId(req, res, next) {
  req.id = uuid.v4();
  next();
}

function generateResponse(status, payload, message) {
  if (status) {
    return { payload, error: { status: false, message } };
  }
  return { payload: null, error: { status: true, message } };
}

module.exports = {
  assignId,
  generateResponse,
};

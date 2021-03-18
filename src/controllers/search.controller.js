const catchAsync = require('../utils/catchAsync');
const { generateResponse } = require('../utils/utils');
const { Experience } = require('../models');
const { User } = require('../models');

const search = catchAsync(async (req, res) => {
  const { keyword, location } = req.body;

  const userQuery = {
    $or: [{ fullname: { $regex: new RegExp(`.*${keyword}.*`, 'i') } }, { aboutMe: { $regex: new RegExp(`.*${keyword}.*`, 'i') } }],
    isHost: true,
  };

  if (location.length > 0) {
    const searchLocation = location.replace(', USA', '');
    userQuery.location = { $regex: new RegExp(`.*${searchLocation}.*`, 'i') };
  }
  
  const users = await User.find(userQuery).exec();

  const { categoryName, startDay, endDay, minPrice, maxPrice } = req.body;

  // const query = { $or: [{ title: { $regex: `${keyword}` } }, { description: { $regex: `${keyword}` } }] };

  const query = { };
  if (categoryName.length > 0) {
    query.categoryName = { $in: categoryName };
  }

  if (startDay && endDay) {
    query.startDay = { $lte: endDay };
    query.endDay = { $gte: startDay };
  }

  if (minPrice && maxPrice) {
    query.price = { $gte: minPrice, $lte: maxPrice };
  }

  if (location != '' && users.findIndex((u) => u.id == item.userId) < 0) {
    return false;
  }

  const allExperiences = await Experience.find(query).exec();
  const experiences = allExperiences.filter((item) => {
    const today = new Date();
    const eDay = new Date(item.endDay);
    if (eDay < today) {
      return false;
    }

    if (location != '' && users.findIndex((u) => u.id == item.userId) < 0) {
      return false;
    }
    
    if (keyword != '') {
      if (item.title.toLowerCase().includes(keyword.toLowerCase()) == false && item.description.toLowerCase().includes(keyword.toLowerCase()) == false) {
        if (users.findIndex((u) => u.id == item.userId) < 0) {
          return false;
        }
      }
    }

    return true;   
  });

  res.send(generateResponse(true, { hosts: users, experiences }));
});

module.exports = {
  search,
};

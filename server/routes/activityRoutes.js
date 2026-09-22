const express = require('express');
const router = express.Router();
const {
  createActivity,
  getActivities,
  getActivityById,
  deleteActivity
} = require('../controllers/activityController');

router.route('/')
  .post(createActivity)
  .get(getActivities);

router.route('/:id')
  .get(getActivityById)
  .delete(deleteActivity);

module.exports = router;

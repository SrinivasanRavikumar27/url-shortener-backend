const urlRouter = require('express').Router();
const urlController = require('../controllers/urlController.js');
const middleware = require('../middleware/authMiddleware.js');

urlRouter.get('/getUrl',middleware.verifyToken,urlController.getAllUrl);
urlRouter.post('/createUrl',middleware.verifyToken,urlController.createUrl);
urlRouter.get('/shortUrl/:shortUrl',middleware.verifyToken,urlController.getShortUrl);
urlRouter.get('/dayWise',middleware.verifyToken,urlController.dayWise);
urlRouter.get('/monthWise/:month/:year',middleware.verifyToken,urlController.monthWise);

module.exports = urlRouter;
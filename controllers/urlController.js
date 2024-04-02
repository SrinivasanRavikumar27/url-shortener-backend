const urlModel = require("../models/urlModel.js");
const clicksModel = require("../models/clicksModel.js");
const { Info, Error } = require("../utils/logger.js");

// ---------------------------------------------------------------------------------

const urlController = {
  // get all url
  getAllUrl: async (request, response) => {
    try {
      const userid = request.userId;

      const urls = await urlModel.find(
        { userid: userid },
        { urlid: 1, url: 1, shortUrl: 1, clicks: 1 }
      );

      if (urls) {
        response
          .status(200)
          .json({ message: "datas fetched sucessfully", data: urls });
      } else {
        response.status(401).json({ message: "No data found" });
      }
    } catch (error) {
      response.status(500).json({ message: error });
    }
  },

  // ------------------------------------------------------------------------------------------

  // create url
  createUrl: async (request, response) => {
    try {
      const userid = request.userId;

      const { url, shortUrl } = request.body;

      const urlCount = await urlModel.find().countDocuments();

      let urlId = "";

      if (urlCount < 10) {
        urlId = "Url00" + urlCount;
      } else if (urlCount < 100) {
        urlId = "Url0" + urlCount;
      } else {
        urlId = "Url" + urlCount;
      }

      const existingUrl = await urlModel.findOne(
        { url: url, userid: userid },
        { url: 1 }
      );

      const existingShortUrl = await urlModel.findOne(
        { shortUrl: shortUrl, userid: userid },
        { shortUrl: 1 }
      );

      if (existingUrl) {
        response.status(401).json({ message: "URL already exists." });
      } else if (existingShortUrl) {
        response.status(401).json({ message: "Short URL already exists." });
      } else {
        const urlObject = new urlModel({
          urlid: urlId,
          url: url,
          shortUrl: shortUrl,
          userid: userid,
        });

        const savedUrl = await urlObject.save();

        if (savedUrl) {
          response.status(200).json({ message: "url created sucessfully." });
        }
      }
    } catch (error) {
      response.status(500).json({ message: error });
    }
  },

  // ------------------------------------------------------------------------------------------

  //   Get the original URL from Short Url and redirect to that page
  getShortUrl: async (request, response) => {
    try {
      const { shortUrl } = request.params;

      const url = await urlModel.findOne({ shortUrl: shortUrl });

      if (url) {
        const clicksObject = new clicksModel({
          urlid: url.urlid,
          userid: url.userid,
          clicks: 1,
        });

        const checkUrl = await clicksModel.findOne({ urlid: url.urlid });

        let savedClicks = null;

        if (checkUrl != null && checkUrl) {
          savedClicks = await clicksModel.findOneAndUpdate(
            { urlid: url.urlid },
            { $inc: { clicks: 1 }, $set: { updatedAt: new Date() } },
            { new: true }
          );
        } else {
          savedClicks = await clicksObject.save();
          Info(savedClicks);
        }

        if (savedClicks != null && savedClicks) {
          const increaseClicks = await urlModel.findOneAndUpdate(
            { url: url.url }, // Find the document by the URL
            { $inc: { clicks: 1 }, $set: { updatedAt: new Date() } }, // Increment the clicks field by 1
            { new: true } // Return the updated document
          );

          if (increaseClicks) {
            response.status(200).json({ url: url });
          }
        } else {
          response.status(401).json({ message: "Error in saving Clicks" });
        }
      } else {
        response
          .status(401)
          .json({ message: "URL not found for the given short URL" });
      }
    } catch (error) {
      Error(error);
      response.status(500).json({ message: error });
    }
  },

  // ------------------------------------------------------------------------------------------

  dayWise: async (request, response) => {
    try {
      const startDate = new Date();
      startDate.setUTCHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);

      const clicks = await clicksModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lt: endDate,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalClicks: {
              $sum: "$clicks",
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalClicks: 1,
          },
        },
      ]);

      if (clicks && clicks.length > 0) {
        response
          .status(200)
          .json({ message: "data fetched successfully", clicks: clicks.map(click => click.totalClicks) });
      } else {
        response.status(200).json({ message: "no data found", clicks: 0 });
      }
    } catch (error) {
      Error("Error fetching data: ", error.message);
      response.status(500).json({ message: error.message });
    }
  },

  // ------------------------------------------------------------------------------------------

  monthWise: async (request, response) => {
    try {
      const year = Number(request.params.year);
      const month = Number(request.params.month);

      // Define the start and end dates for the range
      const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0));
      const endOfMonth = new Date(
        Date.UTC(year, month + 1, 0, 23, 59, 59, 999)
      );

      // Create a list of all dates in the range in string format
      let dateList = [];
      let currentDate = new Date(startOfMonth);
      while (currentDate <= endOfMonth) {
        const dateString = currentDate.toISOString().split("T")[0]; // Extract yyyy-mm-dd from ISO date format
        dateList.push(dateString);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Aggregate to get the total clicks for each date
      const aggregationResult = await clicksModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfMonth,
              $lte: endOfMonth,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            totalClicks: { $sum: "$clicks" },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            totalClicks: 1,
          },
        },
        {
          $sort: { date: 1 },
        },
      ]);

      if (aggregationResult.length > 0) {
        // Create a map of dates to total clicks for quick lookup
        const clicksMap = new Map();
        aggregationResult.forEach((result) => {
          clicksMap.set(result.date, result.totalClicks);
        });

        // Create the final result by merging the list of dates with the aggregated data
        const finalResult = dateList.map((dateString) =>
          clicksMap.has(dateString) ? clicksMap.get(dateString) : 0
        );

        // Send the final result as a response
        response.status(200).json(finalResult);
      } else {
        // If there are no results in the database yet.

        // Create a map of dates to total clicks for quick lookup
        const clicksMap = new Map();

        // Create the final result by merging the list of dates with the aggregated data
        const finalResult = dateList.map((dateString) =>
          clicksMap.has(dateString) ? clicksMap.get(dateString) : 0
        );

        // Send the final result as a response
        response.status(200).json(finalResult);
      }
    } catch (error) {
      Error(`Error occurred while processing request: ${error}`);
      // Handle any errors that occur during the aggregation query
      response.status(500).json({ message: error.message });
    }
  },

  // ------------------------------------------------------------------------------------------
};

module.exports = urlController;

const RealTimeLocation = require("../models/realTimeLocation");
const User = require("../models/user");
const contributorData = require("../models/appUtility");
const {
  calculateDistance,
  dynamicSort,
  isCurrentContributorAvailable,
} = require("../helpers/functions");

const { calculateWeightMs } = require("../helpers/MathFunctions");
const { default: mongoose } = require("mongoose");

const addNewLocation = async (req, res) => {
  const {
    latitude1: latitude,
    longitude1: longitude,
    busNumber,
    heading,
    ms,
    _id,
  } = req.body;

  // find to contributor how sitted in the bus
  const getCurrentContributor = await contributorData
    .findOne({
      busNumber,
    })
    .select("_id currentContributor previousFiveContributor "); // User Data
  // console.log({ _id, getCurrentContributor });
  // because after assigning the user we want to store data only who becomes a contributor from the assing method
  if (getCurrentContributor?.currentContributor?.toString() === _id) {
    await RealTimeLocation.create({
      latitude: +latitude || 0,
      longitude: +longitude || 0,
      busNumber,
      contributor: _id,
      heading: +heading || 0,
      ms,
    });
    return res.json({ previous: false, wait: false });
  } else {
    // find from the previous contributor because if current user is unavailable the we get location from the previous contributor
    const isPrevious = getCurrentContributor?.previousFiveContributor?.find(
      (data) => {
        // console.log(data.contributor, _id);
        return data.contributor?.toString() === _id;
      }
    );

    if (isPrevious) {
      // await RealTimeLocation.create({
      return res.json({ previous: true, wait: true });
    } else {
      return res.json({ previous: true, wait: false, youAreDone: true });
    }
  }
};

const asignContributor = async (req, res) => {
  // Get Data from Body
  const { latitude1, longitude1, busNumber, weight, ms, _id } = req.body;
  // Finding the busNumber from database
  // console.log({ latitude1, longitude1, busNumber, weight, ms, _id });
  const findBusNo = await RealTimeLocation.find({ busNumber })
    .select("-_id longitude latitude contributor ms createdAt ")
    .sort({
      createdAt: -1,
    })
    .limit(3)
    .populate({ path: "contributor", select: "-_id weight " });

  // IF there is no data present in database which means it is the first contributar for that bus
  if (!findBusNo.length) {
    const createFirstContributor = await contributorData.create({
      busNumber,
      currentContributor: _id,
      // previousFiveContributor: [resetContributor],
    });

    return res.json({
      previous: false,
      // contributor: createFirstContributor,
      assigned: true,
    });

    // If there is already have contributor to that bus then compare the weight
  } else {
    const { latitude, longitude, createdAt } = findBusNo[0];
    // Calculate the distance between the contributor and new user
    const distance = await calculateDistance(
      latitude1,
      latitude,
      longitude1,
      longitude
    );

    const contributerWeight = findBusNo[0].contributor.weight;
    const contributors = findBusNo[0].ms;

    // Calculate the weight between the ms(ping) and weight for current Contributor (who already contributed their location)
    const getContributerWeight = calculateWeightMs(
      +contributerWeight,
      +contributors
    );
    // Calculate the weight between the ms(ping) and weight for new User
    const getNewUserWeight = calculateWeightMs(+weight, +ms);
    // console.log({
    //   contributerWeight,
    //   contributors,
    //   getContributerWeight,
    //   getNewUserWeight,
    // });

    /*  finding the person who has already  contributed their location*/
    const getContributor = await contributorData
      .findOne({ busNumber })
      .select("currentContributor previousFiveContributor _id");
    // console.log(JSON.stringify(getContributor, null, 2));

    //find last location from realTimeDatabase  , If last location time is more than 2.5 minutes ago, which means that user is turned off their location or internet
    const lastLocationTime = await isCurrentContributorAvailable(createdAt);
    // console.log(
    //   { lastLocationTime },
    //   "+distance <= 300 || !lastLocationTime",
    //   +distance <= 300 || !lastLocationTime
    // );
    // if (getNewUserWeight > getContributerWeight || !lastLocationTime) {
    // change current contributor
    // if distance is less then 300 Meter
    if (+distance <= 300 || !lastLocationTime) {
      // Sort the contributors by their createdAt timestamp and remove the oldest contributors. here we want only five contributor
      console.log(getContributor?.previousFiveContributor);
      const resetContributor =
        dynamicSort(getContributor?.previousFiveContributor || [])?.length > 5
          ? dynamicSort(getContributor?.previousFiveContributor || []).pop()
          : dynamicSort(getContributor?.previousFiveContributor || []);

      // console.log(
      //   JSON.stringify(
      //     {
      //       resetContributor,
      //       getContributor: getContributor.previousFiveContributor,
      //     },
      //     null,
      //     2
      //   )
      // );

      // console.log(
      //   " lastLocationTime && getNewUserWeight > getContributerWeight",
      //   lastLocationTime && getNewUserWeight > getContributerWeight
      // );

      // console.log(
      //   "getNewUserWeight < getContributerWeight && lastLocationTime && +distance <= 300 &&",
      //   getNewUserWeight < getContributerWeight &&
      //     lastLocationTime &&
      //     +distance <= 300
      // );

      // After sorting , currentContributor converted into privous  contributors and currentContributor will be the new contributors

      const prevFiveContributor = [];
      if (lastLocationTime && getNewUserWeight > getContributerWeight) {
        prevFiveContributor.push({
          contributor: getContributor.currentContributor,
        });
      } else if (
        getNewUserWeight < getContributerWeight &&
        lastLocationTime &&
        +distance <= 300
      ) {
        prevFiveContributor.push({
          contributor: _id,
        });
      }

      const updateContributor = await contributorData.findOneAndUpdate(
        {
          busNumber,
        },
        {
          $set: {
            // new Contributor
            currentContributor:
              getNewUserWeight > getContributerWeight || !lastLocationTime
                ? _id
                : getContributor.currentContributor,

            previousFiveContributor: [
              // Previous five contributor
              ...resetContributor.filter(Boolean),
              // Current contributor converted Into Previous Contributor
              ...prevFiveContributor,
            ],
            busNumber: getContributor.busNumber,
            // createdAt: Date.now(),
          },
        },
        {
          // It will return the new contributor document
          new: true,
        }
      );
      // console.log(
      //   JSON.stringify(
      //     {
      //       updateContributor,
      //       getContributor,
      //       resetContributor,
      //       previous:
      //         getNewUserWeight > getContributerWeight || !lastLocationTime
      //           ? false
      //           : true,
      //       assigned: true,
      //     },
      //     null,
      //     2
      //   )
      // );
      return res.json({
        previous:
          getNewUserWeight > getContributerWeight || !lastLocationTime
            ? false
            : true,
        assigned: true,
        wait: true,
      });
    } else if (+distance > 600) {
      // CuttOff the Current Contributor User weight with -0.05
      // Reduce the weight of the user because the user sitted in the wrong bus or selected the wrong bus number
      await User.findByIdAndUpdate(
        _id,
        {
          $inc: { weight: -0.05 },
        },
        { new: true }
      );

      return res.json({ previous: true, assigned: true, wait: false });
    }
  }
  // }
};

const getNewLocation = async (req, res) => {
  // console.log("data", req.query);
  const { date, busNumber } = req.query;
  const filters = {
    ...(date ? { createdAt: { $gt: date } } : {}), // Include createdAt filter if date is provided
    busNumber: +busNumber,
  };
  const getCurrentContributor = await RealTimeLocation.find(filters)
    .select("-_id longitude latitude heading createdAt")
    .sort({ createdAt: 1 })

    .lean();

  return res.json(getCurrentContributor);
};

const changeContributor = async (req, res) => {
  // this function runs when contributre  turn off there location
  const { _id, busNumber } = req.body;
  const getContributor = await contributorData
    .findOne({ busNumber })
    .select("currentContributor previousFiveContributor _id busNumber");
  res.json({ youAreDone: false });

  if (getContributor) {
    // if any user from  PreviousFiveContributor turn off there location the remove them from the previous five arr
    if (getContributor.previousFiveContributor?.length) {
      const findFromPreviousFiveContributor =
        getContributor.previousFiveContributor.find((i) => {
          return String(i.contributor) === String(_id);
        });

      if (getContributor?.currentContributor.toString() === _id.toString()) {
        // Sort the contributors by their createdAt timestamp
        const resetContributor = await dynamicSort(
          getContributor.previousFiveContributor
        );

        // this runs when current contributor turn off there location
        // we choose the latest contributor from the previous contributor  which is store in getAndRemoveContributor variable
        const getAndRemoveContributor = resetContributor.shift();
        // console.log(JSON.stringify(getContributor, null, 2));
        // console.log(JSON.stringify(getAndRemoveContributor, null, 2));
        // After sorting , currentContributor  privous contributor converted into current contribuer and remove currentContributor from the database because currentContributor turn of their location
        await contributorData.findOneAndUpdate(
          {
            busNumber,
          },
          {
            $set: {
              // new Contributor
              currentContributor: getAndRemoveContributor.contributor,
              previousFiveContributor: [
                // Previous five contributor
                ...resetContributor,
              ],
              busNumber: getContributor.busNumber,
            },
          },
          {
            // It will return the new contributor document
            new: true,
          }
        );

        return;
        //  res.json({ youAreDone: true });
      } else if (findFromPreviousFiveContributor) {
        // console.log(JSON.stringify(findFromPreviousFiveContributor, null, 2));
        await contributorData.findOneAndUpdate(
          {
            busNumber,
          },
          {
            $set: {
              // new Contributor
              previousFiveContributor: [
                // remove previous contributor who turn off their location
                ...getContributor.previousFiveContributor.filter(
                  (i) => i.contributor.toString() !== _id.toString()
                ),
              ],
            },
          }
        );
        return;
      }
    } else {
      await contributorData.findOneAndDelete({
        busNumber,
      });
      // return res.json({ youAreDone: true });
      return;
    }
  } else {
    return;
  }
  return;
};

const a = async () => {
  // /api/getnewlocation?date=2023-09-05T06:30:04.489Z&busNumber=19
  const busNumber = 18;
  const getCurrentContributor = await RealTimeLocation.find({
    createdAt: {
      $gt: "2023-09-05T06:39:47.186Z",
    },
  });

  console.log(JSON.stringify(getCurrentContributor, null, 2));
};

<<<<<<< HEAD
=======

>>>>>>> 069d9e437d539b08217a4dc744348e03c3a48fed
module.exports = {
  addNewLocation,
  asignContributor,
  getNewLocation,
  changeContributor,
};

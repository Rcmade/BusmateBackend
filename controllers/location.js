const RealTimeLocation = require("../models/realTimeLocation");
const User = require("../models/user");
const contributorData = require("../models/appUtility");
const {
  calculateDistance,
  dynamicSort,
  isCurrentContributorAvailable,
} = require("../helpers/functions");

const { calculateWeightMs } = require("../helpers/MathFunctions");
const mongoose = require("mongoose");

const addNewLocation = async (req, res) => {
  const {
    latitude1: latitude,
    longitude1: longitude,
    busNumber,
    heading,
    ms,
    _id,
  } = req.body;

  // find to contributor who sitted in the bus
  const getCurrentContributor = await contributorData
    .findOne({
      busNumber,
    })
    .select("_id currentContributor previousFiveContributor "); // User Data
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
  const findBusNo = await RealTimeLocation.find({ busNumber })
    .select("-_id longitude latitude contributor ms createdAt ")
    .sort({
      createdAt: -1,
    })
    .limit(2)
    .populate({ path: "contributor", select: "-_id weight " });

  // IF there is no data present in database which means it is the first contributar for that bus
  if (!findBusNo.length) {
    await contributorData.create({
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
    // Calculate the distance between the existing contributor and new user
    const distance = await calculateDistance(
      // new user latitude
      latitude1,
      // existing user latitude and longitude
      latitude,
      // new user longitude
      longitude1,
      // existing user longitude
      longitude
    );

    // get weight from the last location of existing user
    const contributerWeight = findBusNo[0].contributor.weight;
    // get ping from the last location of existing user
    const contributors = findBusNo[0].ms;

    // Calculate the weight between the ms(ping) and weight for current Contributor (who already contributed their location)
    const getContributerWeight = calculateWeightMs(
      +contributerWeight,
      +contributors
    );
    // Calculate the weight between the ms(ping) and weight for new User
    const getNewUserWeight = calculateWeightMs(+weight, +ms);

    /*  finding the person who has already  contributed their location to prevent to create two doucument with same contributor and Sort the contributors by their createdAt timestamp to remove the oldest contributors. here we want only five contributor */
    const getContributor = await contributorData.findOne({
      busNumber,
    });

    if (getContributor?.previousFiveContributor?.length) {
      getContributor?.previousFiveContributor?.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }

    //find last location from realTimeDatabase, If last location time is more than 4 minutes ago, which means that user is turned off their location or connection lost
    // it return true if connection is not break
    const lastLocationTime = await isCurrentContributorAvailable(createdAt);
    // change current contributor
    // if distance is less then 300 Meter or last user may disconnected
    if (+distance <= 300 || !lastLocationTime) {
      if (getContributor?.previousFiveContributor?.length >= 5) {
        // remove the oldest contributor
        getContributor?.previousFiveContributor?.shift();
      }
      // After sorting , currentContributor converted into privous  contributors and new User will be the new contributors
      // Initialize an empty array called prevFiveContributor to store contributor objects.
      let prevFiveContributor = getContributor?.previousFiveContributor?.length
        ? [...getContributor?.previousFiveContributor]
        : [];

      // if connection is not break by currentContributor and new User have heigher weight then currnet contributor becomes previous contributor
      if (lastLocationTime && getNewUserWeight > getContributerWeight) {
        // Check if lastLocationTime is truthy (not null or undefined) and if getNewUserWeight is greater than getContributerWeight.
        // This condition checks if the new user has a higher weight (importance) than the current contributor.
        prevFiveContributor.push({
          contributor: getContributor.currentContributor,
          weight: contributerWeight,
        });

        // if current contributor weight is higher than new contributor and new contributor is also near the bus the and connection is already established between server and current contributor then new user will be the previous contributor
        // Essentially, this adds the current contributor to the prevFiveContributor array as a potential previous contributor.
      } else if (
        getNewUserWeight < getContributerWeight &&
        lastLocationTime &&
        +distance <= 300
      ) {
        // Check if getNewUserWeight is less than getContributerWeight, lastLocationTime is truthy, and distance is less than or equal to 300 meters.
        // This condition checks if the new user has a lower weight (importance) than the current contributor and the distance between them is within 300 meters.

        // if check if new user already exist in previousFiveContributor list then do not add him again
        const isPrevContributorExist = prevFiveContributor.find(
          (i) => i.contributor.toString() === _id.toString()
        );
        if (
          !isPrevContributorExist ||
          _id.toString !== getContributor.currentContributor.toString()
        ) {
          prevFiveContributor.push({
            contributor: _id,
            weight: weight,
          });
        }
        // If this condition is met, push an object into prevFiveContributor array.
        // This object contains a contributor key with the value of _id, which represents the new user as a potential previous contributor.
      }

      await contributorData.findOneAndUpdate(
        {
          busNumber,
        },
        {
          $set: {
            // new Contributor
            currentContributor:
              // if new user have heiger weight and current contributor connection is break then new user becomes current contributor else previous contributor continue
              getNewUserWeight > getContributerWeight || !lastLocationTime
                ? _id
                : getContributor.currentContributor,

            previousFiveContributor: prevFiveContributor,
            busNumber: getContributor.busNumber,
          },
        },
        {
          // It will return the new contributor document
          new: true,
        }
      );

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
  // get the data from query which is send by the user
  const { date, busNumber } = req.query;
  const filters = {
    ...(date ? { createdAt: { $gt: date } } : {}), // Include createdAt filter if date is provided
    busNumber: +busNumber,
  };

  // get the data in db , and this will sorted in the ascending order so the data retrieved will be ordered from the oldest to the newest based on the creation timestamp
  const getCurrentLocation = await RealTimeLocation.find(filters)
    .select("-_id longitude latitude heading createdAt")
    .sort({ createdAt: 1 })
    .lean();

  // get the newest location and and if newest location is more then 15 min ago then we chnage the current contributer
  if (getCurrentLocation[getCurrentLocation?.length - 1]?.createdAt) {
    // if last location is more then 15 min ago then return false
    const isContributorAvalable = await isCurrentContributorAvailable(
      getCurrentLocation[getCurrentLocation.length - 1]?.createdAt,
      1000 * 60 * 15
    );

    if (!isContributorAvalable) {
      const getContributor = await contributorData
        .findOne({ busNumber })
        .select("currentContributor previousFiveContributor _id busNumber");

      // if  previous contributors is exist then only
      if (getContributor?.previousFiveContributor?.length) {
        getContributor?.previousFiveContributor?.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        // remove the last element to the list so last element is the newest contributor of previousFiveContributor list this newest contributor store in the getLatestPrevFiveContributor variable
        const getLatestPrevFiveContributor =
          getContributor?.previousFiveContributor?.pop();

        await contributorData.findOneAndUpdate(
          {
            busNumber,
          },
          {
            $set: {
              // new Contributor
              currentContributor: getLatestPrevFiveContributor.contributor,
              // remain other contributor
              previousFiveContributor: getContributor?.previousFiveContributor,
              busNumber,
            },
          },
          {
            // It will return the new contributor document
            new: true,
          }
        );
      }
    }
  }

  if (req.query?.version) {
    return res.json({
      data: getCurrentLocation,
      // message
    });
  } else {
    return res.json(getCurrentLocation);
  }
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
  const result = await contributorData.create([
    {
      _id: "651677cdbaeb92ee2f74158b",
      currentContributor: "64ef40c34ab7c95b91bc145c",
      busNumber: 19,
    },
  ]);
};

// a();
module.exports = {
  addNewLocation,
  asignContributor,
  getNewLocation,
  changeContributor,
};

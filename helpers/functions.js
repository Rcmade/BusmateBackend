const calculateDistance = async (lat1, lat2, lon1, lon2) => {
  // The math module contains a function
  // named toRadians which converts from
  // degrees to radians.
  var lon1 = (lon1 * Math.PI) / 180;
  var lon2 = (lon2 * Math.PI) / 180;
  var lat1 = (lat1 * Math.PI) / 180;
  var lat2 = (lat2 * Math.PI) / 180;

  // Haversine formula
  let dlon = lon2 - lon1;
  let dlat = lat2 - lat1;
  let a =
    Math.pow(Math.sin(dlat / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

  let c = 2 * Math.asin(Math.sqrt(a));

  // Radius of earth in kilometers. Use 3956
  // for miles
  let r = 6371;

  // calculate the result in METERS
  return +(c * r * 1000);
};
const dynamicSort = (data) => {
  return data.sort((data1, data2) => {
    return new Date(data1.createdAt).getTime() <
      new Date(data2.createdAt).getTime()
      ? 1
      : new Date(data1.createdAt).getTime() >
        new Date(data2.createdAt).getTime()
      ? -1
      : 0;
  });
};

module.exports = { calculateDistance, dynamicSort };

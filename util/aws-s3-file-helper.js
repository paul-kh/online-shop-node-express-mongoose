const AWS = require("aws-sdk");
// Global Constants/Variables
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

exports.uploadeFileAWS_S3 = (bucketName, file, cb) => {
  const params = {
    Bucket: bucketName,
    Key: Date.now() + "-" + file.originalname,
    Body: file.buffer, // memoryStorage
  };
  s3.upload(params, (error, data) => {
    if (error) return console.log(error);
    // Callback function to do task such as add/update data in db...
    cb(data);
  });
};

exports.deleteFileAWS_S3 = (bucket, key) => {
  const params = {
    Bucket: bucket,
    Key: key,
  };
  s3.deleteObject(params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log("File Successfully Deleted from AWS S3!");
    }
  });
};

module.exports = uploadProductImage = (app, fileInput) => {
  // PARSING INCOMING REQUEST'S OF CONTENT TYPE = 'BINARY'
  // Note: The submit form must set enctype = "multipart/form data"
  const multer = require("multer");
  const AWS = require("aws-sdk");

  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  const fileName = "";
  const storage = multer.memoryStorage({
    destination: (req, file, cb) => {
      cb(null, "");
    },
    filename: (req, file, cb) => {
      const date = new Date();
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

  // Filter file type
  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

  // Multer Upload settings
  // const upload = multer ({dest: "images"});
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 524288 }, // limit max 500KB
  });

  return app.use(upload.single(fileInput), (req, res, next) => {
    let myFile = req.file.originalname.split(".");
    const fileType = myFile[myFile.length - 1];
    const fileName = myFile[0];

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      // Key: `${uuid()}.${fileType}`,
      Key: Date.now() + "-" + fileName + fileType,
      Body: req.file.buffer,
    };

    s3.upload(params, (error, data) => {
      if (error) {
        // return res.status(500).send(error);
        return console.log(error);
      }
      console.log(data);
      // res.status(200).send(data);
    });
  });
  // // Middleware to handle single file upload
  // return app.use(upload.single(fileInput));
};

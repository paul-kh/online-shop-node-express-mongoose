module.exports = uploadProductImage = (app) => {
  // PARSING INCOMING REQUEST'S OF CONTENT TYPE = 'BINARY'
  // Note: The submit form must set enctype = "multipart/form data"
  const multer = require("multer");
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "images");
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
  const upload = multer({ storage: storage, fileFilter: fileFilter }); // const upload = multer ({dest: "images"});
  // Middleware to handle single file upload
  return app.use(upload.single("image"));
};

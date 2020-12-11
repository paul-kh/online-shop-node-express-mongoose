# A Typical Online Shop

A simple online shop that allows users to shop and adminster products with online card payment.

## Live Site on AWS Elastic Beanstalk

. Live Site: http://myshop-env.eba-bgvvfsie.us-east-2.elasticbeanstalk.com/

## Features & Functions of the app

### Product Administration

- Add new product
- Edit product
- Delete product
- Show admin product list

### Product Shopping

- Show product details
- Add a product to cart
- Delete item from cart
- Checkout & place order
- Make card payment
- Create & download PDF invoice

### Security & Protection

- User Authentication (singup, login, logout, password reset via email)
- User Authorization for protecting unauthorized resources
- Route protection
- CSRF attack protection

## Technologies Used

- Node.js
- Express.js
- MongoDB & Mongoose
- ejs - template engine for dynamic views
- aws-sdk - for storing product image in an AWS S3 bucket
- pdfkit - for generating invoice in PDF
- stripe - for card payment with Stripe
- multer - for file upload
- csurf - for protecting cross site resource forgery (CSRF) attack.
- express-session - for authentication mechanism
- express-validator - for validating user input
- bcryptjs - for encrypting & comparing password
- nodemailer - for sending email to user with link for password reset

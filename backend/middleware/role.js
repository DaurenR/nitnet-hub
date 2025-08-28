module.exports = (req, _res, next) => {
  req.role = req.header("x-role");
  next();
};

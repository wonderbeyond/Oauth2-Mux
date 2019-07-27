module.exports = (req, res) => {
  res.json({
    headers: req.headers,
  });
}

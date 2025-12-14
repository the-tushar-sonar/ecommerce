export const getProfile = async (req, res) => {
  res.status(200).json({
    message: "Protected profile data",
    userId: req.user
  });
};

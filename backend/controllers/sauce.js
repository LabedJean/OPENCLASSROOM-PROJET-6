const fs = require("fs");
const Sauce = require("../models/Sauce");

// Create new sauce
exports.createSauce = (req, res) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id; // Delete the id generated
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });
  sauce.save() // Save sauce
    .then(() => res.status(201).json({ message: "Sauce ajoutée !" }))
    .catch(error => res.status(400).json({ error }));
};

// Get all sauces
exports.getAllSauces = (req, res) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

// Get one sauce
exports.getOneSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

// Edit sauce
exports.modifySauce = (req, res) => {
  const sauceObject = req.file
    ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    } : { ...req.body };
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (req.file) {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
            .catch(error => res.status(400).json({ error }));
        });
      } else {
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
          .catch(error => res.status(400).json({ error }));
      }
    })
    .catch(error => res.status(500).json({ error }));
};

// Delete sauce
exports.deleteSauce = (req, res) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

// Like and dislike
exports.likeSauce = (req, res) => {
  // if user like a sauce
  if (req.body.like === 1) {
    Sauce.updateOne({ _id: req.params.id }, {
      $set: { usersLiked: req.body.userId }, // Add id of user to the list of users who liked
      $inc: { likes: 1 }, // Add 1 to the number of users who liked the sauce
    })
      .then(() => res.status(200).json({ message: "L'utilisateur a liké la sauce !" }))
      .catch(error => res.status(400).json({ error }));
  }
  // if user dislike a sauce
  if (req.body.like === -1) {
    Sauce.updateOne({ _id: req.params.id }, {
      $set: { usersDisliked: req.body.userId }, // Add id of user to the list of users who disliked
      $inc: { dislikes: 1 }, // Add 1 to the number of users who disliked the sauce
    })
      .then(() => res.status(200).json({ message: "L'utilisateur a disliké la sauce !" }))
      .catch(error => res.status(400).json({ error }));
  }

  // When user change like/dislike
  if (req.body.like === 0) {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
        // Check if user liked
        const alreadyLiked = sauce.usersLiked.includes(req.body.userId);
        // if liked
        if (alreadyLiked) {
          Sauce.updateOne({ _id: req.params.id }, {
            $pull: { usersLiked: req.body.userId }, // Delete id of user to the list of users who liked
            $inc: { likes: -1 }, // Delete 1 to the number of users who liked the sauce
          })
            .then(() => res.status(200).json({ message: "L'utilisateur a supprimé son like !" }))
            .catch(error => res.status(400).json({ error }));
        // if disliked
        } else {
          Sauce.updateOne({ _id: req.params.id }, {
            $pull: { usersDisliked: req.body.userId }, // Delete id of user to the list of users who disliked
            $inc: { dislikes: -1 }, // Delete 1 to the number of users who disliked the sauce
          })
            .then(() => res.status(200).json({ message: "L'utilisateur a supprimé son dislike !" }))
            .catch(error => res.status(400).json({ error }));
        }
      })
      .catch(error => res.status(500).json({ error }));
  }
};
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const passwordValidator = require("../middleware/password-validator");

// Create new User
exports.signup = (req, res) => {
  if (passwordValidator.validate(req.body.password)) { // Password does pass validator
    bcrypt.hash(req.body.password, 10) // Hash password
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash,
        });
        user.save() // Save user
          .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
          .catch(() => res.status(400).json({ message: "Il existe déjà un utilisateur avec cette adresse email." }));
      })
      .catch(error => res.status(500).json({ error }));
  } else { // Password does not pass validator
    res.status(400).json({ message: "Votre mot de passe doit contenir entre 8 et 30 caractères et comporter au moins une lettre minuscule, une lettre majuscule, un chiffre et un caractère spécial." });
  }
};

// Login User
exports.login = (req, res) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ message: "Utilisateur non trouvé !" });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ message: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              process.env.TOKEN_SECRET_KEY,
              { expiresIn: "24h" },
            ),
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};
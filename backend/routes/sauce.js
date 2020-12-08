const express = require("express");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer");
const sauceCtrl = require("../controllers/sauce");

const router = express.Router();

// Routing
router.post("/", auth, multer, sauceCtrl.createSauce); // Crée une nouvelle sauce
router.get("/", auth, sauceCtrl.getAllSauces); // Récupère toutes les sauces
router.get("/:id", auth, sauceCtrl.getOneSauce); // Récupère une sauce précise
router.put("/:id", auth, multer, sauceCtrl.modifySauce); // Modifie une sauce
router.delete("/:id", auth, sauceCtrl.deleteSauce); // Supprime une sauce
router.post("/:id/like", auth, sauceCtrl.likeSauce); // Like ou dislike une sauce

module.exports = router;
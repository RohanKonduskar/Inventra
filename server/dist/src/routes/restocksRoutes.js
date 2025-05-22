"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const restocksController_1 = require("../controllers/restocksController"); // Ensure correct import path
const router = express_1.default.Router();
// Define the /restocks route
router.get("/", restocksController_1.getRestocks);
exports.default = router;

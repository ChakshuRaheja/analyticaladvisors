const express = require('express');
const router = express.Router();
const excelController = require('../controllers/excel.controller');

// Get all available sheets
router.get('/sheets', excelController.getSheets);

// Get data from a specific sheet with filtering and pagination
// Example: /api/excel/sheets/YuktiVargha?page=1&limit=10&sortBy=columnName&sortOrder=asc&search=term
router.get('/sheets/:sheetName', excelController.getSheetData);

module.exports = router;
 
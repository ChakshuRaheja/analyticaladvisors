const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Path to your Excel file
// Use a more reliable path resolution method that works in both local and deployed environments
const EXCEL_FILE = process.env.EXCEL_FILE_PATH || path.join(process.cwd(), 'data/data.xlsx');
console.log('Excel file path:', EXCEL_FILE);

// Get all data with filters
const getData = (req, res) => {
    try {
        // Read the Excel file
        const workbook = XLSX.readFile(EXCEL_FILE);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        let data = XLSX.utils.sheet_to_json(worksheet);
        
        // Apply search filter
        if (req.query.search) {
            const searchTerm = req.query.search.toLowerCase();
            data = data.filter(row => 
                Object.values(row).some(value => 
                    String(value).toLowerCase().includes(searchTerm)
                )
            );
        }
        
        // Apply column filters
        const filters = { ...req.query };
        delete filters.search;
        delete filters.page;
        delete filters.limit;
        delete filters.sortBy;
        delete filters.sortOrder;
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                data = data.filter(row => 
                    String(row[key]).toLowerCase() === value.toLowerCase()
                );
            }
        });
        
        // Apply sorting
        if (req.query.sortBy && data.length > 0 && req.query.sortBy in data[0]) {
            const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
            data.sort((a, b) => {
                const valA = a[req.query.sortBy];
                const valB = b[req.query.sortBy];
                return (valA < valB ? -1 : valA > valB ? 1 : 0) * sortOrder;
            });
        }
        
        // Get total count before pagination
        const totalItems = data.length;
        
        // Apply pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedData = data.slice(startIndex, endIndex);
        
        // Get unique values for each column (for filter options)
        const columns = {};
        if (data.length > 0) {
            Object.keys(data[0]).forEach(key => {
                const uniqueValues = [...new Set(data.map(item => item[key]))];
                columns[key] = uniqueValues;
            });
        }
        
        res.json({
            success: true,
            data: paginatedData,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                itemsPerPage: limit
            },
            columns: columns
        });
        
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing data',
            error: error.message
        });
    }
};

const uploadExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Read the uploaded file
        const workbook = XLSX.readFile(req.file.path);
        const sheetNames = workbook.SheetNames;
        const data = [];

        sheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          data.push({
            sheetName,
            data: XLSX.utils.sheet_to_json(worksheet)
          });
        });

        // Here you can process the data as needed
        // For example, save to database, perform calculations, etc.
        console.log('Excel data:', data);

        // Delete the uploaded file after processing
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            success: true,
            message: 'File processed successfully',
            data: data
        });
    } catch (error) {
        console.error('Error processing Excel file:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Error processing Excel file',
            error: error.message
        });
    }
};

const downloadTemplate = (req, res) => {
    try {
        // Create a sample workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([
            { 'Column1': 'Sample Data 1', 'Column2': 'Sample Data 2' }
            // Add more sample data as needed
        ]);
        
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        
        // Generate buffer
        const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
        
        // Set headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=template.xlsx');
        
        // Send the file
        res.send(buffer);
    } catch (error) {
        console.error('Error generating template:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating template',
            error: error.message
        });
    }
};

// Get all available sheets
const getSheets = (req, res) => {
  try {
    const workbook = XLSX.readFile(EXCEL_FILE);
    res.json({
      success: true,
      sheets: workbook.SheetNames
    });
  } catch (error) {
    console.error('Error getting sheets:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting sheets',
      error: error.message
    });
  }
};

// Get data from a specific sheet
const getSheetData = (req, res) => {
  try {
    const { sheetName } = req.params;
    const { search, page = 1, limit = 20, sortBy, sortOrder = 'asc' } = req.query;

    // Read the Excel file
    const workbook = XLSX.readFile(EXCEL_FILE);
    
    // Check if sheet exists
    if (!workbook.SheetNames.includes(sheetName)) {
      return res.status(404).json({
        success: false,
        message: `Sheet '${sheetName}' not found`
      });
    }

    // Get the worksheet
    const worksheet = workbook.Sheets[sheetName];
    let data = XLSX.utils.sheet_to_json(worksheet);
    
    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      data = data.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchTerm)
        )
      );
    }
    
    // Apply sorting
    if (sortBy && data.length > 0 && data[0].hasOwnProperty(sortBy)) {
      const order = sortOrder === 'desc' ? -1 : 1;
      data.sort((a, b) => {
        const valA = a[sortBy];
        const valB = b[sortBy];
        return (valA < valB ? -1 : valA > valB ? 1 : 0) * order;
      });
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedData = data.slice(startIndex, endIndex);
    
    // Get column headers
    const headers = data.length > 0 ? Object.keys(data[0]) : [];
    
    res.json({
      success: true,
      data: paginatedData,
      meta: {
        sheet: sheetName,
        totalItems: data.length,
        currentPage: parseInt(page),
        totalPages: Math.ceil(data.length / limit),
        itemsPerPage: parseInt(limit),
        headers: headers
      }
    });
    
  } catch (error) {
    console.error('Error getting sheet data:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing sheet data',
      error: error.message
    });
  }
};

module.exports = {
  getSheets,
  getSheetData
};

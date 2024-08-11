require('dotenv').config();  // Load environment variables
const express = require('express');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const XLSX = require('xlsx');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// File upload configuration
const upload = multer({ dest: 'uploads/' });

// Initialize the Google Generative AI instance
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function processExcel(data) {
  const workbook = XLSX.read(data, { type: 'buffer' });
  const firstSheet = workbook.SheetNames[0];
  const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { header: 1 });

  // Assuming the first row contains the labels and the rest contains the data
  const labels = sheetData[0]; // First row as labels
  const datachart = sheetData.slice(1).map(row => row.slice(1)); // Get data from all columns except the first one

  return {
      labels: labels.slice(1), // Assuming the first column is for labels (like 'Month')
      datachart: datachart
  };
}


function to_json(workbook) {
  const result = {};
  workbook.SheetNames.forEach(function(sheetName) {
      const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
      if (roa.length) result[sheetName] = roa;
  });
  return result;
}
async function processWithGeminiAI(data, chartType, labels, datachart) {
  try {
      let specificPrompt = '';

      switch (chartType.toLowerCase()) {
          case 'bar':
              specificPrompt = `BAR GRAPH\nA bar chart provides a way of showing data values represented as vertical bars. It is sometimes used to show trend data, and the comparison of multiple data sets side by side.\n`;
              break;
          case 'line':
              specificPrompt = `LINE CHART\nA line chart is a way of plotting data points on a line. Often, it is used to show trend data, or the comparison of two data sets.\n`;
              break;
          case 'pie':
          case 'doughnut':
              specificPrompt = `PIE/DOUGHNUT CHART\nPie and doughnut charts are used to show the proportional value of each piece of data. They are excellent at showing the relational proportions between data.\n`;
              break;
          case 'radar':
              specificPrompt = `RADAR CHART\nA radar chart is a way of showing multiple data points and the variation between them. They are often useful for comparing the points of two or more different data sets.\n`;
              break;
          case 'polarArea':
              specificPrompt = `POLAR AREA CHART\nPolar area charts are similar to pie charts, but each segment has the same angle - the radius of the segment differs depending on the value.\n`;
              break;
          case 'bubble':
              specificPrompt = `BUBBLE CHART\nA bubble chart is used to display three dimensions of data at the same time. The location of the bubble is determined by the first two dimensions and the corresponding horizontal and vertical axes. The third dimension is represented by the size of the individual bubbles.\n`;
              break;
          case 'scatter':
              specificPrompt = `SCATTER CHART\nScatter charts are based on basic line charts with the x-axis changed to a linear axis. Data must be passed as objects containing X and Y properties.\n`;
              break;
          case 'area':
              specificPrompt = `AREA CHART\nBoth line and radar charts support a fill option on the dataset object which can be used to create space between two datasets or a dataset and a boundary, i.e. the scale origin, start, or end.\n`;
              break;
          case 'mixed':
              specificPrompt = `MIXED CHART\nWith Chart.js, it is possible to create mixed charts that are a combination of two or more different chart types. A common example is a bar chart that also includes a line dataset.\n`;
              break;
          default:
              specificPrompt = `CHART\n`;
      }

      const prompt = `
      Using the following details:
      - Chart Type: ${chartType}
      - Labels: ${JSON.stringify(labels)}
      - Data: ${JSON.stringify(datachart)}

      ${specificPrompt}
      Generate the best configuration code for creating a styled and interactive Chart.js chart. 
      The configuration should include:
      - Responsive design
      - A legend positioned at the top
      - A title at the top of the chart that says "Generated Chart"
      - Properly formatted scales for the X and Y axes, with the Y-axis starting at zero.
      
      Return only the JavaScript code for the chart configuration, without any backticks or additional content.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = await response.text();
      text = text.replace(/```/g, '').replace(/javascript/g, '');

      return text;  
  } catch (error) {
      console.error('Error processing with Gemini AI:', error);
      throw error;
  }
}

// Routes
app.get('/', (req, res) => {
    res.render('index'); // Create an 'index.ejs' in 'views/'
});
app.post('/upload', upload.single('datafile'), async (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.file.filename);

    try {
        const data = fs.readFileSync(filePath);
        const processedData = processExcel(data);
        const chartype = req.body.chartType;
        const labels= processedData.labels;
        const datachart= processedData.datachart;
        
        // Get the best Chart.js configuration from Gemini AI
        const geminiResponse = await processWithGeminiAI(processedData,chartype,labels,datachart);
        console.log("Geminin respon"+geminiResponse)

        // Render the chart with the generated code
        res.render('chart', {
            chartConfig: geminiResponse // Passing the generated chart config code
        });
    } catch (error) {
        res.status(500).send('Error processing the file.');
    } finally {
        fs.unlinkSync(filePath); // Clean up the uploaded file
    }
});


// Start server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));

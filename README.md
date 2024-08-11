# charthubwithgoggleai


# ChartHub

**Tagline:** Effortlessly generate and customize stunning data visualizations to transform raw numbers into insightful, interactive charts.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Integration](#api-integration)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Introduction

ChartHub is a web application that allows users to easily generate and customize data visualizations. By leveraging the power of Chart.js and integrating with the Gemini AI API, ChartHub transforms raw data into insightful, interactive charts that can be tailored to meet specific needs.

## Features

- **Dynamic Chart Generation:** Upload your data and generate a wide variety of charts on the fly.
- **Customization Options:** Customize chart appearance, including colors, labels, and more.
- **API Integration:** Utilize the Gemini AI API to dynamically generate chart configurations.
- **User-Friendly Interface:** Simple, intuitive interface for both novice and advanced users.

## Installation

To set up ChartHub locally, follow these steps:

1. **Clone the repository:**

    ```bash
    git clone https://github.com/fateisintersting/charthubwithgoggleai.git
    ```

2. **Navigate to the project directory:**

    ```bash
    cd charthubwithgoggleai
    ```

3. **Install dependencies:**

    ```bash
    npm install
    ```

4. **Start the development server:**

    ```bash
    npm start
    ```

5. **Open your browser and navigate to:**

    ```
    http://localhost:3000
    ```

## Usage

1. **Upload Your Data:**
   - Click on the 'Upload Data' button to select a CSV or JSON file.

2. **Generate Chart:**
   - Choose the chart type (e.g., Bar, Line, Pie).
   - Click 'Generate Chart' to visualize your data.

3. **Customize Chart:**
   - Use the provided options to customize your chart's appearance.

4. **Save or Share:**
   - Download the chart or share it directly from the app.

## API Integration

ChartHub integrates with the Gemini AI API to dynamically generate Chart.js configurations. The API provides intelligent suggestions for chart types and configurations based on the uploaded data.

**Example API Call:**

```javascript
const chartConfig = await fetchGeminiAIConfig(uploadedData);

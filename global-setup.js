const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const dir = './allure-results';
  const archivedDir = path.join(__dirname, 'ArchivedResults');
  
  console.log('🔄 Ensuring Allure results directory exists...');
  console.log('Current date and time:', new Date().toLocaleString());

  // 1. Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log('📁 Created directory:', dir);
    return;
  }

  // 2. Before clearing, look for the most recent standard report's history
  let historyCopied = false;
  if (fs.existsSync(archivedDir)) {
    // Find all standard allure-report folders (ignoring zip files and single-file folders)
    const folders = fs.readdirSync(archivedDir)
      .filter(f => f.startsWith('allure-report-') && !f.includes('single') && fs.statSync(path.join(archivedDir, f)).isDirectory())
      .sort((a, b) => fs.statSync(path.join(archivedDir, b)).mtime - fs.statSync(path.join(archivedDir, a)).mtime); // Sort newest first

    if (folders.length > 0) {
      const latestReportDir = path.join(archivedDir, folders[0]);
      const srcHistoryDir = path.join(latestReportDir, 'history');

      // If a history directory exists in the last run, copy it safely to a temporary spot
      if (fs.existsSync(srcHistoryDir)) {
        console.log(`⏳ Found previous history in: ${folders[0]}. Preparing to migrate trend data...`);
        const tempHistory = path.join(__dirname, 'temp_history');
        fs.mkdirSync(tempHistory, { recursive: true });
        
        fs.readdirSync(srcHistoryDir).forEach(file => {
          fs.copyFileSync(path.join(srcHistoryDir, file), path.join(tempHistory, file));
        });
        
        historyCopied = tempHistory;
      }
    }
  }

  // 3. Clean up existing files in allure-results
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
    }
  });
  console.log('✅ Allure results cleared.');

  // 4. If we saved historical data, restore it into the freshly cleaned allure-results folder
  if (historyCopied) {
    const destHistoryDir = path.join(dir, 'history');
    fs.mkdirSync(destHistoryDir, { recursive: true });
    
    fs.readdirSync(historyCopied).forEach(file => {
      fs.copyFileSync(path.join(historyCopied, file), path.join(destHistoryDir, file));
      fs.unlinkSync(path.join(historyCopied, file)); // Clean up temp file
    });
    fs.rmdirSync(historyCopied); // Remove temp folder
    console.log('📈 Successfully injected previous history into new run results.');
  }
};
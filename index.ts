import express from "express";
import path from "path";
import multer from "multer";
import XLSX from "xlsx";

const app = express();
const PORT = process.env.PORT || 11111;
app.use(express.static(path.join(__dirname, "./public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const upload = multer({ storage: multer.memoryStorage() });
app.post("/upload", upload.single("file"), (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
  
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheets: { [key: string]: any[] } = {};
      
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        sheets[sheetName] = data.filter(row => 
          Array.isArray(row) && row.some(cell => cell !== undefined && cell !== null && cell !== '')
        );
      });
  
      res.json({ 
        sheets,
        sheetNames: workbook.SheetNames
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to process file", details: err?.message });
    }
  });

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});

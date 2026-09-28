const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!";
const DATA_FILE = path.join(__dirname, "data", "enquiries.json");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
}
function readEnquiries() {
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8") || "[]");
  } catch {
    return [];
  }
}
function writeEnquiries(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Basic ")) return res.status(401).json({ message: "Unauthorized" });
  const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
  const idx = decoded.indexOf(":");
  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);
  if (user !== ADMIN_USER || pass !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }
  next();
}

app.post("/api/enquiries", (req, res) => {
  const { name, phone, email, course, mode, message } = req.body;
  if (!name || !phone || !course || !mode) {
    return res.status(400).json({ message: "Name, phone, course and mode are required." });
  }

  const cleanPhone = String(phone).replace(/[^\d+]/g, "");
  if (cleanPhone.length < 10) {
    return res.status(400).json({ message: "Please enter a valid phone number." });
  }

  const items = readEnquiries();
  const enquiry = {
    id: Date.now().toString(),
    name: String(name).trim(),
    phone: cleanPhone,
    email: String(email || "").trim(),
    course: String(course).trim(),
    mode: String(mode).trim(),
    message: String(message || "").trim(),
    status: "New",
    createdAt: new Date().toISOString()
  };
  items.unshift(enquiry);
  writeEnquiries(items);
  res.status(201).json({ message: "Enquiry submitted successfully.", enquiry });
});

app.get("/api/admin/enquiries", requireAdmin, (req, res) => {
  res.json(readEnquiries());
});

app.patch("/api/admin/enquiries/:id", requireAdmin, (req, res) => {
  const items = readEnquiries();
  const item = items.find(x => x.id === req.params.id);
  if (!item) return res.status(404).json({ message: "Enquiry not found." });
  item.status = req.body.status || item.status;
  writeEnquiries(items);
  res.json({ message: "Status updated.", enquiry: item });
});

app.delete("/api/admin/enquiries/:id", requireAdmin, (req, res) => {
  const items = readEnquiries();
  const filtered = items.filter(x => x.id !== req.params.id);
  if (filtered.length === items.length) {
    return res.status(404).json({ message: "Enquiry not found." });
  }
  writeEnquiries(filtered);
  res.json({ message: "Enquiry deleted." });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  ensureDataFile();
  console.log(`IT Cyber Technology website running on http://localhost:${PORT}`);
});

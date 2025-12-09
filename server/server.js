const express = require('express');
const sql = require('mssql/msnodesqlv8');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer config for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const name = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

// SQL Server connection
const poolConfig = {
  connectionString: "Driver={ODBC Driver 18 for SQL Server};Server=NITRO-ANV15-41\\SQLEXPRESS,64151;Database=sample;Trusted_Connection=Yes;Encrypt=No;",
  driver: 'msnodesqlv8'
};

let pool;
sql.connect(poolConfig)
  .then((p) => {
    pool = p;
    console.log('SQL Server connected via Windows Authentication');
  })
  .catch((err) => {
    console.error('DB connect error', err);
    process.exit(1);
  });



app.get('/branch', async (req, res) => {
  try {
    const result = await pool.request().query(
      "SELECT id, name FROM ailyn.branch WHERE status = 'active' ORDER BY name"
    );
    res.json(result.recordset || []);
  } catch (err) {
    console.error('GET /branch error', err);
    res.status(500).json({ error: 'Failed to fetch branches: ' + (err.message || err) });
  }
});

app.post('/addbranch', async (req, res) => {
  const name = req.body.name ?? '';
  if (!name) return res.status(400).json({ error: 'Missing branch name' });

  try {
    // Check active
    let result = await pool.request()
      .input('name', sql.NVarChar(150), name)
      .query("SELECT id FROM ailyn.branch WHERE name = @name AND status = 'active'");

    if (result.recordset.length) {
      return res.status(400).json({ error: 'Branch already exists.' });
    }

    // Check if inactive → reactivate
    result = await pool.request()
      .input('name', sql.NVarChar(150), name)
      .query("SELECT id FROM ailyn.branch WHERE name = @name AND status = 'inactive'");

    if (result.recordset.length) {
      await pool.request()
        .input('name', sql.NVarChar(150), name)
        .query("UPDATE ailyn.branch SET status = 'active' WHERE name = @name");

      const reactivated = await pool.request()
        .input('name', sql.NVarChar(150), name)
        .query("SELECT id, name FROM ailyn.branch WHERE name = @name");

      return res.json({ message: 'Branch reactivated', branch: reactivated.recordset[0] });
    }

    // Insert new
    await pool.request()
      .input('name', sql.NVarChar(150), name)
      .query("INSERT INTO ailyn.branch (name, status) VALUES (@name, 'active')");

    const inserted = await pool.request()
      .input('name', sql.NVarChar(150), name)
      .query("SELECT id, name FROM ailyn.branch WHERE name = @name");

    res.json({ message: 'Branch added', branch: inserted.recordset[0] });

  } catch (err) {
    console.error('POST /branch error', err);
    res.status(500).json({ error: 'Failed to add branch: ' + (err.message || err) });
  }
});

app.delete('/deletebranch', async (req, res) => {
  const name = req.query.branch;
  if (!name) return res.status(400).json({ error: 'Missing branch name' });

  try {
    const result = await pool.request()
      .input('name', sql.NVarChar(150), name)
      .query("SELECT id FROM ailyn.branch WHERE name = @name AND status = 'active'");

    if (!result.recordset.length) {
      return res.status(400).json({ error: 'Branch not found or already inactive.' });
    }

    await pool.request()
      .input('name', sql.NVarChar(150), name)
      .query("UPDATE ailyn.branch SET status = 'inactive' WHERE name = @name");

    res.json({ message: 'Branch set to inactive' });

  } catch (err) {
    console.error('DELETE /branch error', err);
    res.status(500).json({ error: 'Failed to delete branch: ' + (err.message || err) });
  }
});

app.get('/staff', async (req, res) => {
  const branch = req.query.branch ?? '';

  try {
    let result;
    if (branch) {
      result = await pool.request()
        .input('branch', sql.NVarChar(150), branch)
        .query("SELECT StaffID, Fname, Lname, Address, Email, Sex, ContactNumber FROM ailyn.staff WHERE status = 'Active' AND branch = @branch");
    } else {
      result = await pool.request()
        .query("SELECT StaffID, Fname, Lname, Address, Email, Sex, ContactNumber FROM ailyn.staff WHERE status = 'Active'");
    }

    res.json(result.recordset || []);
  } catch (err) {
    console.error('GET /staff error', err);
    res.status(500).json({ error: 'Failed to fetch staff: ' + (err.message || err) });
  }
});
// ...existing code...

// Add staff (accepts JSON body)
app.post('/addstaff', async (req, res) => {
  const {
    Fname,
    Lname,
    Address,
    Email,
    Sex,
    ContactNumber,
    Branch
  } = req.body || {};

  if (!Fname || !Lname || !Address || !Email || !Sex || !ContactNumber || !Branch) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await pool.request()
      .input('Fname', sql.NVarChar(150), Fname)
      .input('Lname', sql.NVarChar(150), Lname)
      .input('Address', sql.NVarChar(300), Address)
      .input('Email', sql.NVarChar(200), Email)
      .input('Sex', sql.NVarChar(10), Sex)
      .input('ContactNumber', sql.NVarChar(50), ContactNumber)
      .input('Branch', sql.NVarChar(150), Branch)
      .query(`
        INSERT INTO ailyn.staff (Fname, Lname, Address, Email, Sex, ContactNumber, Branch, Status)
        OUTPUT inserted.StaffID, inserted.Fname, inserted.Lname, inserted.Branch
        VALUES (@Fname, @Lname, @Address, @Email, @Sex, @ContactNumber, @Branch, 'Active')
      `);

    const inserted = result.recordset && result.recordset[0];
    res.json({ message: 'Staff added successfully', staff: inserted });
  } catch (err) {
    console.error('POST /staff error', err);
    res.status(500).json({ error: 'Error adding staff: ' + (err.message || err) });
  }
});
// Edit staff (supports JSON body or multipart/form-data with Photo file)
app.put('/staff/:id', upload.single('Photo'), async (req, res) => {
  const staffID = parseInt(req.params.id, 10);
  if (!staffID) return res.status(400).json({ error: 'Invalid StaffID' });

  // prefer JSON body for fields, fallback to form fields in req.body
  const {
    Fname,
    Lname,
    Address,
    Email,
    Sex,
    ContactNumber,
    Branch
  } = req.body || {};

  // If file uploaded, build photo path
  let photoPath = null;
  if (req.file) {
    // store relative path from server root
    photoPath = path.join('uploads', req.file.filename).replace(/\\/g, '/');
  }

  try {
    // Build update set dynamically to only update provided fields
    const updates = [];
    const request = pool.request();

    if (Fname !== undefined) { updates.push('Fname = @Fname'); request.input('Fname', sql.NVarChar(150), Fname); }
    if (Lname !== undefined) { updates.push('Lname = @Lname'); request.input('Lname', sql.NVarChar(150), Lname); }
    if (Address !== undefined) { updates.push('Address = @Address'); request.input('Address', sql.NVarChar(300), Address); }
    if (Email !== undefined) { updates.push('Email = @Email'); request.input('Email', sql.NVarChar(200), Email); }
    if (Sex !== undefined) { updates.push('Sex = @Sex'); request.input('Sex', sql.NVarChar(10), Sex); }
    if (ContactNumber !== undefined) { updates.push('ContactNumber = @ContactNumber'); request.input('ContactNumber', sql.NVarChar(50), ContactNumber); }
    if (Branch !== undefined) { updates.push('Branch = @Branch'); request.input('Branch', sql.NVarChar(150), Branch); }
    if (photoPath !== null) { updates.push('Photo = @Photo'); request.input('Photo', sql.NVarChar(500), photoPath); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    request.input('StaffID', sql.Int, staffID);

    const updateQuery = `
      UPDATE ailyn.staff
      SET ${updates.join(', ')}
      WHERE StaffID = @StaffID;

      SELECT StaffID, Fname, Lname, Address, Email, Sex, ContactNumber, Branch, Photo
      FROM ailyn.staff WHERE StaffID = @StaffID;
    `;

    const result = await request.query(updateQuery);
    const updated = result.recordset && result.recordset[0];

    if (!updated) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json({ status: 'success', message: 'Staff details updated successfully!', staff: updated });
  } catch (err) {
    console.error('PUT /staff/:id error', err);
    res.status(500).json({ status: 'error', message: 'Failed to update staff details.', error: err.message || err });
  }
});

app.get('/getID', async (req, res) => {
  const staffID = req.query.StaffID ?? req.query.staffID;
  const branch = req.query.branch ?? '';

  try {
    if (staffID) {
      // Fetch single staff by ID (active only)
      const id = parseInt(staffID, 10);
      if (Number.isNaN(id)) {
        return res.status(400).json({ status: 'error', message: 'Invalid staffID' });
      }

      const result = await pool.request()
        .input('StaffID', sql.Int, id)
        .query("SELECT StaffID, Fname, Lname, Address, Email, Sex, ContactNumber, Branch FROM ailyn.staff WHERE StaffID = @StaffID AND Status = 'Active'");

      if (result.recordset && result.recordset.length) {
        return res.json({ status: 'success', staff: result.recordset[0] });
      } else {
        return res.status(404).json({ status: 'error', message: 'Staff not found or inactive' });
      }
    }

    if (branch) {
      // Fetch active staff for a branch
      const result = await pool.request()
        .input('branch', sql.NVarChar(150), branch)
        .query("SELECT StaffID, Fname, Lname, Address, Email, Sex, ContactNumber FROM ailyn.staff WHERE Status = 'Active' AND Branch = @branch ORDER BY Fname, Lname");

      return res.json(result.recordset || []);
    }

    // No params => return all active staff
    const all = await pool.request()
      .query("SELECT StaffID, Fname, Lname, Address, Email, Sex, ContactNumber, Branch FROM ailyn.staff WHERE Status = 'Active' ORDER BY Fname, Lname");

    res.json(all.recordset || []);
  } catch (err) {
    console.error('GET /staff error', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch staff: ' + (err.message || err) });
  }
});
// ...existing code...
app.post('/setinactive', async (req, res) => {
  const staffID = req.body?.staffID ?? req.body?.StaffID;
  if (!staffID) return res.status(400).json({ status: 'error', message: 'No staffID provided' });

  const id = parseInt(staffID, 10);
  if (Number.isNaN(id)) return res.status(400).json({ status: 'error', message: 'Invalid staffID' });

  try {
    const result = await pool.request()
      .input('StaffID', sql.Int, id)
      .query("UPDATE ailyn.staff SET Status = 'Inactive' WHERE StaffID = @StaffID");

    const affected = Array.isArray(result.rowsAffected) ? result.rowsAffected[0] : result.rowsAffected;
    if (affected && affected > 0) {
      return res.json({ status: 'success' });
    } else {
      return res.status(404).json({ status: 'error', message: 'Staff not found or already inactive' });
    }
  } catch (err) {
    console.error('POST /setinactive error', err);
    return res.status(500).json({ status: 'error', message: 'Database error: ' + (err.message || err) });
  }
});

// ...existing code...
app.post('/updatestaff', async (req, res) => {
  const {
    StaffID,
    Fname,
    Lname,
    Address,
    Email,
    Sex,
    ContactNumber,
    Branch
  } = req.body || {};

  const id = parseInt(StaffID, 10);
  if (!id) return res.status(400).json({ status: 'error', message: 'Invalid or missing StaffID' });

  try {
    const request = pool.request()
      .input('Fname', sql.NVarChar(150), Fname ?? null)
      .input('Lname', sql.NVarChar(150), Lname ?? null)
      .input('Address', sql.NVarChar(300), Address ?? null)
      .input('Email', sql.NVarChar(200), Email ?? null)
      .input('Sex', sql.NVarChar(10), Sex ?? null)
      .input('ContactNumber', sql.NVarChar(50), ContactNumber ?? null)
      .input('Branch', sql.NVarChar(150), Branch ?? null)
      .input('StaffID', sql.Int, id);

    const updateQuery = `
      UPDATE ailyn.staff
      SET Fname = COALESCE(@Fname, Fname),
          Lname = COALESCE(@Lname, Lname),
          Address = COALESCE(@Address, Address),
          Email = COALESCE(@Email, Email),
          Sex = COALESCE(@Sex, Sex),
          ContactNumber = COALESCE(@ContactNumber, ContactNumber),
          Branch = COALESCE(@Branch, Branch)
      WHERE StaffID = @StaffID;
    `;

    const result = await request.query(updateQuery);
    const affected = Array.isArray(result.rowsAffected) ? result.rowsAffected[0] : result.rowsAffected;
    if (!affected || affected === 0) {
      return res.status(404).json({ status: 'error', message: 'Staff not found or nothing to update' });
    }

    const sel = await pool.request()
      .input('StaffID', sql.Int, id)
      .query('SELECT StaffID, Fname, Lname, Address, Email, Sex, ContactNumber, Branch FROM ailyn.staff WHERE StaffID = @StaffID');

    res.json({ status: 'success', message: 'Staff details updated successfully!', staff: sel.recordset[0] });
  } catch (err) {
    console.error('POST /updatestaff error', err);
    res.status(500).json({ status: 'error', message: 'Failed to update staff: ' + (err.message || err) });
  }
});

// ...existing code...
app.get('/active_staff', async (req, res) => {
  const branch = req.query.branch ?? '';

  if (!branch) {
    return res.status(400).json({ error: 'Branch name is required' });
  }

  try {
    const result = await pool.request()
      .input('branch', sql.NVarChar(150), branch)
      .query("SELECT StaffID, Fname, Lname FROM ailyn.staff WHERE status = 'Active' AND Branch = @branch ORDER BY Fname, Lname");

    res.json(result.recordset || []);
  } catch (err) {
    console.error('GET /active_staff error', err);
    res.status(500).json({ error: 'Failed to fetch active staff: ' + (err.message || err) });
  }
});

// ...existing code...
// ...existing code...
app.post('/save_dtr', async (req, res) => {
  const { staffID, fname, lname, timeIn, timeOut, date } = req.body || {};

  if (!staffID || !timeIn || !timeOut) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // helper: convert "hh:mm AM/PM" -> "HH:MM:SS"
  const parseTimeAmPm = (t) => {
    if (!t) return null;
    const m = ('' + t).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    let hh = parseInt(m[1], 10);
    const mm = m[2];
    const period = m[3].toUpperCase();
    if (period === 'PM' && hh < 12) hh += 12;
    if (period === 'AM' && hh === 12) hh = 0;
    return (`0${hh}`).slice(-2) + ':' + mm + ':00';
  };

  try {
    // verify staff exists
    const check = await pool.request()
      .input('staffID', sql.NVarChar(50), staffID)
      .query('SELECT StaffID FROM ailyn.staff WHERE StaffID = @staffID');

    if (!check.recordset || !check.recordset.length) {
      return res.status(400).json({ error: 'Invalid StaffID.' });
    }

    const parsedTimeIn = parseTimeAmPm(timeIn);
    const parsedTimeOut = parseTimeAmPm(timeOut);
    if (!parsedTimeIn || !parsedTimeOut) {
      return res.status(400).json({ error: 'Invalid time format. Use "HH:MM AM/PM".' });
    }

    // parse date if provided (expecting YYYY-MM-DD or null)
    const parsedDate = date ? new Date(date) : null;
    if (date && isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    // insert into dtr and return inserted id
    const insertReq = pool.request()
      .input('staffID', sql.NVarChar(50), staffID)
      .input('fname', sql.NVarChar(150), fname ?? '')
      .input('lname', sql.NVarChar(150), lname ?? '')
      .input('timeIn', sql.Time, parsedTimeIn)
      .input('timeOut', sql.Time, parsedTimeOut)
      .input('date', sql.Date, parsedDate ?? null);

    // use OUTPUT INTO to accommodate triggers
    const insertDtr = await insertReq.query(`
      DECLARE @out TABLE (dtrID INT);
      INSERT INTO ailyn.dtr (StaffID, Fname, Lname, TimeIn, TimeOut, Date)
      OUTPUT inserted.dtrID INTO @out
      VALUES (@staffID, @fname, @lname, @timeIn, @timeOut, @date);
      SELECT dtrID FROM @out;
    `);

    const dtrID = insertDtr.recordset && insertDtr.recordset[0] && insertDtr.recordset[0].dtrID;
    if (!dtrID) {
      return res.status(500).json({ error: 'Failed to insert DTR record' });
    }

    // insert relationship into staffDTR
    await pool.request()
      .input('dtrID', sql.Int, dtrID)
      .input('staffID', sql.NVarChar(50), staffID)
      .query('INSERT INTO ailyn.staffDTR (dtrID, staffID) VALUES (@dtrID, @staffID)');

    res.json({ message: 'DTR record and staffDTR relationship saved successfully!' });
  } catch (err) {
    console.error('POST /save_dtr error', err);
    res.status(500).json({ error: 'Database error: ' + (err.message || err) });
  }
});
// ...existing code...
app.get('/getDtrDates', async (req, res) => {
  const staffID = req.query.StaffID ?? req.query.staffID;
  if (!staffID) return res.status(400).json({ error: 'StaffID not provided' });

  try {
    const id = parseInt(staffID, 10);
    const request = pool.request();
    if (!Number.isNaN(id)) {
      request.input('StaffID', sql.Int, id);
    } else {
      request.input('StaffID', sql.NVarChar(50), staffID);
    }

    // return dates as YYYY-MM-DD strings
    const result = await request.query(
      "SELECT DISTINCT CONVERT(varchar(10), Date, 23) AS Date FROM ailyn.dtr WHERE StaffID = @StaffID ORDER BY Date DESC"
    );

    const dates = (result.recordset || []).map(r => r.Date);
    res.json(dates);
  } catch (err) {
    console.error('GET /getDtrDates error', err);
    res.status(500).json({ error: 'Failed to fetch DTR dates: ' + (err.message || err) });
  }
});
// ...existing code...
// ensure urlencoded bodies are parsed (for form posts)
app.use(express.urlencoded({ extended: true }));

app.post('/addcommission', async (req, res) => {
  const body = req.body || {};
  const staffID = body.staffID ?? body.StaffID;
  const dateStr = body.date;
  const totalSales = body.total_sales ?? body.total_sales_per_day ?? body.totalSales;
  const totalCommission = body.total_commission ?? body.total_commission_per_day ?? body.totalCommission;

  if (!staffID || !dateStr) {
    return res.status(400).json({ success: false, message: 'staffID and date are required' });
  }

  const parsedDate = new Date(dateStr);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD' });
  }

  const salesNum = parseFloat(totalSales) || 0;
  const commNum = parseFloat(totalCommission) || 0;

  try {
    // check existing commission for staffID + date
    const check = await pool.request()
      .input('staffID', sql.NVarChar(50), staffID)
      .input('date', sql.Date, parsedDate)
      .query('SELECT Commission_ID FROM ailyn.commissions WHERE StaffID = @staffID AND Date = @date');

    if (check.recordset && check.recordset.length) {
      return res.json({ success: false, message: 'Commission for this date has already been added.' });
    }

    // insert commission and get id
    const insert = await pool.request()
      .input('staffID', sql.NVarChar(50), staffID)
      .input('date', sql.Date, parsedDate)
      .input('totalSales', sql.Decimal(18, 2), salesNum)
      .input('totalCommission', sql.Decimal(18, 2), commNum)
      .query(`
        DECLARE @out TABLE (CommissionID INT);
        INSERT INTO ailyn.commissions (StaffID, Date, total_sales_per_day, total_commission_per_day)
        OUTPUT inserted.Commission_ID INTO @out
        VALUES (@staffID, @date, @totalSales, @totalCommission);
        SELECT CommissionID FROM @out;
      `);

    const commissionID = insert.recordset && insert.recordset[0] && insert.recordset[0].CommissionID;
    if (!commissionID) {
      return res.status(500).json({ success: false, message: 'Failed to insert commission' });
    }

    // insert mapping into StaffCommission
    await pool.request()
      .input('commissionID', sql.Int, commissionID)
      .input('staffID', sql.NVarChar(50), staffID)
      .query('INSERT INTO ailyn.StaffCommission (Commission_ID, StaffID) VALUES (@commissionID, @staffID)');

    res.json({ success: true, message: 'Commission and StaffCommission added successfully', commissionID });
  } catch (err) {
    console.error('POST /addcommission error', err);
    res.status(500).json({ success: false, message: 'Database error: ' + (err.message || err) });
  }
});

// ...existing code...
app.get('/commissions', async (req, res) => {
  const branch = req.query.branch ?? '';
  const staffID = req.query.staffID ?? '';

  try {
    const request = pool.request();
    let sqlText = `
      SELECT
        c.Commission_ID,
        c.StaffID,
        s.Fname,
        s.Lname,
        CONVERT(varchar(10), c.Date, 23) AS Date,
        c.total_sales_per_day,
        c.total_commission_per_day,
        d.dtrID AS DTRID
      FROM ailyn.commissions c
      JOIN ailyn.staff s ON c.StaffID = s.StaffID
      LEFT JOIN ailyn.dtr d
        ON d.StaffID = c.StaffID
        AND CONVERT(varchar(10), d.Date, 23) = CONVERT(varchar(10), c.Date, 23)
      WHERE s.Status = 'Active'
    `;

    if (branch) {
      request.input('branch', sql.NVarChar(150), branch);
      sqlText += ' AND s.Branch = @branch';
    }
    if (staffID) {
      request.input('staffID', sql.NVarChar(50), staffID);
      sqlText += ' AND c.StaffID = @staffID';
    }

    sqlText += ' ORDER BY c.Date DESC';

    const result = await request.query(sqlText);
    const rows = result.recordset || [];

    const commissions = rows.map(row => {
      const FullName = `${row.Fname ?? ''} ${row.Lname ?? ''}`.trim();
      const { Fname, Lname, ...rest } = row;
      return { ...rest, FullName };
    });

    res.json(commissions);
  } catch (err) {
    console.error('GET /commissions error', err);
    res.status(500).json({ error: 'Failed to fetch commissions: ' + (err.message || err) });
  }
});
// ...existing code...

app.get('/fetchPayrollData', async (req, res) => {
  const branch = req.query.branch ?? '';
  if (!branch) return res.status(400).json({ error: 'Branch is required' });

  try {
    const result = await pool.request()
      .input('branch', sql.NVarChar(150), branch)
      .query(`
        SELECT
          s.StaffID,
          d.dtrID AS DTRID,
          c.Commission_ID,
          CONVERT(varchar(10), d.Date, 23) AS dtr_date,
          c.total_commission_per_day
        FROM ailyn.staff s
        LEFT JOIN ailyn.dtr d ON s.StaffID = d.StaffID
        LEFT JOIN ailyn.commissions c ON s.StaffID = c.StaffID
        WHERE s.StaffID IS NOT NULL
          AND d.dtrID IS NOT NULL
          AND c.Commission_ID IS NOT NULL
          AND s.Branch = @branch
        ORDER BY d.Date DESC
      `);

    res.json(result.recordset || []);
  } catch (err) {
    console.error('GET /fetchPayrollData error', err);
    res.status(500).json({ error: 'Failed to fetch payroll data: ' + (err.message || err) });
  }
});
app.post('/savePayroll', async (req, res) => {
  const data = req.body || {};

  // Make Commission_ID and DTRID optional — require StaffID, Pay_Date, Allowance, Debt, Total, ReasonDebt
  const required = ['StaffID', 'Pay_Date', 'Allowance', 'Debt', 'Total', 'ReasonDebt'];
  const missing = required.filter(f => !(f in data));
  if (missing.length) return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}` });

  // normalize / validate (Commission_ID and DTRID optional)
  const StaffID = String(data.StaffID);
  const DTRID = ('DTRID' in data) ? parseInt(data.DTRID, 10) : null;
  const Commission_ID = ('Commission_ID' in data) ? parseInt(data.Commission_ID, 10) : null;
  const Pay_Date = new Date(data.Pay_Date);
  const Allowance = parseFloat(data.Allowance);
  const Debt = parseFloat(data.Debt);
  const Total = parseFloat(data.Total);
  const ReasonDebt = String(data.ReasonDebt);

  if (isNaN(Pay_Date.getTime()) || Number.isNaN(Allowance) || Number.isNaN(Debt) || Number.isNaN(Total)) {
    return res.status(400).json({ success: false, message: 'Invalid numeric/date fields' });
  }

  try {
    const reqDb = pool.request()
      .input('StaffID', sql.NVarChar(50), StaffID)
      .input('DTRID', sql.Int, Number.isNaN(parseInt(DTRID, 10)) ? null : DTRID)
      .input('Commission_ID', sql.Int, Number.isNaN(parseInt(Commission_ID, 10)) ? null : Commission_ID)
      .input('Pay_Date', sql.Date, Pay_Date)
      .input('Allowance', sql.Decimal(18, 2), Allowance)
      .input('Debt', sql.Decimal(18, 2), Debt)
      .input('Total', sql.Decimal(18, 2), Total)
      .input('ReasonDebt', sql.NVarChar(500), ReasonDebt);

    // use OUTPUT INTO because payroll table has triggers
    const result = await reqDb.query(`
      DECLARE @out TABLE (payrollID INT);
      INSERT INTO ailyn.payroll
        (StaffID, DTRID, Commission_ID, Pay_Date, Allowance, Debt, Total, ReasonDebt)
      OUTPUT inserted.PayrollID INTO @out
      VALUES (@StaffID, @DTRID, @Commission_ID, @Pay_Date, @Allowance, @Debt, @Total, @ReasonDebt);
      SELECT payrollID FROM @out;
    `);

    const payrollID = result.recordset && result.recordset[0] && result.recordset[0].payrollID;
    res.json({ success: true, message: 'Payroll data saved successfully!', payrollID });
  } catch (err) {
    console.error('POST /savePayroll error', err);
    res.status(500).json({ success: false, message: 'Database error: ' + (err.message || err) });
  }
});
// ...existing code...
app.get('/staffTotals', async (req, res) => {
  const branch = req.query.branch ?? '';
  if (!branch) return res.status(400).json({ error: 'branch is required' });

  try {
    const result = await pool.request()
      .input('branch', sql.NVarChar(150), branch)
      .query(`
        SELECT
          s.StaffID,
          s.Fname,
          s.Lname,
          s.Address,
          s.Email,
          s.Sex,
          s.ContactNumber,
          ISNULL(SUM(c.total_sales_per_day), 0) AS TotalSales,
          ISNULL(SUM(c.total_commission_per_day), 0) AS TotalCommission,
          ISNULL(SUM(p.Debt), 0) AS TotalDebt
        FROM ailyn.staff s
        LEFT JOIN ailyn.commissions c ON s.StaffID = c.StaffID
        LEFT JOIN ailyn.payroll p ON s.StaffID = p.StaffID
        WHERE s.status = 'Active' AND s.branch = @branch
        GROUP BY s.StaffID, s.Fname, s.Lname, s.Address, s.Email, s.Sex, s.ContactNumber
        ORDER BY s.Fname, s.Lname
      `);

    res.json(result.recordset || []);
  } catch (err) {
    console.error('GET /staffTotals error', err);
    res.status(500).json({ error: 'Failed to fetch staff totals: ' + (err.message || err) });
  }
});
// ...existing code...
app.get('/graph', async (req, res) => {
  try {
    // sales & commission by month (YYYY-MM)
    const scResult = await pool.request().query(`
      SELECT
        CONVERT(varchar(7), c.Date, 23) AS month,
        ISNULL(SUM(c.total_sales_per_day), 0) AS sales,
        ISNULL(SUM(c.total_commission_per_day), 0) AS commission
      FROM ailyn.commissions c
      JOIN ailyn.staff s ON s.StaffID = c.StaffID
      WHERE s.Status = 'Active'
      GROUP BY CONVERT(varchar(7), c.Date, 23)
      ORDER BY month
    `);

    // debt by month (YYYY-MM)
    const dResult = await pool.request().query(`
      SELECT
        CONVERT(varchar(7), Pay_Date, 23) AS month,
        ISNULL(SUM(Debt), 0) AS debt
      FROM ailyn.payroll
      GROUP BY CONVERT(varchar(7), Pay_Date, 23)
      ORDER BY month
    `);

    const sales = (scResult.recordset || []).map(r => ({ month: r.month, sales: Number(r.sales) }));
    const commissions = (scResult.recordset || []).map(r => ({ month: r.month, commission: Number(r.commission) }));
    const debt = (dResult.recordset || []).map(r => ({ month: r.month, debt: Number(r.debt) }));

    res.json({ sales, commissions, debt });
  } catch (err) {
    console.error('GET /graph error', err);
    res.status(500).json({ error: 'Failed to build graph data: ' + (err.message || err) });
  }
});
// ...existing code...
// ...existing code...
app.get(['/health', '/status'], (req, res) => res.json({ status: 'ok' }));

const PORT = 3001;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));